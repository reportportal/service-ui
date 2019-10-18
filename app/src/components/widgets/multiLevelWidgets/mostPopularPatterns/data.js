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

export const attributes = [
  {
    label: 'ios',
    value: 'ios',
  },
  {
    label: 'linux',
    value: 'linux',
  },
];

export const level1 = {
  owner: 'superadmin',
  share: false,
  id: 382,
  name: 'patterns',
  widgetType: 'topPatternTemplates',
  contentParameters: {
    contentFields: [],
    itemsCount: 10,
    widgetOptions: {
      latest: '',
      attributeKey: 'lol',
    },
  },
  appliedFilters: [
    {
      owner: 'superadmin',
      share: false,
      id: 380,
      name: 'Pattern template filter',
      conditions: [
        {
          filteringField: 'name',
          condition: 'cnt',
          value: 'nested',
        },
      ],
      orders: [
        {
          sortingColumn: 'startTime',
          isAsc: false,
        },
        {
          sortingColumn: 'number',
          isAsc: false,
        },
      ],
      type: 'Launch',
    },
  ],
  content: {
    result: [
      {
        attributeValue: 'kek',
        patterns: [
          {
            name: 'first pattern',
            count: 1,
          },
          {
            name: 'hello pattern',
            count: 1,
          },
          {
            name: 'third pattern',
            count: 1,
          },
        ],
      },
      {
        attributeValue: 'kek1',
        patterns: [
          {
            name: 'first pattern',
            count: 1,
          },
          {
            name: 'hello pattern',
            count: 1,
          },
          {
            name: 'third pattern',
            count: 1,
          },
        ],
      },
      {
        attributeValue: 'qwerty',
        patterns: [
          {
            name: 'first pattern',
            count: 1,
          },
          {
            name: 'third pattern',
            count: 1,
          },
        ],
      },
    ],
  },
};

export const level2 = {
  owner: 'superadmin',
  share: false,
  id: 382,
  name: 'patterns',
  widgetType: 'topPatternTemplates',
  contentParameters: {
    contentFields: [],
    itemsCount: 10,
    widgetOptions: {
      latest: '',
      attributeKey: 'lol',
    },
  },
  appliedFilters: [
    {
      owner: 'superadmin',
      share: false,
      id: 380,
      name: 'Pattern template filter',
      conditions: [
        {
          filteringField: 'name',
          condition: 'cnt',
          value: 'nested',
        },
      ],
      orders: [
        {
          sortingColumn: 'startTime',
          isAsc: false,
        },
        {
          sortingColumn: 'number',
          isAsc: false,
        },
      ],
      type: 'Launch',
    },
  ],
  content: {
    result: [
      {
        attributeValue: 'kek',
        patterns: [
          {
            name: 'nested',
            count: 1,
            id: 6697,
          },
        ],
      },
      {
        attributeValue: 'kek1',
        patterns: [
          {
            name: 'another_nested',
            count: 1,
            id: 6699,
          },
        ],
      },
      {
        attributeValue: 'qwerty',
        patterns: [
          {
            name: 'nested',
            count: 1,
            id: 6696,
          },
        ],
      },
    ],
  },
};
