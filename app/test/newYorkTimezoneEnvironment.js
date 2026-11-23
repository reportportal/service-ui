/*
 * Copyright 2026 EPAM Systems
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

const { TestEnvironment } = require('jest-environment-jsdom');

// Runs a test file in the America/New_York timezone (west of UTC). The test sandbox only gets a copy
// of process.env, so the timezone has to be set on the worker process here and restored afterwards.
class NewYorkTimezoneEnvironment extends TestEnvironment {
  async setup() {
    this.originalTz = process.env.TZ;
    process.env.TZ = 'America/New_York';
    await super.setup();
  }

  async teardown() {
    if (this.originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = this.originalTz;
    }
    await super.teardown();
  }
}

module.exports = NewYorkTimezoneEnvironment;
