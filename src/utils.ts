import * as core from '@actions/core';
import * as github from '@actions/github';
import { EventPayloads } from '@octokit/webhooks';
import { SearchIssuesAndPullRequestsResponseData } from '@octokit/types';

export const STATE_TOKEN = 'github-mutex-started';

const labelRequested = core.getInput('labelRequested');
const labelQueued = core.getInput('labelQueued');
const labelRunning = core.getInput('labelRunning');
const STATE_LABELS = [labelQueued, labelRunning];

const token = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(token);

export type PullRequest = EventPayloads.WebhookPayloadPullRequestPullRequest;

export function getRunRequestedPayload(): PullRequest | undefined {
    const action = github.context.payload.action;
    if (action == null) {
        core.warning('could not find type of action in payload');
        return;
    }
    if (action !== 'labeled' && action !== 'unlabeled') {
        core.warning(`triggered by action '${action}' while this should only be configured for ...`);
        return;
    }
    const payload = github.context.payload as EventPayloads.WebhookPayloadPullRequest;
    const { label } = payload;
    if (label == null) {
        core.warning('could not find label in action payload');
        return;
    }
    core.debug(
        `action ${action} for label ${label.name} in pr ${
            payload.pull_request.number
        } with labels ${payload.pull_request.labels.map((l) => l.name).join(',')}`
    );
    if (
        (action === 'labeled' && label.name === labelRequested) ||
        (action === 'unlabeled' &&
            label.name === labelRunning &&
            payload.pull_request.labels.find((l) => l.name === labelRequested) != null)
    ) {
        return payload.pull_request;
    }
}

export async function findRunningPullRequests(): Promise<SearchIssuesAndPullRequestsResponseData['items']> {
    // TODO: querystring encoding
    return await findPullRequests(`label:${labelRunning}`);
}

export async function findQueuedPullRequests(): Promise<SearchIssuesAndPullRequestsResponseData['items']> {
    // TODO: querystring encoding
    return await findPullRequests(`label:${labelRequested}+label:${labelQueued}`);
}

async function findPullRequests(query: string): Promise<SearchIssuesAndPullRequestsResponseData['items']> {
    // TODO: querystring encoding
    const q = `is:pr+${query}`;
    core.debug(`getting pull request with query ${q}`);
    const prs = await octokit.search.issuesAndPullRequests({ q });
    core.debug(`found pull requests: ${JSON.stringify(prs.data.items.map((v) => v.number))}`);
    return prs.data.items;
}

export async function markQueued(pr: PullRequest): Promise<void> {
    await markState(pr, labelQueued);
}

export async function markRunning(pr: PullRequest): Promise<void> {
    await markState(pr, labelRunning);
}

export async function markCompleted(pr: PullRequest): Promise<void> {
    await octokit.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr.number,
        name: labelRunning,
    });
}

export async function resubmit(prNumber: number): Promise<void> {
    const token = core.getInput('PERSONAL_TOKEN');
    const octokit = github.getOctokit(token);
    await octokit.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: prNumber,
        name: labelQueued,
    });
}

async function markState(pr: PullRequest, label: string): Promise<void> {
    await octokit.issues.setLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr.number,
        labels: [...pr.labels.map((l) => l.name).filter((l) => !STATE_LABELS.includes(l)), label],
    });
}
