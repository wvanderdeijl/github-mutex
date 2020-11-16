import * as core from '@actions/core';
import * as github from '@actions/github';
import { inspect } from 'util';
import { findRunningPullRequests, getRunRequestedPayload, markQueued, markRunning, STATE_TOKEN } from './utils';

// core.saveState("pidToKill", 12345);
// var pid = core.getState("pidToKill");

async function run(): Promise<void> {
    try {
        const pr = getRunRequestedPayload();
        if (pr == null) {
            // TODO: log label?
            core.debug(`nothing to do for action ${github.context.payload.action ?? 'unknown'}`);
            return;
        }

        let running = await findRunningPullRequests();
        if (running.length > 0) {
            core.debug('found PR that is already running; queue this PR for later execution');
            await markQueued(pr);
            core.setFailed('found other running pull requests');
        } else {
            await markRunning(pr);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            running = await findRunningPullRequests();
            if (!(running.length === 1 && running[0].number === pr.number)) {
                // race condition as other PR has also changed to running
                await markQueued(pr);
                // TODO: fail or output?
                return;
            }
            // TODO: continue with job
            // TODO: post-action
            core.saveState(STATE_TOKEN, 'true');
        }
    } catch (error: unknown) {
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
