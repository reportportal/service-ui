import { createNamespacedQuery, extractNamespacedQuery } from './routingUtils';

const QUERY = {
  launchParams: 'page=1&size=2',
};

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
