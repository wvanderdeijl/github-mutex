import * as core from '@actions/core'
import * as github from '@actions/github'
import { EventPayloads, WebhookEvent, WebhookEvents } from '@octokit/webhooks'
import type { EventTypesPayload } from '@octokit/webhooks/dist-types/generated/get-webhook-payload-type-from-event'
import { inspect } from 'util'
import { findPullRequestsByLabel, getLabeledPayload, STATE_TOKEN, switchLabel } from './utils'

// core.saveState("pidToKill", 12345);
// var pid = core.getState("pidToKill");

async function run(): Promise<void> {
    try {
        const labelRequested = core.getInput('labelRequested');
        const labelQueued = core.getInput('labelQueued');
        const labelRunning = core.getInput('labelRunning');

        const payload = getLabeledPayload(labelRequested);
        if (!payload) {
            // TODO: log label?
            core.debug(`nothing to do for action ${github.context.action}`);
            return;
        }

        core.debug(JSON.stringify(github.context, undefined, 4));
        // core.setOutput('Time', new Date().toTimeString())

        // const token = core.getInput('GITHUB_TOKEN');
        // const octokit = github.getOctokit(token);

        const running = await findPullRequestsByLabel(labelRunning);
        core.debug(`PR's that currently have label ${labelRunning}: ${running.map(v => v.number)}`)
        if (running.length) {
            core.debug('found PR that is already running; queue this PR');
            core.debug(`replacing label ${labelRequested} with ${labelQueued} for PR ${payload.pull_request.number}`);
            await switchLabel(payload.pull_request, labelRequested, labelQueued);
        } else {
            await switchLabel(payload.pull_request, labelRequested, labelRunning);
            await new Promise(resolve => setTimeout(resolve, 5000));
            const newRunning = await findPullRequestsByLabel(labelRunning);
            if (!(newRunning.length === 1 && newRunning[0].number === payload.pull_request.number)) {
                // race condition as other PR has also changed to running
                await switchLabel(payload.pull_request, labelRunning, labelQueued);
                // TODO: fail or output?
                return;
            }
            // TODO: continue with job
            // TODO: post-action
            core.saveState(STATE_TOKEN, 'true');
        }
    } catch (error) {
        // HttpError
        core.error(`error occured: ${error.message}`);
        core.error(inspect(error));
        core.setFailed(error)
    }
}

run();
