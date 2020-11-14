import * as core from '@actions/core'
import * as github from '@actions/github'
import { inspect } from 'util'
import { wait } from './wait'

async function run(): Promise<void> {
    try {
        const ms: string = core.getInput('milliseconds')
        core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

        core.debug(new Date().toTimeString())
        await wait(parseInt(ms, 10))
        core.debug(new Date().toTimeString())

        core.setOutput('time', new Date().toTimeString())

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
        const updated = await octokit.pulls.update({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: 1,
            title: new Date().toISOString(),
            headers: {
                'If-Match': etag,
            },
        });
        core.info(`update statis: ${updated.status}`);

    } catch (error) {
        // HttpError
        core.error(`error occured: ${error.message}`);
        core.error(inspect(error));
        core.setFailed(error)
    }
}

run();
