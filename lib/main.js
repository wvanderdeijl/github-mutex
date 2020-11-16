"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const util_1 = require("util");
const utils_1 = require("./utils");
// core.saveState("pidToKill", 12345);
// var pid = core.getState("pidToKill");
async function run() {
    var _a;
    try {
        const pr = utils_1.getRunRequestedPayload();
        if (pr == null) {
            // TODO: log label?
            core.debug(`nothing to do for action ${(_a = github.context.payload.action) !== null && _a !== void 0 ? _a : 'unknown'}`);
            return;
        }
        let running = await utils_1.findRunningPullRequests();
        if (running.length > 0) {
            core.debug('found PR that is already running; queue this PR for later execution');
            await utils_1.markQueued(pr);
            core.setFailed('found other running pull requests');
        }
        else {
            await utils_1.markRunning(pr);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            running = await utils_1.findRunningPullRequests();
            if (!(running.length === 1 && running[0].number === pr.number)) {
                // race condition as other PR has also changed to running
                await utils_1.markQueued(pr);
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
        // core.error(`error occured: ${error.message}`);
        core.error(util_1.inspect(error));
        core.setFailed(error instanceof Error ? error : `unknown error: ${String(error)}`);
    }
}
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=main.js.map