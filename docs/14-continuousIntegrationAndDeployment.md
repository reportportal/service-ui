# Continuous integration and deployment

## Continuous integration

The project has a GitHub Actions workflow set up (see `./.github/workflows/build.yml`).

This workflow is run every time any changes are pushed or a new Pull Request is created to the `master` or `develop` branch.

It contains the following steps:
 
1.  install a supported version of Node.js
1.  build the application
1.  run static code analysis
1.  run tests and check code coverage

**Note:** If any of the mentioned steps fail, the entire build will be marked as failed and it will block the merge PR until this is fixed.

## Deployment

Once a PR is merged, it can be deployed to a ReportPortal development instance. (can be found on [EPAM KB](https://kb.epam.com/display/EPMRPP/Knowledge+Transfer)).

We are using Jenkins to build and deploy the application (the link can also be found on KB).
