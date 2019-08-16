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
