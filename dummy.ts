// github.issues.createComment({
//     issue_number: context.issue.number,
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     body: '👋 Thanks for reporting!'
// })

module.exports = ({ _github, context }: any) => {
    return context.payload.client_payload.value
}