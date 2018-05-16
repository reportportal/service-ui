import { createCheckPermission } from './permissions';

const PERMISSIONS_MAP = {
  ADMINISTRATOR: {
    CREATE_USER: 'OWNER',
  },
  MANAGER: {
    DELETE_USER: 'ALL',
  },
  CUSTOMER: {
    CREATE_USER: 'ALL',
  },
  MEMBER: {
    CREATE_USER: 'OWNER',
  },
};
const checkPermission = createCheckPermission(PERMISSIONS_MAP);
const canCreateUser = checkPermission('CREATE_USER');

describe('permissions', () => {
  it('should return true if user has ADMINISTRATOR role', () => {
    expect(canCreateUser('ADMINISTRATOR')).toBeTruthy();
  });
  it('should return false if there is NO such project role', () => {
    expect(canCreateUser('USER', 'NEW_ROLE')).toBeFalsy();
  });
  it("should return false if user hasn't got permission", () => {
    expect(canCreateUser('USER', 'MANAGER')).toBeFalsy();
  });
  it('should return true if user has permission "ALL"', () => {
    expect(canCreateUser('USER', 'CUSTOMER')).toBeTruthy();
  });
  it('should return true if owner has permission "ALL"', () => {
    expect(canCreateUser('USER', 'CUSTOMER', true)).toBeTruthy();
  });
  it('should return true if owner has permission "OWNER"', () => {
    expect(canCreateUser('USER', 'MEMBER', true)).toBeTruthy();
  });
});
