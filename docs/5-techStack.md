# Technical stack

## Core external libraries

We use [React](https://reactjs.org/) as a rendering library. Most of the state is stored in [Redux](https://redux.js.org/) store.

Most of the business logic is written by using [Redux-saga](https://redux-saga.js.org/).

[Redux-form](https://redux-form.com/) is used to map forms to redux state and handle validation and submit.

[React-intl](https://www.npmjs.com/package/react-intl) is used for the app localization.

We use [redux-first-router](https://github.com/faceyspacey/redux-first-router/) as a routing library to keep redux store as the only source of truth and be able to change URL parameters from sagas.

[c3js](https://github.com/c3js/c3) and [chart.js](https://www.chartjs.org/) are used for displaying widgets.

[axios](https://axios-http.com/docs/intro) used as HTTP client.

## Core internal libraries

The common reusable components built based on RP Design System are provided via [@reportportal/ui-kit](https://github.com/reportportal/ui-kit).
