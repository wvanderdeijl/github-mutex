"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resubmit = exports.markCompleted = exports.markRunning = exports.markQueued = exports.findQueuedPullRequests = exports.findRunningPullRequests = exports.getRunRequestedPayload = exports.STATE_TOKEN = void 0;
const core = require("@actions/core");
const github = require("@actions/github");
exports.STATE_TOKEN = 'github-mutex-started';
const labelRequested = core.getInput('labelRequested');
const labelQueued = core.getInput('labelQueued');
const labelRunning = core.getInput('labelRunning');
const STATE_LABELS = [labelQueued, labelRunning];
const token = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(token);
function getRunRequestedPayload() {
    const action = github.context.payload.action;
    if (action == null) {
        core.warning('could not find type of action in payload');
        return;
    }
    if (action !== 'labeled' && action !== 'unlabeled') {
        core.warning(`triggered by action '${action}' while this should only be configured for ...`);
        return;
    }
    const payload = github.context.payload;
    const { label } = payload;
    if (label == null) {
        core.warning('could not find label in action payload');
        return;
    }
    core.debug(`action ${action} for label ${label.name} in pr ${payload.pull_request.number} with labels ${payload.pull_request.labels.map((l) => l.name).join(',')}`);
    if ((action === 'labeled' && label.name === labelRequested) ||
        (action === 'unlabeled' &&
            label.name === labelRunning &&
            payload.pull_request.labels.find((l) => l.name === labelRequested) != null)) {
        return payload.pull_request;
    }
}
exports.getRunRequestedPayload = getRunRequestedPayload;
async function findRunningPullRequests() {
    // TODO: querystring encoding
    return await findPullRequests(`label:${labelRunning}`);
}
exports.findRunningPullRequests = findRunningPullRequests;
async function findQueuedPullRequests() {
    // TODO: querystring encoding
    return await findPullRequests(`label:${labelRequested}+label:${labelQueued}`);
}
exports.findQueuedPullRequests = findQueuedPullRequests;
async function findPullRequests(query) {
    // TODO: querystring encoding
    const q = `is:pr+${query}`;
    core.debug(`getting pull request with query ${q}`);
    const prs = await octokit.search.issuesAndPullRequests({ q });
    core.debug(`found pull requests: ${JSON.stringify(prs.data.items.map((v) => v.number))}`);
    return prs.data.items;
}
async function markQueued(pr) {
    await markState(pr, labelQueued);
}
exports.markQueued = markQueued;
async function markRunning(pr) {
    await markState(pr, labelRunning);
}
exports.markRunning = markRunning;
async function markCompleted(pr) {
    await octokit.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr.number,
        name: labelRunning,
    });
}
exports.markCompleted = markCompleted;
async function resubmit(prNumber) {
    const token = core.getInput('PERSONAL_TOKEN');
    const octokit = github.getOctokit(token);
    await octokit.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: prNumber,
        name: labelQueued,
    });
}
exports.resubmit = resubmit;
async function markState(pr, label) {
    await octokit.issues.setLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr.number,
        labels: [...pr.labels.map((l) => l.name).filter((l) => !STATE_LABELS.includes(l)), label],
    });
}
//# sourceMappingURL=utils.js.map