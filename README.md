# github-mutex

Experiment with github actions that control one-run-at-a-time

Inspired by https://github.com/marketplace/actions/label-mutex

Github Typescript Action: https://github.com/actions/typescript-action

action.yaml docs at https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/metadata-syntax-for-github-actions

Github actions toolkit packages:
https://github.com/actions/toolkit/blob/master/README.md#packages

user adds `e2e:requested`
action runs:

-   search for `e2e:running`
-   if `e2e:running` found -> update this pr to `e2e:queued` and stop
-   if no `e2e:running` found:
    -   update this pr to `e2e:running`
    -   wait couple of seconds, verify if we are still the only one running, if not update to `e2e:queued` and abort
    -   continue with job (that runs e2e)
    -   post action:
        -   remove `e2e:running` from current pr regardless of action outcome (success or failure)
        -   find `e2e:queued` pr's. If found, select random? candidate and update that label to `e2e:requested` with different token to trigger action

Respond to:

-   labeled
-   unlabeled
