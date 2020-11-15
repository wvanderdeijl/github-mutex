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
        core.debug(new Date().toTimeString());
        core.setOutput('Time', new Date().toTimeString());
        const token = core.getInput('GITHUB_TOKEN');
        const octokit = github.getOctokit(token);
        const running = await findPullRequestsByLabel(labelRunning);
        core.debug(`PR's that currently have label ${labelRunning}: ${running.map(v => v.number)}`);
        if (running.length) {
            core.debug(`replacing label ${labelRequested} with ${labelQueued} for PR ${payload.pull_request.number}`);
            await octokit.issues.setLabels({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: payload.pull_request.number,
                labels: [
                    ...payload.pull_request.labels.map(l => l.name).filter(l => l !== labelRequested),
                    labelQueued,
                ],
            });
        }
        else {
        }
        // const prs = await octokit.search.issuesAndPullRequests({q:'is:pr+is:open+label:e2e:request'});
        const prs = await octokit.search.issuesAndPullRequests({ q: `is:pr+label:${labelRequested}` });
        core.debug(JSON.stringify(prs.data.items, undefined, 4));
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
        async function findPullRequestsByLabel(label) {
            core.debug(`getting pull request with label ${label}`);
            const prs = await octokit.search.issuesAndPullRequests({ q: `is:pr+label:${label}` });
            return prs.data.items;
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