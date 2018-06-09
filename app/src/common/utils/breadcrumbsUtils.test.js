import {
  createNamespacedQuery,
  extractNamespacedQuery,
  // splitURLToCrumbs,
  createExtractQueryForCurrentLevel,
  createSplitURLToCrumbs,
} from './breadcrumbsUtils';

const QUERY = {
  launchParams: 'page=1&size=2',
};

const LAUNCH_PAGE = 'launch';
const SUITES_PAGE = 'suite';
const TEST_PAGE = 'test';

const ROUTES_MAP = {
  [LAUNCH_PAGE]: '/:projectId/launches/:filterId',
  [SUITES_PAGE]: '/:projectId/launches/:filterId/:launchId',
  [TEST_PAGE]: '/:projectId/launches/:filterId/:launchId/suite/:suiteId',
};

const TEST_NAMESPACE = 'test';

const BREADCRUMB_DESCRIPTORS = {
  [TEST_NAMESPACE]: [
    {
      page: LAUNCH_PAGE,
      level: 'launch',
    },
    {
      page: SUITES_PAGE,
      level: 'suite',
    },
    {
      page: TEST_PAGE,
      level: 'test',
    },
  ],
};

const splitURLToCrumbsRedux = createSplitURLToCrumbs(
  ROUTES_MAP,
  BREADCRUMB_DESCRIPTORS,
  TEST_NAMESPACE,
);
const extractQueryForCurrentLevel = createExtractQueryForCurrentLevel(
  BREADCRUMB_DESCRIPTORS,
  TEST_NAMESPACE,
);

describe('extractNamespacedQuery', () => {
  test('should return empty object in case no namespaced params found', () => {
    expect(extractNamespacedQuery(QUERY, 'suite')).toEqual({});
    expect(extractNamespacedQuery(QUERY)).toEqual({});
  });

  test('should return parsed namespaced query for existing namespace', () => {
    expect(extractNamespacedQuery(QUERY, 'launch')).toEqual({
      page: '1',
      size: '2',
    });
  });
});

describe('createNamespacedQuery', () => {
  test('should create namespaced query parameter', () => {
    expect(createNamespacedQuery({ page: 1, size: 2 }, 'launch')).toEqual(QUERY);
  });

  test('should return new query in case of no namespace', () => {
    expect(createNamespacedQuery({ page: 1, size: 2 })).toEqual({
      page: 1,
      size: 2,
    });
  });
});

// TODO delete?
// xdescribe('splitURLToCrumbs', () => {
//   test('should return an array of urls split by levels', () => {
//     const url = '/project/launch/1/suite/2';
//     expect(splitURLToCrumbs(url)).toHaveLength(2);
//     expect(splitURLToCrumbs(url)).toEqual(['/project/launch/1', '/project/launch/1/suite/2']);
//   });
//
//   test('should preserve query parameters', () => {
//     const query = {
//       launchParams: 'page=1&size=2',
//     };
//     const url = `/project/launch/1/suite/2`;
//     expect(splitURLToCrumbs(url, query)).toEqual([
//       '/project/launch/1?launchParams=page%3D1%26size%3D2',
//       '/project/launch/1/suite/2?launchParams=page%3D1%26size%3D2',
//     ]);
//   });
//
//   test('should preserve query parameters only for current and parent levels', () => {
//     const launchParams = 'launchParams=page%3D1%26size%3D2';
//     const suiteParams = 'suiteParams=page%3D2%26size%3D3';
//     const url = `/project/launch/1/suite/2`;
//     const query = {
//       launchParams: 'page=1&size=2',
//       suiteParams: 'page=2&size=3',
//     };
//     const crumbs = splitURLToCrumbs(url, query);
//     expect(crumbs[0]).not.toEqual(expect.stringContaining(`${suiteParams}`));
//     expect(crumbs[0]).toEqual(expect.stringContaining(`${launchParams}`));
//     expect(crumbs[1]).toEqual(expect.stringContaining(`${launchParams}`));
//     expect(crumbs[1]).toEqual(expect.stringContaining(`${suiteParams}`));
//   });
// });

describe('splitURLToCrumbsRedux', () => {
  test('should return an array of actions split by levels', () => {
    const url = '/project/launches/all/1/suite/2';
    expect(splitURLToCrumbsRedux(url)).toHaveLength(3);
    expect(splitURLToCrumbsRedux(url)).toEqual([
      {
        type: LAUNCH_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
        },
        meta: {},
      },
      {
        type: SUITES_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
          launchId: 1,
        },
        meta: {},
      },
      {
        type: TEST_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
          launchId: 1,
          suiteId: 2,
        },
        meta: {},
      },
    ]);
  });

  test('should preserve query parameters', () => {
    const url = `/project/launches/all/1/suite/2`;
    const query = {
      launchParams: 'page=1&size=2',
    };
    expect(splitURLToCrumbsRedux(url, query)).toEqual([
      {
        type: LAUNCH_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
        },
        meta: {
          query: {
            launchParams: 'page=1&size=2',
          },
        },
      },
      {
        type: SUITES_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
          launchId: 1,
        },
        meta: {
          query: {
            launchParams: 'page=1&size=2',
          },
        },
      },
      {
        type: TEST_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
          launchId: 1,
          suiteId: 2,
        },
        meta: {
          query: {
            launchParams: 'page=1&size=2',
          },
        },
      },
    ]);
  });

  test('should preserve query parameters only for current and parent levels', () => {
    const url = `/project/launches/all/1/suite/2`;
    const query = {
      launchParams: 'page=1&size=2',
      suiteParams: 'page=2&size=3',
    };
    const crumbs = splitURLToCrumbsRedux(url, query);
    expect(crumbs).toEqual([
      {
        type: LAUNCH_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
        },
        meta: {
          query: {
            launchParams: 'page=1&size=2',
          },
        },
      },
      {
        type: SUITES_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
          launchId: 1,
        },
        meta: {
          query: {
            launchParams: 'page=1&size=2',
            suiteParams: 'page=2&size=3',
          },
        },
      },
      {
        type: TEST_PAGE,
        payload: {
          projectId: 'project',
          filterId: 'all',
          launchId: 1,
          suiteId: 2,
        },
        meta: {
          query: {
            launchParams: 'page=1&size=2',
            suiteParams: 'page=2&size=3',
          },
        },
      },
    ]);
  });
});

describe('extractQueryForCurrentLevel', () => {
  test('should remove keys with deeper level', () => {
    const query = {
      launchParams: 'launchParams',
      suiteParams: 'suiteParams',
      page: 3,
    };
    expect(extractQueryForCurrentLevel(query, 'launch')).toEqual({
      launchParams: 'launchParams',
      page: 3,
    });
  });
});
