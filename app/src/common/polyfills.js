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

/* eslint-disable */

import 'array.find';
import 'array.findindex';
import 'promise-polyfill/src/polyfill';
import 'polyfill-array-includes';
import areIntlLocalesSupported from 'intl-locales-supported';

// NodeList.prototype.forEach (https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#Polyfill)
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function(callback, thisArg) {
    thisArg = thisArg || window;
    for (let i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

if (!Object.fromEntries) {
  Object.fromEntries = function fromEntries(entries) {
    var res = {};
    for (var i = 0; i < entries.length; i++) res[entries[i][0]] = entries[i][1];
    return res;
  };
}

// Chrome Intl doesn't support 'be' locale, so we have to manually apply polyfill in this case
export const polyfillLocales = () =>
  new Promise((resolve) => {
    if (
      window.Intl.PluralRules &&
      window.Intl.RelativeTimeFormat &&
      areIntlLocalesSupported(['en', 'uk', 'ru', 'be'])
    ) {
      resolve();
      return;
    }
    require.ensure(
      [
        '@formatjs/intl-pluralrules/dist/core',
        '@formatjs/intl-pluralrules/dist/locale-data/en.js',
        '@formatjs/intl-pluralrules/dist/locale-data/uk.js',
        '@formatjs/intl-pluralrules/dist/locale-data/ru.js',
        '@formatjs/intl-pluralrules/dist/locale-data/be.js',
        '@formatjs/intl-relativetimeformat/dist/core',
        '@formatjs/intl-relativetimeformat/dist/locale-data/en.js',
        '@formatjs/intl-relativetimeformat/dist/locale-data/uk.js',
        '@formatjs/intl-relativetimeformat/dist/locale-data/ru.js',
        '@formatjs/intl-relativetimeformat/dist/locale-data/be.js',
      ],
      (require) => {
        const { PluralRules } = require('@formatjs/intl-pluralrules/dist/core');
        window.Intl.PluralRules = PluralRules;
        require('@formatjs/intl-pluralrules/dist/locale-data/en.js');
        require('@formatjs/intl-pluralrules/dist/locale-data/uk.js');
        require('@formatjs/intl-pluralrules/dist/locale-data/ru.js');
        require('@formatjs/intl-pluralrules/dist/locale-data/be.js');

        const {
          default: RelativeTimeFormat,
        } = require('@formatjs/intl-relativetimeformat/dist/core');
        window.Intl.RelativeTimeFormat = RelativeTimeFormat;
        require('@formatjs/intl-relativetimeformat/dist/locale-data/en.js');
        require('@formatjs/intl-relativetimeformat/dist/locale-data/uk.js');
        require('@formatjs/intl-relativetimeformat/dist/locale-data/ru.js');
        require('@formatjs/intl-relativetimeformat/dist/locale-data/be.js');
        resolve();
      },
    );
  });
