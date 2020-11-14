import type { GitHub } from '@actions/github/lib/utils';
import type { context as actionsContext } from '@actions/github'
import type Core from '@actions/core';
import type Io from '@actions/io';
// import core from '@actions/core';
// import io from '@actions/io';

declare const github: typeof GitHub;
declare const context: typeof actionsContext;
declare const core: typeof Core;
declare const io: typeof Io;

console.log('github', Object.keys(github));
console.log('context', Object.keys(context));
console.log('core', Object.keys(core));
console.log('io', Object.keys(io));
