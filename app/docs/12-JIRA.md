# JIRA

To track bugs, handle tasks and agile project management we are using EPAM's JIRA system.

You can get invitation to Report Portal workspace from [Dzmitry Humianiuk](https://telescope.epam.com/who/Dzmitry_Humianiuk) or [Julia Moiseyenkova](https://telescope.epam.com/who/Julia_Moiseyenkova).

Once you'll get some tasks, after planning session, workflow is:

1.  Estimate it in hours.
1.  Move in 'In Progress' column.
1.  Each day you should log your work in hours until task will be completed.
1.  Send Pull Request (next PR) in GitHub.
1.  Change task status to "Code review" in JIRA.
1.  Wait (work with other tasks) until you PR will be reviewed.
1.  If your Pull Request rejected and requires changes, you should fix it, log time and repeat that step until your PR will be approved, merged and changes will be deployed to the server.
1.  When your PR becomes merged, change task status to "Testing".
1.  If you task becomes reopened please repeat 2-8 steps, until your task will pass QA check.

> If some task requires some discussion with team or additional requirements you can use `TBD` label and `[TBD]` prefix.
