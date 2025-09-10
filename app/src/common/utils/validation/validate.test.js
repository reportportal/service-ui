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

import * as validate from './validate';

describe('validate.required', () => {
  test('validation should be correct', () => {
    expect(validate.required(' abc ')).toBe(true);
    expect(validate.required(123)).toBe(true);
    expect(validate.required(0)).toBe(true);
    expect(validate.required(false)).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validate.required('')).toBe(false);
    expect(validate.required('   ')).toBe(false);
    expect(validate.required(null)).toBe(false);
    expect(validate.required(undefined)).toBe(false);
  });
});

describe('validate.isNotEmptyArray', () => {
  test('validation should be correct', () => {
    expect(validate.isNotEmptyArray([1])).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validate.isNotEmptyArray(undefined)).toBe(false);
    expect(validate.isNotEmptyArray([])).toBe(false);
  });
});

describe('validate.url', () => {
  test('validation should be correct', () => {
    expect(validate.url('https://example.com/')).toBe(true);
    expect(validate.url('http://example.com/')).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validate.url(undefined)).toBe(false);
    expect(validate.url('   ')).toBe(false);
    expect(validate.url('example/example')).toBe(false);
    expect(validate.url('http:/example.com/')).toBe(false);
  });
});

describe('validate.rallyUrl', () => {
  test('validation should be correct', () => {
    expect(validate.rallyUrl('https://rally1.rallydev.com/8888')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.rallyUrl(undefined)).toBe(false);
    expect(validate.rallyUrl('')).toBe(false);
    expect(validate.rallyUrl('  ')).toBe(false);
    expect(validate.rallyUrl('example')).toBe(false);
  });
});

describe('validate.email', () => {
  test('validation should be correct', () => {
    expect(validate.email('email@example.com')).toBe(true);
    expect(validate.email('firstname.lastname@example.com')).toBe(true);
    expect(validate.email('email@subdomain.example.com')).toBe(true);
    expect(validate.email('email@123.123.123.123')).toBe(true);
    expect(validate.email('1234567890@example.com')).toBe(true);
    expect(validate.email('firstname-lastname@example.com')).toBe(true);
    expect(validate.email('email@example.co.jp')).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validate.email('plainaddress')).toBe(false);
    expect(validate.email('#@%^%#$@#$@#.com')).toBe(false);
    expect(validate.email('@example.com')).toBe(false);
    expect(validate.email('Joe Smith <email@example.com>')).toBe(false);
    expect(validate.email('email.example.com')).toBe(false);
    expect(validate.email('email@example@example.com')).toBe(false);
    expect(validate.email('email@example.com (Joe Smith)')).toBe(false);
    expect(validate.email('email@example')).toBe(false);
    expect(validate.email('あいうえお@example.com')).toBe(false);
    expect(validate.email('firstname+lastname@example.com')).toBe(false);
    expect(validate.email('.email@example.com')).toBe(false);
  });
});

describe('validate.requiredEmail', () => {
  test('validation should be correct', () => {
    expect(validate.email('email@example.com')).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validate.email('   ')).toBe(false);
    expect(validate.email(null)).toBe(false);
    expect(validate.email('@example.com')).toBe(false);
  });
});

describe('validate.login', () => {
  test('validation should be correct', () => {
    expect(validate.login('email@example.com')).toBe(true);
    expect(validate.login('firstname.lastname@example.com')).toBe(true);
    expect(validate.login('email@subdomain.example.com')).toBe(true);
    expect(validate.login('email@123.123.123.123')).toBe(true);
    expect(validate.login('1234567890@example.com')).toBe(true);
    expect(validate.login('firstname-lastname@example.com')).toBe(true);
    expect(validate.login('email@example.co.jp')).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validate.login('plainaddress')).toBe(false);
    expect(validate.login('#@%^%#$@#$@#.com')).toBe(false);
    expect(validate.login('@example.com')).toBe(false);
    expect(validate.login('Joe Smith <email@example.com>')).toBe(false);
    expect(validate.login('email.example.com')).toBe(false);
    expect(validate.login('email@example@example.com')).toBe(false);
    expect(validate.login('email@example.com (Joe Smith)')).toBe(false);
    expect(validate.login('email@example')).toBe(false);
    expect(validate.login('あいうえお@example.com')).toBe(false);
    expect(validate.email('firstname+lastname@example.com')).toBe(false);
    expect(validate.email('.email@example.com')).toBe(false);
  });
});

