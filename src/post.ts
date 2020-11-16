import * as core from '@actions/core';
import * as github from '@actions/github';
import { inspect } from 'util';
import { findPullRequestsByLabel, getLabeledPayload, removeLabel, STATE_TOKEN, switchLabel } from './utils';

async function run(): Promise<void> {
    try {
        const labelRequested = core.getInput('labelRequested');
        const labelQueued = core.getInput('labelQueued');
        const labelRunning = core.getInput('labelRunning');

        if (core.getState(STATE_TOKEN) !== 'true') {
            core.debug(`state was not transitioned to running; no post action to perform`);
            return;
        }
        const payload = getLabeledPayload(labelRequested);
        if (payload == null) {
            // TODO: log label?
            core.debug(`nothing to do in post for action ${github.context.action}`);
            return;
        }

        await removeLabel(payload.pull_request.number, labelRunning);

        if ((await findPullRequestsByLabel(labelRequested)).length > 0) {
            core.debug(`pull requests found with label ${labelRequested}; let them pick next winner`);
            return;
        }
        const queued = await findPullRequestsByLabel(labelQueued);
        if (queued.length === 0) {
            core.debug(`no pull requests with label ${labelQueued}, so no next candidate`);
            return;
        }
        const luckyOne = queued[Math.floor(Math.random() * queued.length)];
        core.debug(
            `going to start pull request ${luckyOne.number} out of candidates: ${JSON.stringify(
                queued.map((p) => p.number)
            )}`
        );
        // TODO: use other token so this triggers action
        const token = core.getInput('PERSONAL_TOKEN');
        const octokit = github.getOctokit(token);
        await switchLabel(luckyOne, labelQueued, labelRequested, octokit);
    } catch (error) {
        // HttpError
        // core.error(`error occured: ${error.message}`);
        core.error(inspect(error));
        core.setFailed(error instanceof Error ? error : `unknown error: ${String(error)}`);
    }
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
