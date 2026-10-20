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

import { shallow } from 'enzyme';
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';

import { TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';

import { CaseLink } from './caseLink';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('controllers/pages', () => ({
  TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: string[]) => classNames.join(' '),
}));

describe('CaseLink', () => {
  beforeEach(() => {
    jest.mocked(useSelector).mockReturnValue({
      organizationSlug: 'my-organization',
      projectSlug: 'superadmin-personal',
    });
  });

  test('opens a Test Case directly only when its numeric id is known', () => {
    const wrapper = shallow(<CaseLink testCaseId={42} searchName="Case name" name="TC42" />);

    expect(wrapper.find(Link).prop('to')).toEqual({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug: 'my-organization',
        projectSlug: 'superadmin-personal',
        testCasePageRoute: 'test-cases/42',
      },
    });
  });

  test('searches the Library by case name when only the display id is known', () => {
    const wrapper = shallow(<CaseLink searchName="  Case name  " name="TC25602" />);

    expect(wrapper.find(Link).text()).toBe('TC25602');
    expect(wrapper.find(Link).prop('to')).toEqual({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug: 'my-organization',
        projectSlug: 'superadmin-personal',
      },
      query: { testCasesSearchParams: 'Case name' },
    });
  });

  test('keeps a case without a target as plain text', () => {
    const wrapper = shallow(<CaseLink name="TC25602" />);

    expect(wrapper.find(Link)).toHaveLength(0);
    expect(wrapper.find('span').text()).toBe('TC25602');
  });
});