describe('validate.oldPassword', () => {
  test('validation should be correct', () => {
    expect(validate.oldPassword('1234')).toBe(true);
    expect(validate.oldPassword('1234567890123456789012345')).toBe(true);
    expect(validate.oldPassword('Aa1@3@.?n&()*^HFU')).toBe(true);
    expect(validate.oldPassword('firstname+lastname@ex')).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validate.oldPassword(undefined)).toBe(false);
    expect(validate.oldPassword('123')).toBe(false);
  });
});

describe('validate.password', () => {
  test('validation should be correct', () => {
    expect(validate.password('aA1!5678')).toBe(true);
    expect(validate.password('Aa1@3@.?n&()*^HFU')).toBe(true);
    expect(validate.password('Firstname+lastname@ex1')).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validate.password(undefined)).toBe(false);
    expect(validate.password('123')).toBe(false);
    expect(validate.password('12345678ADd123456789012345')).toBe(false);
    expect(validate.password('aA1_567')).toBe(false);
  });
});

describe('validate.userName', () => {
  test('validation should be correct', () => {
    expect(validate.userName('abc')).toBe(true);
    expect(validate.userName('full name')).toBe(true);
    expect(validate.userName('full name with.some_symbols-123')).toBe(true);
    expect(validate.userName("O'Connor")).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.userName(undefined)).toBe(false);
    expect(validate.userName('')).toBe(false);
    expect(validate.userName('  ')).toBe(false);
    expect(validate.userName('name#')).toBe(false);
    expect(validate.userName('Hello 世界')).toBe(false);
    expect(validate.userName('полное имя')).toBe(false);
  });
});

