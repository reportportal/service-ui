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

export function getTicketUrlId(str) {
  const pattern = /(http|https):\/\/[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-.,@?^=%&;:/~+#]*[a-z0-9\-@?^=%&;/~+#])?/i;
  const index = str.search(pattern);
  const id = str.slice(0, index - 1);
  const url = str.slice(index);

  return index > 0 && id ? { id, url } : null;
}
