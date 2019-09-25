import { fetch } from 'common/utils';
import { URLS } from 'common/urls';

export const loginUnique = (login) =>
  fetch(URLS.userValidateRegistrationInfo(), { params: { username: login } });

export const emailUnique = (email) =>
  fetch(URLS.userValidateRegistrationInfo(), { params: { email } });

export const projectNameUnique = (projectName) =>
  fetch(URLS.searchProjectNames(), { params: { term: projectName } }).then((names) => {
    if (names.indexOf(projectName) > -1) {
      // eslint-disable-next-line no-throw-literal
      throw {
        projectName: 'projectDuplicateHint',
      };
    }
  });