describe('validate.filterName', () => {
  test('validation should be correct', () => {
    expect(validate.filterName('abc')).toBe(true);
    expect(validate.filterName('filter name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.filterName(undefined)).toBe(false);
    expect(validate.filterName('')).toBe(false);
    expect(validate.filterName('  ')).toBe(false);
    expect(validate.filterName('f')).toBe(false);
    const textLonger128 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.filterName(textLonger128)).toBe(false);
  });
});

describe('validate.launchName', () => {
  test('validation should be correct', () => {
    expect(validate.launchName('a')).toBe(true);
    expect(validate.launchName('launch name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.launchName(undefined)).toBe(false);
    expect(validate.launchName('')).toBe(false);
    expect(validate.launchName('  ')).toBe(false);
    const textLonger256 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.launchName(textLonger256)).toBe(false);
  });
});

describe('validate.dashboardName', () => {
  test('validation should be correct', () => {
    expect(validate.dashboardName('abc')).toBe(true);
    expect(validate.dashboardName('dashboard name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.dashboardName(undefined)).toBe(false);
    expect(validate.dashboardName('')).toBe(false);
    expect(validate.dashboardName('  ')).toBe(false);
    expect(validate.dashboardName('ab')).toBe(false);
    const textLonger128 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.dashboardName(textLonger128)).toBe(false);
  });
});

describe('validate.createDashboardNameUniqueValidator', () => {
  const dashboards = [
    {
      id: 1,
      name: 'abc',
    },
    {
      id: 2,
      name: 'old_name',
    },
    {
      id: 3,
      name: 'third',
    },
  ];
  const dashboardNameUniqueValidator = validate.createDashboardNameUniqueValidator(dashboards, {
    id: 2,
    name: 'old_name',
  });
  test('validation should be correct', () => {
    expect(dashboardNameUniqueValidator('new_name')).toBe(true);
    expect(dashboardNameUniqueValidator('old_name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(dashboardNameUniqueValidator('abc')).toBe(false);
  });
});

describe('validate.widgetName', () => {
  test('validation should be correct', () => {
    expect(validate.widgetName('abc')).toBe(true);
    expect(validate.widgetName('widgetName name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.widgetName(undefined)).toBe(false);
    expect(validate.widgetName('')).toBe(false);
    expect(validate.widgetName('  ')).toBe(false);
    expect(validate.widgetName('ab')).toBe(false);
    const textLonger128 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.widgetName(textLonger128)).toBe(false);
  });
});

describe('validate.createWidgetNameUniqueValidator', () => {
  const widgets = [
    {
      widgetId: 1,
      widgetName: 'abc',
    },
    {
      widgetId: 2,
      widgetName: 'old_name',
    },
    {
      widgetId: 3,
      widgetName: 'third',
    },
  ];
  const widgetNameUniqueValidator = validate.createWidgetNameUniqueValidator(widgets, 2);
  test('validation should be correct', () => {
    expect(widgetNameUniqueValidator('new_name')).toBe(true);
    expect(widgetNameUniqueValidator('old_name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(widgetNameUniqueValidator('abc')).toBe(false);
  });
});

describe('validate.issueId', () => {
  test('validation should be correct', () => {
    expect(validate.issueId('a')).toBe(true);
    expect(validate.issueId('issue id')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.issueId(undefined)).toBe(false);
    expect(validate.issueId('')).toBe(false);
    expect(validate.issueId('  ')).toBe(false);
    const textLonger128 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.issueId(textLonger128)).toBe(false);
  });
});

describe('validate.ldapUrl', () => {
  test('validation should be correct', () => {
    expect(validate.ldapUrl('ldap://example.com:8888')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.ldapUrl(undefined)).toBe(false);
    expect(validate.ldapUrl('')).toBe(false);
    expect(validate.ldapUrl('  ')).toBe(false);
    expect(validate.ldapUrl('example')).toBe(false);
  });
});

describe('validate.defectTypeLongName', () => {
  test('validation should be correct', () => {
    expect(validate.defectTypeLongName('abc')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.defectTypeLongName(undefined)).toBe(false);
    expect(validate.defectTypeLongName('')).toBe(false);
    expect(validate.defectTypeLongName('  ')).toBe(false);
    expect(validate.defectTypeLongName('ab')).toBe(false);
    const textLonger55 = 'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.defectTypeLongName(textLonger55)).toBe(false);
  });
});

describe('validate.defectTypeShortName', () => {
  test('validation should be correct', () => {
    expect(validate.defectTypeShortName('abc')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.defectTypeShortName(undefined)).toBe(false);
    expect(validate.defectTypeShortName('')).toBe(false);
    expect(validate.defectTypeShortName('  ')).toBe(false);
    expect(validate.defectTypeShortName('abcde')).toBe(false);
  });
});

describe('validate.projectName', () => {
  test('validation should be correct', () => {
    expect(validate.projectNameLength('abc')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.projectNamePattern(undefined)).toBe(false);
    expect(validate.projectNamePattern('')).toBe(false);
    expect(validate.projectNamePattern('  ')).toBe(false);
    expect(validate.projectNamePattern('project test')).toBe(true);
    expect(validate.projectNamePattern('project-test')).toBe(true);
    expect(validate.projectNamePattern('project_test')).toBe(true);
    expect(validate.projectNamePattern('project.test')).toBe(true);
    expect(validate.projectNamePattern('проект')).toBe(false);
    const textLonger60 =
      'this_is_very_long_text_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.projectNameLength(textLonger60)).toBe(false);
  });
});

describe('validate.btsProject', () => {
  test('validation should be correct', () => {
    expect(validate.btsProject('abc')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.btsProject(undefined)).toBe(false);
    expect(validate.btsProject('')).toBe(false);
    expect(validate.btsProject('  ')).toBe(false);
    const textLonger80 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.btsProject(textLonger80)).toBe(false);
  });
});

describe('validate.patternNameLength', () => {
  test('validation should be correct', () => {
    expect(validate.patternNameLength('abc')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.patternNameLength(undefined)).toBe(false);
    expect(validate.patternNameLength('')).toBe(false);
    expect(validate.patternNameLength('  ')).toBe(false);
    const textLonger55 = 'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.patternNameLength(textLonger55)).toBe(false);
  });
});

describe('validate.createNameUniqueValidator', () => {
  const items = [
    {
      id: 1,
      name: 'abc',
    },
    {
      id: 2,
      name: 'old_name',
    },
    {
      id: 3,
      name: 'third',
    },
  ];
  const nameUniqueValidator = validate.createNameUniqueValidator(2, items);
  test('validation should be correct', () => {
    expect(nameUniqueValidator('new_name')).toBe(true);
    expect(nameUniqueValidator('old_name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(nameUniqueValidator('abc')).toBe(false);
  });
});

describe('validate.analyzerMinShouldMatch', () => {
  test('validation should be correct', () => {
    expect(validate.analyzerMinShouldMatch('50')).toBe(true);
    expect(validate.analyzerMinShouldMatch('100')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.analyzerMinShouldMatch(undefined)).toBe(false);
    expect(validate.analyzerMinShouldMatch('')).toBe(false);
    expect(validate.analyzerMinShouldMatch('  ')).toBe(false);
    expect(validate.analyzerMinShouldMatch('3')).toBe(false);
    expect(validate.analyzerMinShouldMatch('30')).toBe(false);
    expect(validate.analyzerMinShouldMatch('300')).toBe(false);
  });
});

describe('validate.itemNameEntity', () => {
  test('validation should be correct', () => {
    expect(validate.itemNameEntity({ value: 'abc' })).toBe(true);
    expect(validate.itemNameEntity({ value: 'launch name' })).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.itemNameEntity(undefined)).toBe(false);
    expect(validate.itemNameEntity({})).toBe(false);
    expect(validate.itemNameEntity({ value: '' })).toBe(false);
    expect(validate.itemNameEntity({ value: '  ' })).toBe(false);
    expect(validate.itemNameEntity({ value: 'a' })).toBe(false);
    const textLonger256 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.itemNameEntity({ value: textLonger256 })).toBe(false);
  });
});

describe('validate.launchNumericEntity', () => {
  test('validation should be correct', () => {
    expect(validate.launchNumericEntity({ value: '1' })).toBe(true);
    expect(validate.launchNumericEntity({ value: '123456789012345678' })).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.launchNumericEntity(undefined)).toBe(false);
    expect(validate.launchNumericEntity({})).toBe(false);
    expect(validate.launchNumericEntity({ value: '' })).toBe(false);
    expect(validate.launchNumericEntity({ value: '  ' })).toBe(false);
    expect(validate.launchNumericEntity({ value: 'a' })).toBe(false);
    expect(validate.launchNumericEntity({ value: '1234567890123456789' })).toBe(false);
  });
});

describe('validate.descriptionEntity', () => {
  test('validation should be correct', () => {
    expect(validate.descriptionEntity({ value: 'abc' })).toBe(true);
    expect(validate.descriptionEntity({ value: 'example 18 symbols' })).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.launchNumericEntity(undefined)).toBe(false);
    expect(validate.launchNumericEntity({})).toBe(false);
    expect(validate.launchNumericEntity({ value: '' })).toBe(false);
    expect(validate.launchNumericEntity({ value: '  ' })).toBe(false);
    expect(validate.launchNumericEntity({ value: 'a' })).toBe(false);
    expect(validate.launchNumericEntity({ value: 'example more then 18 symbols' })).toBe(false);
  });
});

describe('validate.port', () => {
  test('validation should be correct', () => {
    expect(validate.port(1)).toBe(true);
    expect(validate.port(65535)).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.port(undefined)).toBe(false);
    expect(validate.port('')).toBe(false);
    expect(validate.port(0)).toBe(false);
    expect(validate.port(66666)).toBe(false);
  });
});

describe('validate.searchFilter', () => {
  test('validation should be correct', () => {
    expect(validate.searchFilter(undefined)).toBe(true);
    expect(validate.searchFilter('')).toBe(true);
    expect(validate.searchFilter('abc')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.searchFilter('    ')).toBe(false);
    expect(validate.searchFilter('a')).toBe(false);
  });
});

describe('validate.attributeKey', () => {
  test('validation should be correct', () => {
    expect(validate.attributeKey(undefined)).toBe(true);
    expect(validate.attributeKey('')).toBe(true);
    expect(validate.attributeKey('a')).toBe(true);
    expect(validate.attributeKey('attribute key')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.attributeKey('    ')).toBe(false);
    const textLonger512 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.attributeKey(textLonger512)).toBe(false);
  });
});

describe('validate.attributeValue', () => {
  test('validation should be correct', () => {
    expect(validate.attributeValue('a')).toBe(true);
    expect(validate.attributeValue('attribute value')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.attributeValue(undefined)).toBe(false);
    expect(validate.attributeValue('')).toBe(false);
    expect(validate.attributeValue('    ')).toBe(false);
    const textLonger512 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.attributeValue(textLonger512)).toBe(false);
  });
});

describe('validate.attributesArray', () => {
  test('validation should be correct', () => {
    expect(validate.attributesArray([{ value: 'a' }])).toBe(true);
    expect(validate.attributesArray([{ key: 'a', value: 'abc' }])).toBe(true);
    expect(validate.attributesArray(undefined)).toBe(true);
    expect(validate.attributesArray([])).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.attributesArray([{ value: '' }])).toBe(false);
    expect(validate.attributesArray([{ value: 'a', edited: true }])).toBe(false);
  });
});

