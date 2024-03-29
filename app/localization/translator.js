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

import { parse } from 'intl-messageformat-parser';
import * as fs from 'fs';
import { sync as globSync } from 'glob';
import { sync as mkdirpSync } from 'mkdirp';

const MESSAGES_PATTERN = './localization/messages/**/*.json';
const LANG_DIR = './localization/translated/';

const ESCAPED_CHARS = {
  '\\': '\\\\',
  '\\#': '\\#',
  '{': '\\{',
  '}': '\\}',
};

const ESAPE_CHARS_REGEXP = /\\#|[{}\\]/g;

export default function printICUMessage(ast) {
  return ast.elements.reduce((message, el) => {
    const { format, id, type, value } = el;

    if (type === 'messageTextElement') {
      return message + value.replace(ESAPE_CHARS_REGEXP, char => ESCAPED_CHARS[char]);
    }

    if (!format) {
      return `${message}{${id}}`;
    }

    const formatType = format.type.replace(/Format$/, '');

    let style,
      offset,
      options;

    switch (formatType) {
      case 'number':
      case 'date':
      case 'time':
        style = format.style ? `, ${format.style}` : '';
        return `${message}{${id}, ${formatType}${style}}`;

      case 'plural':
      case 'selectOrdinal':
      case 'select':
        offset = format.offset ? `, offset:${format.offset}` : '';
        options = format.options.reduce((str, option) => {
          const optionValue = printICUMessage(option.value);
          return `${str} ${option.selector} {${optionValue}}`;
        }, '');
        return `${message}{${id}, ${formatType}${offset},${options}}`;
    }
  }, '');
}

class Translator {
  constructor(translateText) {
    this.translateText = translateText;
  }

  translate(message) {
    const ast = parse(message);
    const translated = this.transform(ast);
    return print(translated);
  }

  transform(ast) {
    ast.elements.forEach((el) => {
      if (el.type === 'messageTextElement') {
        el.value = this.translateText(el.value);
      } else {
        const options = el.format?.options;
        if (options) {
          options.forEach(option => this.transform(option.value));
        }
      }
    });

    return ast;
  }
}

const defaultMessages = globSync(MESSAGES_PATTERN)
  .map(filename => fs.readFileSync(filename, 'utf8'))
  .map(file => JSON.parse(file))
  .reduce((collection, descriptors) => {
    descriptors.forEach(({ id, defaultMessage }) => {
      if (collection.hasOwnProperty(id)) {
        throw new Error(`Duplicate message id: ${id}`);
      }

      collection[id] = defaultMessage;
    });

    return collection;
  }, {});

mkdirpSync(LANG_DIR);
fs.writeFileSync(`${LANG_DIR}en.json`, JSON.stringify(defaultMessages, null, 2));
