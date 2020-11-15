"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const util_1 = require("util");
const utils_1 = require("./utils");
// core.saveState("pidToKill", 12345);
// var pid = core.getState("pidToKill");
async function run() {
    try {
        const labelRequested = core.getInput('labelRequested');
        const labelQueued = core.getInput('labelQueued');
        const labelRunning = core.getInput('labelRunning');
        const payload = utils_1.getLabeledPayload(labelRequested);
        if (!payload) {
            // TODO: log label?
            core.debug(`nothing to do for action ${github.context.action}`);
            return;
        }
        // core.debug(JSON.stringify(github.context, undefined, 4));
        // core.setOutput('Time', new Date().toTimeString())
        // const token = core.getInput('GITHUB_TOKEN');
        // const octokit = github.getOctokit(token);
        const running = await utils_1.findPullRequestsByLabel(labelRunning);
        if (running.length) {
            core.debug('found PR that is already running; queue this PR');
            core.debug(`replacing label ${labelRequested} with ${labelQueued} for PR ${payload.pull_request.number}`);
            await utils_1.switchLabel(payload.pull_request, labelRequested, labelQueued);
            core.setFailed('found other running pull requests');
        }
        else {
            await utils_1.switchLabel(payload.pull_request, labelRequested, labelRunning);
            await new Promise(resolve => setTimeout(resolve, 5000));
            const newRunning = await utils_1.findPullRequestsByLabel(labelRunning);
            if (!(newRunning.length === 1 && newRunning[0].number === payload.pull_request.number)) {
                // race condition as other PR has also changed to running
                await utils_1.switchLabel(payload.pull_request, labelRunning, labelQueued);
                // TODO: fail or output?
                return;
            }
            // TODO: continue with job
            // TODO: post-action
            core.saveState(utils_1.STATE_TOKEN, 'true');
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