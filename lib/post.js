"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const util_1 = require("util");
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