export const joinOrganizations = (organizations = []) =>
  organizations
    .map((item) => item.organization)
    .filter(Boolean)
    .join(',');

export const splitOrganizations = (organizations = '') =>
  organizations
    .split(',')
    .filter(Boolean)
    .map((organization) => ({ organization }));
