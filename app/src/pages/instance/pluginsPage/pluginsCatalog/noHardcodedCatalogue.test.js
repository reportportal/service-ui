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

import fs from 'fs';
import path from 'path';

const SRC = path.resolve(__dirname, '../../../..');
const SOURCE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

const sourceFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return sourceFiles(full);
    }

    return SOURCE_EXTENSIONS.includes(path.extname(entry.name)) && full !== __filename
      ? [full]
      : [];
  });

const filesContaining = (pattern) =>
  sourceFiles(SRC)
    .filter((file) => pattern.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(SRC, file));

/**
 * Which plugins exist, what they are called, what they cost and where they are documented are
 * facts of the registry, and GET /v1/plugins is the only thing that states them. A second copy
 * compiled into the bundle cannot be kept true: it goes stale the moment the registry publishes
 * a plugin, and the screen then disagrees with the service it is showing.
 */
describe('the plugin catalogue is registry-sourced', () => {
  test('no module ships a plugin catalogue of its own', () => {
    expect(filesContaining(/AVAILABLE_PLUGINS_CATALOG/)).toEqual([]);
  });

  // documentation links are per-plugin registry metadata; a hardcoded one is a catalogue entry
  // however it is spelled
  test('no module carries plugin metadata the registry publishes', () => {
    expect(filesContaining(/github\.com\/reportportal\/plugin-/)).toEqual([]);
  });
});
