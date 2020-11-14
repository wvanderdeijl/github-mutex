// github.issues.createComment({
//     issue_number: context.issue.number,
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     body: '👋 Thanks for reporting!'
// })

// github A pre-authenticated octokit/core.js client with REST endpoints and pagination plugins
// context An object containing the context of the workflow run
// core A reference to the @actions/core package
// io A reference to the @actions/io package

import type { GitHub } from '@actions/github/lib/utils';
import type { context } from '@actions/github'
import type Core from '@actions/core';
import type Io from '@actions/io';

type Octokit = InstanceType<typeof GitHub>
type Context = typeof context;

interface Arguments {
    github: Octokit;
    context: Context;
    core: typeof Core;
    io: typeof Io;
}

module.exports = (args: Arguments) => {
    args.core.warning(JSON.stringify(args.context.payload, undefined, 4));
    return 'foo';
    // return args.context.payload.client_payload.value
}
