"use strict";
// github.issues.createComment({
//     issue_number: context.issue.number,
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     body: '👋 Thanks for reporting!'
// })
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (args) => {
    console.log(Object.keys(args));
    console.log(`core: ${'core' in global} ${typeof global.core}`);
    console.log(`io: ${'io' in global} ${typeof global.io}`);
    // core.warning(JSON.stringify(args.context.payload, undefined, 4));
    return 'foo';
    // return args.context.payload.client_payload.value
};
