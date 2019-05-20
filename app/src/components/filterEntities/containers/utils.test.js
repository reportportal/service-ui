import { collectFilterEntities, createFilterQuery, resetOldCondition } from './utils';

describe('collectFilterEntities', () => {
  test('should return an empty object in case of no arguments', () => {
    expect(collectFilterEntities()).toEqual({});
  });

  test('returned object should contain value and condition', () => {
    const query = {
      'filter.cnt.name': 'test',
      'filter.eq.number': '20',
    };
    expect(collectFilterEntities(query)).toEqual({
      name: {
        value: 'test',
        condition: 'cnt',
      },
      number: {
        value: '20',
        condition: 'eq',
      },
    });
  });

  test('should ignore non-filter keys', () => {
    expect(
      collectFilterEntities({
        foo: 'bar',
      }),
    ).toEqual({});
  });

  test('should fill empty values with null', () => {
    expect(
      collectFilterEntities({
        'filter.cnt.name': '',
        'filter.eq.number': undefined,
      }),
    ).toEqual({
      name: {
        value: null,
        condition: 'cnt',
      },
      number: {
        value: null,
        condition: 'eq',
      },
    });
  });

  test('should support predefined filters', () => {
    expect(
      collectFilterEntities({
        'predefinedFilter.activity': 'test',
      }),
    ).toEqual({
      activity: {
        value: 'test',
      },
    });
  });
});

