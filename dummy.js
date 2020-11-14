"use strict";
// github.issues.createComment({
//     issue_number: context.issue.number,
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     body: '👋 Thanks for reporting!'
// })
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import type Core from '@actions/core';
// import type Io from '@actions/io';
const core_1 = __importDefault(require("@actions/core"));
const io_1 = __importDefault(require("@actions/io"));
module.exports = (args) => {
    console.log(Object.keys(args));
    console.log(`core: ${!!core_1.default} ${typeof core_1.default}`);
    console.log(`io: ${!!io_1.default} ${typeof io_1.default}`);
    core_1.default.warning(JSON.stringify(args.context.payload, undefined, 4));
    return 'foo';
    // return args.context.payload.client_payload.value
};
