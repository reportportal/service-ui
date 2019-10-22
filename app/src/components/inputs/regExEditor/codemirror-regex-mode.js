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

/* eslint-disable no-plusplus */
export const regExpMode = () => {
  // eslint-disable-next-line no-useless-escape
  const QUANTIFIERS = /[\^\$\.\+\?\*]/;
  let groupLevel = 0;
  const tokenBase = (stream) => {
    const ch = stream.next();
    switch (ch) {
      case '\\':
        if (stream.match(/./, false)) {
          if (stream.match(/u\w{4}/) || stream.match(/x\w{2}/) || stream.match(/c\w/))
            return 'simbol';
          if (stream.match(/[dDwWsStrnvf0b.]/)) return 'spec';
          if (stream.match(QUANTIFIERS) || stream.match(/\\/)) return 'escaped';
          return 'simbol';
        }
        break;
      case '{':
        if (stream.match(/(\d+|\d+,\d*)\}/)) return 'quantifier';
        break;
      case '[':
        if (stream.match(/[^\]]+\]/)) return 'range';
        break;
      case '|':
        return `group${groupLevel}`;
      case '(':
        return `group${++groupLevel % 5}`;
      case ')':
        if (groupLevel - 1 < 0) return 'err';
        return `group${groupLevel-- % 5}`;
      default:
        if (QUANTIFIERS.test(ch)) {
          return 'quantifier';
        }
    }
    return '';
  };

  return {
    startState: () => {
      groupLevel = 0;
    },
    token: tokenBase,
  };
};
