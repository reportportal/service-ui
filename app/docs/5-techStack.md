# Technical stack

We use [React](https://reactjs.org/) as a rendering library. Most of the state is stored in [Redux](https://redux.js.org/) store.

Most of the business logic is written by using [Redux-saga](https://redux-saga.js.org/).

[Redux-form](https://redux-form.com/) is used to map forms to redux state and handle validation and submit.

[React-intl](https://github.com/yahoo/react-intl) is used for the app localization.

We use [redux-first-router](https://github.com/faceyspacey/redux-first-router/) as a routing library to keep redux store as the only source of truth and be able to change URL parameters from sagas.

[react-c3js](https://github.com/bcbcarl/react-c3js) is used for displaying widgets.

[Storybook](https://storybook.js.org/) is used in development for component visualization in different states.
