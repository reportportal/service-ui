## PR Checklist

* [ ] Have you verified that the PR is pointing to the correct target branch? (`develop` for features/bugfixes, other if mentioned in the task)
* [ ] Have you verified that your branch is consistent with the target branch and has no conflicts? (if not, make a rebase under the target branch)
* [ ] Have you checked that everything works within the branch according to the task description and tested it locally?
* [ ] Have you run the linter (`npm run lint`) prior to submission? Enable the git hook on commit in your IDE to run it and format the code automatically.
* [ ] Have you run the tests locally and added/updated them if needed?
* [ ] Have you checked that app can be built (`npm run build`)?
* [ ] Have you checked that no new circular dependencies appreared with your changes? (the webpack plugin reports circular dependencies within the `dev` npm script)
* [ ] Have you made sure that all the necessary pipelines has been successfully completed?
* [ ] If the task requires translations to be updated, have you done this by running the `manage:translations` script?
* [ ] Have you added the link to the PR to the Jira ticket description?

## Visuals

<!-- OPTIONAL
  Provide the visual proof (screenshot/gif/video) of your work
-->
