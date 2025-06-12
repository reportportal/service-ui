/*
 *  Copyright 2021 EPAM Systems
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

module.exports = {
  setupFiles: ['./jestsetup.js'],
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': 'identity-obj-proxy',
    '^.+\\.(svg|jpg|jpeg|png|gif)$': '<rootDir>/test/__mocks__/fileMock.js',
    '^components[/](.+)': '<rootDir>/src/components/$1',
    '^controllers[/](.+)': '<rootDir>/src/controllers/$1',
    '^common[/](.+)': '<rootDir>/src/common/$1',
    '^pages[/](.+)': '<rootDir>/src/pages/$1',
    '^store[/](.+)': '<rootDir>/src/store/$1',
    '^routes[/](.+)': '<rootDir>/src/routes/$1',
    '^layouts[/](.+)': '<rootDir>/src/layouts/$1',
  },
  notify: false,
  collectCoverageFrom: [
    'src/common/**/*.js',
    '!src/common/urls.js',
    '!src/common/polyfills.js',
    '!src/common/hooks/*.js',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testEnvironment: 'jsdom',
};