describe('validate.widgetNumberOfLaunches', () => {
  test('validation should be correct', () => {
    expect(validate.widgetNumberOfLaunches(1)).toBe(true);
    expect(validate.widgetNumberOfLaunches(600)).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.widgetNumberOfLaunches(undefined)).toBe(false);
    expect(validate.widgetNumberOfLaunches('')).toBe(false);
    expect(validate.widgetNumberOfLaunches(0)).toBe(false);
    expect(validate.widgetNumberOfLaunches(601)).toBe(false);
  });
});

describe('validate.cumulativeItemsValidation', () => {
  test('validation should be correct', () => {
    expect(validate.cumulativeItemsValidation(1)).toBe(true);
    expect(validate.cumulativeItemsValidation(20000)).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.cumulativeItemsValidation(undefined)).toBe(false);
    expect(validate.cumulativeItemsValidation('')).toBe(false);
    expect(validate.cumulativeItemsValidation(0)).toBe(false);
    expect(validate.cumulativeItemsValidation(20001)).toBe(false);
  });
});

describe('validate.flakyWidgetNumberOfLaunches', () => {
  test('validation should be correct', () => {
    expect(validate.flakyWidgetNumberOfLaunches(2)).toBe(true);
    expect(validate.flakyWidgetNumberOfLaunches(100)).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.flakyWidgetNumberOfLaunches(undefined)).toBe(false);
    expect(validate.flakyWidgetNumberOfLaunches('')).toBe(false);
    expect(validate.flakyWidgetNumberOfLaunches(1)).toBe(false);
    expect(validate.flakyWidgetNumberOfLaunches(101)).toBe(false);
  });
});

