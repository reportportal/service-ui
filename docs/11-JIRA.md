# JIRA

## Task workflow

To track bugs, handle tasks and agile project management we are using EPAM's JIRA system.

You can get invitation to ReportPortal workspace from Scrum Masters or Delivery Manager.

Once you'll get some tasks, after planning session, workflow is:

1.  Move in 'In Progress' column.
1.  Work on task.
1.  Send Pull Request (next PR) in GitHub.
1.  Add the PR link to the task comments.
1.  Change task status to "Code review" in JIRA.
1.  Wait (work with other tasks) until you PR will be reviewed.
1.  If your Pull Request rejected and requires changes, you should fix it and repeat that step until your PR will be approved, merged and changes will be deployed to the server.
1.  When your PR becomes merged, change task status to "Testing".
1.  Add the UI image tag (can be found in the summary of the latest GitHub Action executed after the merge) to the task comments.
1.  If you task becomes reopened please repeat 2-8 steps, until your task will pass QA check.

> If some task requires some discussion with team or additional requirements you can use `TBD` label and `[TBD]` prefix.

## GitHub issues

It's important to us to sort issues from users on GitHub, but this should be done as part of a Jira ticket.

Thus, each issue that requires effort from a team member must be submitted to Jira as a ticket and must be within a sprint.
