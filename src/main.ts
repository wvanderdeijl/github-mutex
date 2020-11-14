import * as core from '@actions/core'
import * as github from '@actions/github'
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
        const pulls = await octokit.pulls.list({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        });
        core.info(JSON.stringify(pulls.data, undefined, 4));

    } catch (error) {
        core.error(`error occured: ${error.message}`)
        core.setFailed(error)
    }
}

run();