describe('createFilterQuery', () => {
  test('should return an empty object in case of no argumnents', () => {
    expect(createFilterQuery()).toEqual({});
  });

  test('should return query object with formatted parameters', () => {
    expect(
      createFilterQuery({
        name: {
          value: 'foo',
          condition: 'cnt',
        },
        number: {
          value: '20',
          condition: 'eq',
        },
      }),
    ).toEqual({
      'filter.cnt.name': 'foo',
      'filter.eq.number': '20',
    });
  });

  test('should support predefined filters', () => {
    expect(
      createFilterQuery({
        activity: {
          value: 'foo',
        },
      }),
    ).toEqual({
      'predefinedFilter.activity': 'foo',
    });
  });

  test('should replace old value', () => {
    const newValues = {
      name: {
        value: 'foo',
        condition: 'cnt',
      },
      number: {
        value: '20',
        condition: 'eq',
      },
      predefined: {
        value: 'bar',
      },
    };
    const oldValues = {
      name: {
        value: 'foo',
        condition: 'cnt',
      },
      number: {
        value: '10',
        condition: 'eq',
      },
      predefined: {
        value: 'foo',
      },
    };
    expect(createFilterQuery(newValues, oldValues)).toEqual({
      'filter.cnt.name': 'foo',
      'filter.eq.number': '20',
      'predefinedFilter.predefined': 'bar',
    });
  });

  test("should set value to null in case it's not passed to new values", () => {
    const newValues = {
      name: {
        value: 'foo',
        condition: 'cnt',
      },
    };
    const oldValues = {
      name: {
        value: 'foo',
        condition: 'cnt',
      },
      number: {
        value: '20',
        condition: 'eq',
      },
      predefined: {
        value: 'foo',
      },
    };
    expect(createFilterQuery(newValues, oldValues)).toEqual({
      'filter.cnt.name': 'foo',
      'filter.eq.number': null,
      'predefinedFilter.predefined': null,
    });
  });

  test('should set value to null in case of empty value', () => {
    const newValues = {
      name: {
        value: 'foo',
        condition: 'cnt',
      },
      number: {
        value: '',
        condition: 'eq',
      },
      predefined: {
        value: '',
      },
    };
    const oldValues = {
      number: {
        value: 'test',
        condition: 'eq',
      },
    };
    expect(createFilterQuery(newValues, oldValues)).toEqual({
      'filter.cnt.name': 'foo',
      'filter.eq.number': null,
    });
  });

  test('should reset old query if conditional change', () => {
    const newValues = {
      user: {
        value: 'personal',
        condition: 'cnt',
      },
    };
    const oldValues = {
      user: {
        value: 'personal',
        condition: '!cnt',
      },
    };
    expect(createFilterQuery(newValues, oldValues)).toEqual({
      'filter.cnt.user': 'personal',
      'filter.!cnt.user': null,
    });
  });
  test('should reset old query if conditional change', () => {
    const newValues = {
      user: {
        value: 'personal',
        condition: 'cnt',
      },
      role: {
        value: 'ADMINISTRATOR',
        condition: 'in',
      },
    };
    const oldValues = {
      user: {
        value: 'personal',
        condition: '!cnt',
      },
    };
    expect(createFilterQuery(newValues, oldValues)).toEqual({
      'filter.cnt.user': 'personal',
      'filter.!cnt.user': null,
      'filter.in.role': 'ADMINISTRATOR',
    });
  });

  test('should add "filter.eq.attributeSystem: false" to requests with attributes', () => {
    const filterWithAttributeKey = {
      attributeKey: {
        value: 'foo',
        condition: 'cnt',
      },
    };
    expect(createFilterQuery(filterWithAttributeKey)).toEqual({
      'filter.cnt.attributeKey': 'foo',
      'filter.eq.attributeSystem': false,
    });

    const filterWithAttributeValue = {
      attributeValue: {
        value: 'foo',
        condition: 'cnt',
      },
    };
    expect(createFilterQuery(filterWithAttributeValue)).toEqual({
      'filter.cnt.attributeValue': 'foo',
      'filter.eq.attributeSystem': false,
    });
  });

  test('should set "attributeSystem" to null only in case of both empty attribute filters', () => {
    const oldFilters = {
      attributeKey: {
        value: 'key',
        condition: 'cnt',
      },
      attributeValue: {
        value: 'value',
        condition: 'cnt',
      },
    };
    const newFiltersWithKey = {
      name: {
        value: 'name',
        condition: 'cnt',
      },
      attributeKey: {
        value: 'key',
        condition: 'cnt',
      },
      attributeValue: {
        value: '',
        condition: 'cnt',
      },
    };
    expect(createFilterQuery(newFiltersWithKey, oldFilters)).toEqual({
      'filter.cnt.name': 'name',
      'filter.cnt.attributeKey': 'key',
      'filter.cnt.attributeValue': null,
      'filter.eq.attributeSystem': false,
    });
    const newValuesWithValue = {
      name: {
        value: 'name',
        condition: 'cnt',
      },
      attributeKey: {
        value: '',
        condition: 'cnt',
      },
      attributeValue: {
        value: 'value',
        condition: 'cnt',
      },
    };
    expect(createFilterQuery(newValuesWithValue, oldFilters)).toEqual({
      'filter.cnt.name': 'name',
      'filter.cnt.attributeKey': null,
      'filter.cnt.attributeValue': 'value',
      'filter.eq.attributeSystem': false,
    });

    const newValuesWithNoAttributes = {
      name: {
        value: 'name',
        condition: 'cnt',
      },
      attributeKey: {
        value: '',
        condition: 'cnt',
      },
      attributeValue: {
        value: '',
        condition: 'cnt',
      },
    };
    expect(createFilterQuery(newValuesWithNoAttributes, oldFilters)).toEqual({
      'filter.cnt.name': 'name',
      'filter.cnt.attributeKey': null,
      'filter.cnt.attributeValue': null,
      'filter.eq.attributeSystem': null,
    });
  });
});

describe('resetOldCondition', () => {
  test('should return an empty object in case of no arguments', () => {
    expect(resetOldCondition()).toEqual({});
  });

  test('should return an empty object if no first argument', () => {
    const newValues = undefined;
    const oldValues = {
      user: {
        value: 'personal',
        condition: '!cnt',
      },
    };
    expect(resetOldCondition(newValues, oldValues)).toEqual({});
  });
  test('should return an empty object if no second argument', () => {
    const newValues = {
      user: {
        value: 'personal',
        condition: '!cnt',
      },
    };
    const oldValues = undefined;
    expect(resetOldCondition(newValues, oldValues)).toEqual({});
  });
  test('should return an empty object if old and new values have same conditions', () => {
    const newValues = {
      user: {
        value: 'personal',
        condition: 'cnt',
      },
    };
    const oldValues = {
      user: {
        value: 'personal1',
        condition: 'cnt',
      },
    };
    expect(resetOldCondition(newValues, oldValues)).toEqual({});
  });
});