describe('validate.launchesWidgetContentFields', () => {
  test('validation should be correct', () => {
    expect(validate.launchesWidgetContentFields(['1', '2', '3', '4'])).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.launchesWidgetContentFields(undefined)).toBe(false);
    expect(validate.launchesWidgetContentFields([])).toBe(false);
    expect(validate.launchesWidgetContentFields(['1', '2', '3'])).toBe(false);
  });
});

describe('validate.mostFailedWidgetNumberOfLaunches', () => {
  test('validation should be correct', () => {
    expect(validate.mostFailedWidgetNumberOfLaunches(2)).toBe(true);
    expect(validate.mostFailedWidgetNumberOfLaunches(100)).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.mostFailedWidgetNumberOfLaunches(undefined)).toBe(false);
    expect(validate.mostFailedWidgetNumberOfLaunches('')).toBe(false);
    expect(validate.mostFailedWidgetNumberOfLaunches(1)).toBe(false);
    expect(validate.mostFailedWidgetNumberOfLaunches(101)).toBe(false);
  });
});

describe('validate.createNotificationRecipientsValidator', () => {
  test('validation should be correct', () => {
    expect(validate.createNotificationRecipientsValidator(true)(['example'])).toBe(true);
    expect(validate.createNotificationRecipientsValidator(false)(['example'])).toBe(true);
    expect(validate.createNotificationRecipientsValidator(true)(undefined)).toBe(true);
    expect(validate.createNotificationRecipientsValidator(true)([])).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.createNotificationRecipientsValidator(false)([])).toBe(false);
  });
});

