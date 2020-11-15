import * as core from '@actions/core'
import * as github from '@actions/github'
import { EventPayloads, WebhookEvent, WebhookEvents } from '@octokit/webhooks'
import type { EventTypesPayload } from '@octokit/webhooks/dist-types/generated/get-webhook-payload-type-from-event'
import { inspect } from 'util'
import { findPullRequestsByLabel, getLabeledPayload, removeLabel, STATE_TOKEN, switchLabel } from './utils'

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
        if (!payload) {
            // TODO: log label?
            core.debug(`nothing to do for action ${github.context.action}`);
            return;
        }

        await removeLabel(payload.pull_request.number, labelRunning);

        if ((await findPullRequestsByLabel(labelRequested)).length) {
            // let request PR pick its spot
            return;
        }
        const queued = await findPullRequestsByLabel(labelQueued);
        if (!queued.length) {
            return;
        }
        const luckyOne = queued[Math.floor(Math.random() * queued.length)];
        // TODO: use other token so this triggers action
        await switchLabel(luckyOne, labelQueued, labelRequested);
    } catch (error) {
        // HttpError
        core.error(`error occured: ${error.message}`);
        core.error(inspect(error));
        core.setFailed(error)
    }
}

run();
