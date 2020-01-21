# Pull Requests

Regarding work with Pull Requests (next PR), we are following [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow principles.

Every UI developer should fork our [GitHub repository](https://github.com/reportportal/service-ui) and also have one copy locally.

Repositories definitions:

- _`upstream`_ - remote repository of Report Portal.
- _`origin`_ - your remote forked version of _`upstream`_.
- _`local`_ - copy on your local machine.

Main branches:

- `master` - release branch.
- `v5` - main work branch.

Main code reviewer is our key UI developer [Maxim Tumas](https://telescope.epam.com/who/Maxim_Tumas). His code review is mandatory for each PR. But every developer and contributor are able to provide review for others PRs, it will be very helpful for us.

Commits and PRs naming format - `JIRA task id: Short task description` (for example "EPMRPP123: Awesome functionality implementation.")
All existing PRs you can find [here](https://github.com/reportportal/service-ui/pulls).

Critical amount of PRs is 10. It's means that Code Review task gets a highest priority for our key UI developer.

> It's recommended to define equal names for PR and its main commit.

At the moment you start develop a new feature, please follow next steps:

1.  fetch latest changes from _`upstream`_.
2.  checkout a new branch from _`upstream/v5`_. Define convenient for you name.
3.  start develop feature.
4.  if during feature development you've made more then 1 commit, please squash them into single one. Name it as described above.
5.  fetch latest changes from _`upstream`_ again and **rebase** you branch onto _`upstream/v5`_.
6.  resolve conflicts if they are exist.
7.  push changes into _`origin`_. Define convenient for you remote branch name.
8.  send a PR from _`origin`_ into _`upstream/v5`_. Name it as described above.
9.  add code reviewers. [DiscoElevator](https://github.com/DiscoElevator) is required.

Steps for fixes after Code Review process:

1.  checkout branch of corresponding feature.
2.  make all fixes related to Code Review comments.
3.  commit them with name "`Jira task id`: Code Review fixes - `i`.". `i` - number of Code Review round.
4.  fetch latest changes from _`upstream`_ again and rebase you branch onto _`upstream/v5`_.
5.  resolve conflicts if they are exist.
6.  force changes into _`origin`_ feature branch.
7.  PR should be updated automatically.

> Please try to keep you feature branch up-to-date with _`upstream/v5`_ during whole precess of implementation.

> After your PR will be merged, you are able to delete feature branches from _`local`_ and _`origin`_.
