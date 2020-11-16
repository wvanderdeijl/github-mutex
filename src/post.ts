import * as core from '@actions/core';
import * as github from '@actions/github';
import { inspect } from 'util';
import { findQueuedPullRequests, getRunRequestedPayload, markCompleted, resubmit, STATE_TOKEN } from './utils';

async function run(): Promise<void> {
    try {
        if (core.getState(STATE_TOKEN) !== 'true') {
            core.debug(`state was not transitioned to running; no post action to perform`);
            return;
        }
        // TODO: get from state??
        const pr = getRunRequestedPayload();
        if (pr == null) {
            // TODO: log label?
            core.debug(`nothing to do in post for action ${github.context.payload.action ?? 'unknown'}`);
            return;
        }

        await markCompleted(pr);

        const queued = await findQueuedPullRequests();
        if (queued.length === 0) {
            core.debug(`no queued pull requests found`);
            return;
        }
        const luckyOne = queued[Math.floor(Math.random() * queued.length)];
        core.debug(`going to start pull request ${luckyOne.number} out of candidates: ${stringifyNumbers(queued)}`);
        await resubmit(luckyOne.number);
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

function stringifyNumbers(prs: Array<{ number: number }>): string {
    return JSON.stringify(prs.map((p) => p.number));
}
