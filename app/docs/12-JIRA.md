# JIRA

To track bugs, handle tasks and agile project management we are using EPAM's JIRA system.

You can get invitation to Report Portal workspace from [Dzmitry Humianiuk](https://telescope.epam.com/who/Dzmitry_Humianiuk) or [Julia Moiseyenkova](https://telescope.epam.com/who/Julia_Moiseyenkova).

Once you'll get some tasks, after planning session, workflow is:

1. Estimate it in hours.
2. Move in 'In Progress' column.
3. Each day you should log your work in hours until task will be completed.
4. Send Pull Request (next PR) in GitHub.
5. Add `DNT` label to task in JIRA.
6. Modify task name in JIRA by adding `[DNT]` prefix in start of name string.
7. Move task to `QA-Testing` column.
8. Wait (work with other tasks) until you PR will be reviewed.
9. If you Pull Request rejected and requires changes, you should fix it, log time and repeat that step until your PR will be approved, merged and changes will be deployed to the server.
10. Remove `DNT` label and `[DNT]` prefix from your JIRA task.
11. If you task becomes reopened please repeat 2-10 steps, until your task will pass QA check.

> If some task requires some discussion with team or additional requirements you can use `TBD` label and `[TBD]` prefix.
