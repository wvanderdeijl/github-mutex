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
        core.info(JSON.stringify(github.context, undefined, 4));
        if (github.context.action !== 'labeled') {
            core.debug(`nothing to do for action ${github.context.action}`);
        }
        const payload = github.context.payload;
        if (((_a = payload.label) === null || _a === void 0 ? void 0 : _a.name) !== labelRequested) {
            core.debug(`nothing to do for action ${github.context.action} with label ${(_b = payload.label) === null || _b === void 0 ? void 0 : _b.name}`);
        }
        core.debug(new Date().toTimeString());
        core.setOutput('Time', new Date().toTimeString());
        const token = core.getInput('GITHUB_TOKEN');
        // core.info(token);
        const octokit = github.getOctokit(token);
        // const pulls = await octokit.pulls.list({
        //     owner: github.context.repo.owner,
        //     repo: github.context.repo.repo,
        // });
        // core.info(JSON.stringify(pulls.data, undefined, 4));
        const pr = await octokit.pulls.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: 1,
        });
        const etag = pr.headers.etag;
        core.info(`etag: ${etag}`);
        // core.info(JSON.stringify(pr.headers, undefined, 4));
        // core.info(JSON.stringify(pr.data, undefined, 4));
        // using `If-Match` with wrong etag will respond with http error 412
        // const updated = await octokit.pulls.update({
        //     owner: github.context.repo.owner,
        //     repo: github.context.repo.repo,
        //     pull_number: 1,
        //     title: new Date().toISOString(),
        //     // headers: {
        //     //     'If-Match': etag,
        //     // },
        // });
        // core.info(`update statis: ${updated.status}`);
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