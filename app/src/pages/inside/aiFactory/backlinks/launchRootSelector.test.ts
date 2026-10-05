/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { isRootLaunchParentSelector } from 'controllers/testItem/selectors';

const selectRootState = (parentItems: unknown[]) =>
  isRootLaunchParentSelector({ testItem: { parentItems } });

describe('isRootLaunchParentSelector', () => {
  test.each([
    ['TEST children', [{ id: 1, type: 'LAUNCH' }]],
    ['STEP children', [{ id: 1, type: 'LAUNCH' }]],
    ['SUITE children', [{ id: 1, type: 'LAUNCH' }]],
  ])('identifies a root Launch while listing direct %s', (_name, parentItems) => {
    expect(selectRootState(parentItems)).toBe(true);
  });

  test('fails closed when root data is empty', () => {
    expect(selectRootState([])).toBe(false);
  });

  test.each([
    [
      'TEST children',
      [
        { id: 1, type: 'LAUNCH' },
        { id: 2, type: 'SUITE' },
      ],
    ],
    [
      'STEP children',
      [
        { id: 1, type: 'LAUNCH' },
        { id: 2, type: 'SUITE' },
      ],
    ],
    [
      'nested SUITE children',
      [
        { id: 1, type: 'LAUNCH' },
        { id: 2, type: 'SUITE' },
      ],
    ],
  ])('rejects a nested suite while listing %s', (_name, parentItems) => {
    expect(selectRootState(parentItems)).toBe(false);
  });
});
