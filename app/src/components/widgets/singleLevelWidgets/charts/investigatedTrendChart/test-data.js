const LAUNCH_DATA = {
  share: false,
  id: 5,
  name: 'start2',
  content_parameters: {
    widget_type: 'investigated_trend',
    content_fields: [],
    itemsCount: 10,
    widgetOptions: {},
  },
  applied_filters: [
    {
      share: false,
      id: 1,
      name: 'launch name',
      conditions: [],
      orders: [
        {
          sorting_column: 'statistics$defects$no_defect$nd001',
          is_asc: false,
        },
      ],
      type: 'Launch',
    },
  ],
  content: {
    result: [
      {
        id: 3,
        number: 3,
        name: 'test launch',
        start_time: 1541397081305,
        to_investigate: 20,
        investigated: 80,
      },
      {
        id: 4,
        number: 1,
        name: 'launch name test',
        start_time: 1541397081305,
        to_investigate: 17.65,
        investigated: 82.35,
      },
      {
        id: 2,
        number: 2,
        name: 'test launch',
        start_time: 1541397081305,
        to_investigate: 30,
        investigated: 70,
      },
      {
        id: 1,
        number: 1,
        name: 'test launch',
        start_time: 1541397081305,
        to_investigate: 6.25,
        investigated: 93.75,
      },
    ],
  },
};

const TIMELINE_DATA = {
  owner: 'gerkom',
  share: true,
  id: '5bbb7ccd027439000199fec7',
  name: 'timeline mode widget',
  content_parameters: {
    type: 'column_chart',
    gadget: 'investigated_trend',
    metadata_fields: ['name', 'number', 'start_time'],
    content_fields: [
      'statistics$defects$product_bug$total',
      'statistics$defects$automation_bug$total',
      'statistics$defects$system_issue$total',
      'statistics$defects$no_defect$total',
      'statistics$defects$to_investigate$total',
    ],
    itemsCount: 50,
    widgetOptions: {
      filterName: ["DEMO_FILTER#ASFJKL;'"],
      timeline: ['DAY'],
    },
  },
  filter_id: '5b5f17fc857aba0001e29194',
  content: {
    '2018-08-21': [
      {
        values: {
          to_investigate: '41.06',
          investigated: '58.94',
        },
      },
    ],
    '2018-08-22': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-08-23': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-08-24': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-08-25': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-08-26': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-08-27': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-08-28': [
      {
        values: {
          to_investigate: '40.76',
          investigated: '59.24',
        },
      },
    ],
    '2018-08-29': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-08-30': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-08-31': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-01': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-02': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-03': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-04': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-05': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-06': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-07': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-08': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-09': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-10': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-11': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-12': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-13': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-14': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-15': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-16': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-17': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-18': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-19': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-20': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-21': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-22': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-23': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-24': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-25': [
      {
        values: {
          to_investigate: '41.79',
          investigated: '58.21',
        },
      },
    ],
    '2018-09-26': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-27': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-28': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-29': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-09-30': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-10-01': [
      {
        values: {
          to_investigate: '43.18',
          investigated: '56.82',
        },
      },
    ],
    '2018-10-02': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-10-03': [
      {
        values: {
          to_investigate: '0',
          investigated: '0',
        },
      },
    ],
    '2018-10-04': [
      {
        values: {
          to_investigate: '39.72',
          investigated: '60.28',
        },
      },
    ],
  },
};

export const TEST_DATA = {
  launchMode: LAUNCH_DATA,
  timelineMode: TIMELINE_DATA,
};
