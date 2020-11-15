"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const util_1 = require("util");
// core.saveState("pidToKill", 12345);
// var pid = core.getState("pidToKill");
async function run() {
    var _a, _b;
    try {
        const labelRequested = core.getInput('labelRequested');
        const labelQueued = core.getInput('labelQueued');
        const labelRunning = core.getInput('labelRunning');
        // core.info(JSON.stringify(github.context, undefined, 4));
        if (github.context.payload.action !== 'labeled') {
            core.debug(`nothing to do for action ${github.context.action}`);
        }
        const payload = github.context.payload;
        if (((_a = payload.label) === null || _a === void 0 ? void 0 : _a.name) !== labelRequested) {
            core.debug(`nothing to do for action ${github.context.action} with label ${(_b = payload.label) === null || _b === void 0 ? void 0 : _b.name}`);
        }
        core.debug(JSON.stringify(github.context, undefined, 4));
        // core.setOutput('Time', new Date().toTimeString())
        const token = core.getInput('GITHUB_TOKEN');
        const octokit = github.getOctokit(token);
        const running = await findPullRequestsByLabel(labelRunning);
        core.debug(`PR's that currently have label ${labelRunning}: ${running.map(v => v.number)}`);
        if (running.length) {
            core.debug('found PR that is already running; queue this PR');
            core.debug(`replacing label ${labelRequested} with ${labelQueued} for PR ${payload.pull_request.number}`);
            await switchLabel(labelRequested, labelQueued);
        }
        else {
            await switchLabel(labelRequested, labelRunning);
            await new Promise(resolve => setTimeout(resolve, 5000));
            const newRunning = await findPullRequestsByLabel(labelRunning);
            if (!(newRunning.length === 1 && newRunning[0].number === payload.pull_request.number)) {
                // race condition as other PR has also changed to running
                await switchLabel(labelRunning, labelQueued);
                // TODO: fail or output?
                return;
            }
            // TODO: continue with job
            // TODO: post-action
        }
        async function findPullRequestsByLabel(label) {
            core.debug(`getting pull request with label ${label}`);
            const prs = await octokit.search.issuesAndPullRequests({ q: `is:pr+label:${label}` });
            return prs.data.items;
        }
        async function switchLabel(from, to) {
            await octokit.issues.setLabels({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: payload.pull_request.number,
                labels: [
                    ...payload.pull_request.labels.map(l => l.name).filter(l => l !== from),
                    to,
                ],
            });
        }
    }
    catch (error) {
        // HttpError
        core.error(`error occured: ${error.message}`);
        core.error(util_1.inspect(error));
        core.setFailed(error);
    }
}
run();
//# sourceMappingURL=main.js.map