describe('validate.notificationLaunchNames', () => {
  test('validation should be correct', () => {
    expect(validate.notificationLaunchNames(['a'])).toBe(true);
    expect(validate.notificationLaunchNames(['launch name'])).toBe(true);
    expect(validate.notificationLaunchNames(undefined)).toBe(true);
    expect(validate.notificationLaunchNames([])).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.notificationLaunchNames([' '])).toBe(false);
    const textLonger256 =
      'this is very long text aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validate.notificationLaunchNames([textLonger256])).toBe(false);
  });
});

describe('validate.apiKeyName', () => {
  test('validation should be correct', () => {
    expect(validate.apiKeyName('abc')).toBe(true);
    expect(validate.apiKeyName('api key name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.apiKeyName(undefined)).toBe(false);
    expect(validate.apiKeyName()).toBe(false);
    expect(validate.apiKeyName('')).toBe(false);
    expect(validate.apiKeyName('  ')).toBe(false);
    const textLonger40 = '11111111111111111111111111111111111111111';
    expect(validate.apiKeyName(textLonger40)).toBe(false);
  });
});

describe('validate.apiKeyNameShouldMatch', () => {
  test('validation should be correct', () => {
    expect(validate.apiKeyNameShouldMatch('abc')).toBe(true);
    expect(validate.apiKeyNameShouldMatch('Az1-._~+/')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.apiKeyNameShouldMatch('api key name')).toBe(false);
    expect(validate.apiKeyNameShouldMatch('apiKeyName!')).toBe(false);
    expect(validate.apiKeyNameShouldMatch('$apiKeyName')).toBe(false);
  });
});
describe('validate.footerLinkNameLength', () => {
  test('validation should be correct', () => {
    expect(validate.footerLinkNameLength('abc')).toBe(true);
    expect(validate.footerLinkNameLength('footer link name')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validate.footerLinkNameLength(undefined)).toBe(false);
    expect(validate.footerLinkNameLength()).toBe(false);
    expect(validate.footerLinkNameLength('')).toBe(false);
    expect(validate.footerLinkNameLength('  ')).toBe(false);
    const textLonger30 = 'longlonglonglonglonglonglonglonglong';
    expect(validate.footerLinkNameLength(textLonger30)).toBe(false);
    expect(validate.footerLinkNameLength('aa'.repeat(30))).toBe(false);
  });
});

describe('validate.isUniqueByKey', () => {
  const users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Doe' },
  ];

  const isUniqueByName = validate.isUniqueByKey(users, 'name');

  test('should return false if the value is not unique', () => {
    expect(isUniqueByName('John')).toBe(false);
    expect(isUniqueByName('Jane')).toBe(false);
  });

  test('should return true if the value is unique', () => {
    expect(isUniqueByName('Alice')).toBe(true);
    expect(isUniqueByName('Bob')).toBe(true);
  });
});

describe('validate.urlOrEmailValidator', () => {
  test('validation should be correct for email', () => {
    expect(validate.urlOrEmailValidator('email@example.com')).toBe(true);
    expect(validate.urlOrEmailValidator('firstname.lastname@example.com')).toBe(true);
    expect(validate.urlOrEmailValidator('email@subdomain.example.com')).toBe(true);
    expect(validate.urlOrEmailValidator('email@123.123.123.123')).toBe(true);
    expect(validate.urlOrEmailValidator('1234567890@example.com')).toBe(true);
    expect(validate.urlOrEmailValidator('firstname-lastname@example.com')).toBe(true);
    expect(validate.urlOrEmailValidator('email@example.co.jp')).toBe(true);
  });

  test('validation should be correct for URL', () => {
    expect(validate.urlOrEmailValidator('https://example.com/')).toBe(true);
    expect(validate.urlOrEmailValidator('http://example.com/')).toBe(true);
    expect(validate.urlOrEmailValidator('https://subdomain.example.com/')).toBe(true);
    expect(validate.urlOrEmailValidator('http://example.com/path/to/resource')).toBe(true);
  });

  test('validation should be not correct for invalid email and url', () => {
    expect(validate.urlOrEmailValidator('plainaddress')).toBe(false);
    expect(validate.urlOrEmailValidator('#@%^%#$@#$@#.com')).toBe(false);
    expect(validate.urlOrEmailValidator('@example.com')).toBe(false);
    expect(validate.urlOrEmailValidator('Joe Smith <email@example.com>')).toBe(false);
    expect(validate.urlOrEmailValidator('email.example.com')).toBe(false);
    expect(validate.urlOrEmailValidator('email@example@example.com')).toBe(false);
    expect(validate.urlOrEmailValidator('email@example.com (Joe Smith)')).toBe(false);
    expect(validate.urlOrEmailValidator('email@example')).toBe(false);
    expect(validate.urlOrEmailValidator('あいうえお@example.com')).toBe(false);

    expect(validate.urlOrEmailValidator(undefined)).toBe(false);
    expect(validate.urlOrEmailValidator('   ')).toBe(false);
    expect(validate.urlOrEmailValidator('example/example')).toBe(false);
    expect(validate.urlOrEmailValidator('http:/example.com/')).toBe(false);
  });
});

describe('validate.anyOptionSelected', () => {
  test('validation should be correct', () => {
    expect(validate.anyOptionSelected({ option1: true, option2: false })).toBe(true);
    expect(validate.anyOptionSelected({ a: '1', b: false, c: false, d: null, x: undefined })).toBe(
      true,
    );
    expect(validate.anyOptionSelected({ a: 2, b: false, c: false, d: null, x: undefined })).toBe(
      true,
    );
    expect(validate.anyOptionSelected({ a: {}, b: false, c: false, d: null, x: undefined })).toBe(
      true,
    );
  });
  test('Validation should not be correct', () => {
    expect(validate.anyOptionSelected({ option1: false, option2: false })).toBe(false);
    expect(validate.anyOptionSelected({ option1: '', option2: null })).toBe(false);
    expect(
      validate.anyOptionSelected({ a: '', b: false, c: false, d: null, e: 0, x: undefined }),
    ).toBe(false);
  });
});
