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

export function range(start = 0, stop, step = 1) {
  if (arguments.length <= 1) {
    stop = start; // eslint-disable-line
  }

  const length = Math.max(Math.ceil((stop - start) / step), 0);
  let idx = 0;
  const arr = new Array(length);

  while (idx < length) {
    arr[idx++] = start; // eslint-disable-line
    start += step; // eslint-disable-line
  }

  return arr;
}
