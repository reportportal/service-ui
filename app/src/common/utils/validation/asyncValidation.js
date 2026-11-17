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

import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { email as isValidEmail } from 'common/utils/validation/validate';

export const projectNameUnique = (projectName) =>
  fetch(URLS.searchProjectNames(), { params: { term: projectName } }).then((names) => {
    if (names.indexOf(projectName.toLowerCase()) > -1) {
      // eslint-disable-next-line no-throw-literal
      throw {
        projectName: 'projectDuplicateHint',
      };
    }
  });

export const filterNameUnique = (projectKey, filterId, filterName) =>
  fetch(URLS.searchFilterNames(projectKey), {
    params: { 'filter.ne.id': filterId, 'filter.eq.name': filterName },
  }).then((filters) => {
    if (filters?.content?.length) {
      // eslint-disable-next-line no-throw-literal
      throw {
        name: 'filterNameDuplicateHint',
      };
    }
  });

export const organizationUserEmailUnique = async (organizationId, email) => {
  const normalizedEmail = email?.trim() ?? '';

  if (!normalizedEmail || isValidEmail(normalizedEmail) !== true) {
    return;
  }

  let response;
  try {
    response = await fetch(
      URLS.organizationUsers(organizationId, {
        email: normalizedEmail,
      }),
    );
  } catch {
    // Skip uniqueness check when the validation request fails (e.g. 504), so the form can still be submitted
    return;
  }

  const isDuplicate = (response?.items ?? []).length > 0;

  if (isDuplicate) {
    // eslint-disable-next-line no-throw-literal
    throw { email: 'duplicationOrganization' };
  }
};
