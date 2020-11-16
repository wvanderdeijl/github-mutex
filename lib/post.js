"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const util_1 = require("util");
const utils_1 = require("./utils");
async function run() {
    try {
        if (core.getState(utils_1.STATE_TOKEN) !== 'true') {
            core.debug(`state was not transitioned to running; no post action to perform`);
            return;
        }
        // TODO: get from state??
        const pr = utils_1.getRunRequestedPayload();
        if (pr == null) {
            // TODO: log label?
            core.debug(`nothing to do in post for action ${github.context.action}`);
            return;
        }
        await utils_1.markCompleted(pr);
        const queued = await utils_1.findQueuedPullRequests();
        if (queued.length === 0) {
            core.debug(`no queued pull requests found`);
            return;
        }
        const luckyOne = queued[Math.floor(Math.random() * queued.length)];
        core.debug(`going to start pull request ${luckyOne.number} out of candidates: ${stringifyNumbers(queued)}`);
        await utils_1.resubmit(luckyOne.number);
    }
    catch (error) {
        // HttpError
        // core.error(`error occured: ${error.message}`);
        core.error(util_1.inspect(error));
        core.setFailed(error instanceof Error ? error : `unknown error: ${String(error)}`);
    }
}
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
function stringifyNumbers(prs) {
    return JSON.stringify(prs.map((p) => p.number));
}
//# sourceMappingURL=post.js.map