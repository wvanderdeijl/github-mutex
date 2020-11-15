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

        core.debug(JSON.stringify(github.context, undefined, 4));
    } catch (error) {
        // HttpError
        core.error(`error occured: ${error.message}`);
        core.error(inspect(error));
        core.setFailed(error)
    }
}

run();
