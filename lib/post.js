"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const util_1 = require("util");
const utils_1 = require("./utils");
async function run() {
    try {
        const labelRequested = core.getInput('labelRequested');
        const labelQueued = core.getInput('labelQueued');
        const labelRunning = core.getInput('labelRunning');
        if (core.getState(utils_1.STATE_TOKEN) !== 'true') {
            core.debug(`state was not transitioned to running; no post action to perform`);
            return;
        }
        const payload = utils_1.getLabeledPayload(labelRequested);
        if (!payload) {
            // TODO: log label?
            core.debug(`nothing to do in post for action ${github.context.action}`);
            return;
        }
        await utils_1.removeLabel(payload.pull_request.number, labelRunning);
        if ((await utils_1.findPullRequestsByLabel(labelRequested)).length) {
            core.debug(`pull requests found with label ${labelRequested}; let them pick next winner`);
            return;
        }
        const queued = await utils_1.findPullRequestsByLabel(labelQueued);
        if (!queued.length) {
            core.debug(`no pull requests with label ${labelQueued}, so no next candidate`);
            return;
        }
        const luckyOne = queued[Math.floor(Math.random() * queued.length)];
        core.debug(`going to start pull request ${luckyOne.number} out of candidates: ${JSON.stringify(queued.map(p => p.number))}`);
        // TODO: use other token so this triggers action
        await utils_1.switchLabel(luckyOne, labelQueued, labelRequested);
    }
    catch (error) {
        // HttpError
        core.error(`error occured: ${error.message}`);
        core.error(util_1.inspect(error));
        core.setFailed(error);
    }
}
run();
//# sourceMappingURL=post.js.map