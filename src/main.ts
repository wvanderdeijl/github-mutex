import * as core from '@actions/core'
import * as github from '@actions/github'
import { EventPayloads, WebhookEvent, WebhookEvents } from '@octokit/webhooks'
import type { EventTypesPayload } from '@octokit/webhooks/dist-types/generated/get-webhook-payload-type-from-event'
import { inspect } from 'util'

async function run(): Promise<void> {
    try {
        const labelRequested = core.getInput('labelRequested');
        const labelQueued = core.getInput('labelQueued');
        const labelRunning = core.getInput('labelRunning');

        // core.info(JSON.stringify(github.context, undefined, 4));
        if (github.context.payload.action !== 'labeled') {
            core.debug(`nothing to do for action ${github.context.action}`);
        }
        const payload = github.context.payload as EventPayloads.WebhookPayloadPullRequest;
        if (payload.label?.name !== labelRequested) {
            core.debug(`nothing to do for action ${github.context.action} with label ${payload.label?.name}`);
        }

        core.debug(new Date().toTimeString())

        core.setOutput('Time', new Date().toTimeString())

        const token = core.getInput('GITHUB_TOKEN');
        // core.info(token);
        const octokit = github.getOctokit(token);
        core.debug(`getting pull request with label ${labelRequested}`);
        // const prs = await octokit.search.issuesAndPullRequests({q:'is:pr+is:open+label:e2e:request'});
        const prs = await octokit.search.issuesAndPullRequests({ q: 'is:pr+label:e2e:request' });
        core.debug(JSON.stringify(prs.data.items));
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

        // async function findByLabel(label: string) {
        //     octokit.pulls.
        //     const pulls = await octokit.pulls.list({
        //         owner: github.context.repo.owner,
        //         repo: github.context.repo.repo,

        //     });
        // }
    } catch (error) {
        // HttpError
        core.error(`error occured: ${error.message}`);
        core.error(inspect(error));
        core.setFailed(error)
    }
}

run();
