# ReportPortal ui-service

[![Build Status](https://semaphoreci.com/api/v1/lexecon/rp_service-ui/branches/develop/shields_badge.svg)](https://semaphoreci.com/lexecon/rp_service-ui)

# Project Setup Note

**Important**: This project is primarily developed in the `app` directory. When using an IDE or code editor, it is recommended to open the project from the `app` folder to ensure proper configuration and dependency resolution.

## Installation

For local development, you need a [node.js](https://nodejs.org)(version 20 is recommended).

To launch the development environment, follow these steps:

1.  open console from the project root
2.  run the command `cd app`
3.  run the command `npm install --legacy-peer-deps`
4.  to proxy requests to the server, create `.env` file in `app` folder

    ```
    PROXY_PATH=http://your_server:port/
    ```

5.  run the command `npm run dev`
6.  enjoy the development.

## All npm commands

`npm run lint` - syntax and formatting check with eslint

`npm run format` - reformat js, scss and md using eslint and prettier

`npm run dev` - launch the development environment

`npm run build` - build the product version in the `dist` folder

`npm run test` - single run all tests

`npm run test:watch` - run tests when changing files

`npm run manage:translations` - checking the relevance of localization

## Technology

Used technology stack: [React](https://reactjs.org/), [Redux](https://redux.js.org/)

## Development Tools

- [why-did-you-update](https://github.com/maicki/why-did-you-update) - tool for checking why certain component rerender.

To use it add to the url ?whyDidYouUpdateComponent=^Component\$ (with regex as query value)

**before:** http://localhost:3000/#artem/launches

**after:** http://localhost:3000/?whyDidYouUpdateComponent=^ComponentName$#artem/launches

## Localization

The application uses `react-intl` to support different localizations. On the ways of implementation can be read [here](https://github.com/yahoo/react-intl/wiki).

> **Note:**
>
> It is not allowed to manually add or remove localization keys in files `/localization/translated/**`. Run the script `npm run manage:translations` and it will add and remove localization keys, you will only need to replace the translation.
