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

import { clampFolderTreeWidth, getStoredFolderTreeWidth } from './useResizableFolderTree';

describe('resizable folder tree width', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('clampFolderTreeWidth keeps the width between 360 and 700', () => {
    expect(clampFolderTreeWidth(100)).toBe(360);
    expect(clampFolderTreeWidth(360)).toBe(360);
    expect(clampFolderTreeWidth(512.4)).toBe(512);
    expect(clampFolderTreeWidth(700)).toBe(700);
    expect(clampFolderTreeWidth(1200)).toBe(700);
  });

  test('getStoredFolderTreeWidth returns the default without a user or a stored value', () => {
    expect(getStoredFolderTreeWidth(undefined)).toBe(360);
    expect(getStoredFolderTreeWidth('user1')).toBe(360);
  });

  test('getStoredFolderTreeWidth reads the user settings and clamps the value', () => {
    localStorage.setItem('user1_settings', JSON.stringify({ tmsFolderTreeWidth: 480 }));
    localStorage.setItem('user2_settings', JSON.stringify({ tmsFolderTreeWidth: 9999 }));
    localStorage.setItem('user3_settings', JSON.stringify({ tmsFolderTreeWidth: 'wide' }));

    expect(getStoredFolderTreeWidth('user1')).toBe(480);
    expect(getStoredFolderTreeWidth('user2')).toBe(700);
    expect(getStoredFolderTreeWidth('user3')).toBe(360);
  });
});
