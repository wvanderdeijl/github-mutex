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
    args.core.warning(JSON.stringify(args.context.payload, undefined, 4));
    return 'foo';
    // return args.context.payload.client_payload.value
};
