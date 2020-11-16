import * as core from '@actions/core';
import * as github from '@actions/github';
import { EventPayloads } from '@octokit/webhooks';
import { SearchIssuesAndPullRequestsResponseData } from '@octokit/types';

export const STATE_TOKEN = 'github-mutex-started';

const token = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(token);

export function getLabeledPayload(label: string): EventPayloads.WebhookPayloadPullRequest | undefined {
    if (github.context.payload.action !== 'labeled') {
        core.debug(`nothing to do for action ${github.context.action}`);
        return;
    }
    const payload = github.context.payload as EventPayloads.WebhookPayloadPullRequest;
    if (payload.label?.name != null && payload.label?.name !== label) {
        core.debug(`nothing to do for action ${github.context.action} with label ${payload.label?.name}`);
        return;
    }
    return payload;
}

export async function findPullRequestsByLabel(
    label: string
): Promise<SearchIssuesAndPullRequestsResponseData['items']> {
    core.debug(`getting pull request with label ${label}`);
    const prs = await octokit.search.issuesAndPullRequests({ q: `is:pr+label:${label}` });
    core.debug(
        `pull requests that currently have label ${label}: ${JSON.stringify(prs.data.items.map((v) => v.number))}`
    );
    return prs.data.items;
}

export async function removeLabel(prNumber: number, label: string): Promise<void> {
    core.debug(`removing label ${label} from ${prNumber}`);
    await octokit.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: prNumber,
        name: label,
    });
}

export async function switchLabel(
    pr: { number: number; labels: Array<{ name: string }> },
    from: string,
    to: string,
    client = octokit
): Promise<void> {
    core.debug(`removing label ${from} and adding label ${to} for pull request ${pr.number}`);
    await client.issues.setLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr.number,
        labels: [...pr.labels.map((l) => l.name).filter((l) => l !== from), to],
    });
}
