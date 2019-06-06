# Installation and running

## Starting dev server

For development, you need a [node.js](https://nodejs.org).

1.  open console from the project root
1.  run the command `cd app`
1.  run the command `npm install`
1.  to proxy requests to the server, create `.env` file in `app` folder

    ```
    PROXY_PATH=http://your_server:port/
    ```

    _You can use our inner dev instance. To get the link, visit our Knowledge Base from the "Links" section._

1.  run the command `npm run dev`
1.  visit `http://localhost:3000`
1.  enjoy the development

## npm commands

`npm run lint` - syntax and formatting check with eslint

`npm run format` - reformat js, scss and md using eslint and prettier

`npm run dev` - launch the development environment (default url is `http://localhost:3000`)

`npm run build` - build the product version in the `dist` folder

`npm run storybook` - launch the development environment for storybook (default url is `http://localhost:9001`)

`npm run test` - single run all tests

`npm run test:watch` - run tests when changing files

`npm run manage:translations` - checking the relevance of localization
