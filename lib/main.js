"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
// import github from '@actions/github'
const wait_1 = require("./wait");
async function run() {
    try {
        const ms = core_1.default.getInput('milliseconds');
        core_1.default.debug(`Waiting ${ms} milliseconds ...`); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
        core_1.default.debug(new Date().toTimeString());
        await wait_1.wait(parseInt(ms, 10));
        core_1.default.debug(new Date().toTimeString());
        core_1.default.setOutput('time', new Date().toTimeString());
        const token = core_1.default.getInput('GITHUB_TOKEN');
        core_1.default.info(token);
        // const octokit = github.getOctokit(token);
        // const pulls = await octokit.pulls.list();
        // core.info(JSON.stringify(pulls.data, undefined, 4));
    }
    catch (error) {
        core_1.default.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=main.js.map