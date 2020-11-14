"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const wait_1 = require("./wait");
async function run() {
    try {
        const ms = core.getInput('milliseconds');
        core.debug(`Waiting ${ms} milliseconds ...`); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
        core.debug(new Date().toTimeString());
        await wait_1.wait(parseInt(ms, 10));
        core.debug(new Date().toTimeString());
        core.setOutput('time', new Date().toTimeString());
        const token = core.getInput('GITHUB_TOKEN');
        // core.info(token);
        const octokit = github.getOctokit(token);
        const pulls = await octokit.pulls.list();
        core.info(JSON.stringify(pulls.data, undefined, 4));
    }
    catch (error) {
        core.error(`error occured: ${error.message}`);
        core.setFailed(error);
    }
}
run();
//# sourceMappingURL=main.js.map