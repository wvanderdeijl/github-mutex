"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchLabel = exports.removeLabel = exports.findPullRequestsByLabel = exports.getLabeledPayload = exports.STATE_TOKEN = void 0;
const github = require("@actions/github");
const core = require("@actions/core");
exports.STATE_TOKEN = 'github-mutex-started';
const token = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(token);
function getLabeledPayload(label) {
    var _a, _b;
    if (github.context.payload.action !== 'labeled') {
        core.debug(`nothing to do for action ${github.context.action}`);
        return;
    }
    const payload = github.context.payload;
    if (((_a = payload.label) === null || _a === void 0 ? void 0 : _a.name) !== label) {
        core.debug(`nothing to do for action ${github.context.action} with label ${(_b = payload.label) === null || _b === void 0 ? void 0 : _b.name}`);
        return;
    }
    return payload;
}
exports.getLabeledPayload = getLabeledPayload;
async function findPullRequestsByLabel(label) {
    core.debug(`getting pull request with label ${label}`);
    const prs = await octokit.search.issuesAndPullRequests({ q: `is:pr+label:${label}` });
    core.debug(`pull requests that currently have label ${label}: ${JSON.stringify(prs.data.items.map(v => v.number))}`);
    return prs.data.items;
}
exports.findPullRequestsByLabel = findPullRequestsByLabel;
async function removeLabel(prNumber, label) {
    core.debug(`removing label ${label} from ${prNumber}`);
    await octokit.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: prNumber,
        name: label,
    });
}
exports.removeLabel = removeLabel;
async function switchLabel(pr, from, to, client = octokit) {
    core.debug(`removing label ${from} and adding label ${to} for pull request ${pr.number}`);
    await client.issues.setLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr.number,
        labels: [
            ...pr.labels.map(l => l.name).filter(l => l !== from),
            to,
        ],
    });
}
exports.switchLabel = switchLabel;
//# sourceMappingURL=utils.js.map