/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as storybook from '@storybook/react';
import { setOptions } from '@storybook/addon-options';
import { setIntlConfig, withIntl } from 'storybook-addon-intl';
import 'reset-css/reset.css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';
import 'c3/c3.css';

import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';
import be from 'react-intl/locale-data/be';

import localeRU from '../localization/translated/ru.json';
import localeBE from '../localization/translated/be.json';

import { Provider } from 'react-redux';
import { store } from './store';

const messages = {
  ru: localeRU,
  be: localeBE,
};
addLocaleData([...en, ...ru, ...be]);
setIntlConfig({
  locales: ['en', 'ru', 'be'],
  defaultLocale: 'en',
  getMessages: (lang) => {
    return messages[lang];
  },
});

const req = require.context('../src', true, /\.stories\.jsx?$/);

function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

setOptions({
  /**
   * name to display in the top left corner
   * @type {String}
   */
  name: 'Report Portal',
  /**
   * URL for name in top left corner to link to
   * @type {String}
   */
  url: '#',
  /**
   * show story component as full screen
   * @type {Boolean}
   */
  goFullScreen: false,
  /**
   * display left panel that shows a list of stories
   * @type {Boolean}
   */
  showLeftPanel: true,
  /**
   * display horizontal panel that displays addon configurations
   * @type {Boolean}
   */
  showDownPanel: true,
  /**
   * display floating search box to search through stories
   * @type {Boolean}
   */
  showSearchBox: false,
  /**
   * show horizontal addons panel as a vertical panel on the right
   * @type {Boolean}
   */
  downPanelInRight: false,
  /**
   * sorts stories
   * @type {Boolean}
   */
  sortStoriesByKind: false,
  /**
   * regex for finding the hierarchy separator
   * @example:
   *   null - turn off hierarchy
   *   /\// - split by `/`
   *   /\./ - split by `.`
   *   /\/|\./ - split by `/` or `.`
   * @type {Regex}
   */
  hierarchySeparator: '/',

  /**
   * sidebar tree animations
   * @type {Boolean}
   */
  sidebarAnimations: false,

  /**
   * id to select an addon panel
   * @type {String}
   */
  selectedAddonPanel: undefined, // The order of addons in the "Addons Panel" is the same as you import them in 'addons.js'. The first panel will be opened by default as you run Storybook
});

storybook.addDecorator((story) => <Provider store={store}>{story()}</Provider>);
storybook.addDecorator(withIntl);
storybook.configure(loadStories, module);
