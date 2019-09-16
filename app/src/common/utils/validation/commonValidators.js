import * as validate from './validate';
import { bindMessageToValidator } from './validatorHelpers';

export const requiredField = bindMessageToValidator(validate.required, 'requiredFieldHint');

export const filterName = bindMessageToValidator(validate.filterName, 'filterNameError');

export const itemNameEntity = bindMessageToValidator(validate.itemNameEntity, 'itemNameEntityHint');
export const launchNumericEntity = bindMessageToValidator(
  validate.launchNumericEntity,
  'launchNumericEntityHint',
);
export const descriptionEntity = bindMessageToValidator(
  validate.descriptionEntity,
  'descriptionEntityHint',
);

export const btsUrl = bindMessageToValidator(validate.url, 'btsUrlHint');
export const btsProject = bindMessageToValidator(validate.btsProject, 'btsProjectHint');

export const email = bindMessageToValidator(validate.requiredEmail, 'emailHint');
export const login = bindMessageToValidator(validate.login, 'loginHint');
export const password = bindMessageToValidator(validate.password, 'passwordHint');
export const userName = bindMessageToValidator(validate.userName, 'nameHint');

export const numberOfLaunches = (message) =>
  bindMessageToValidator(validate.widgetNumberOfLaunches, message);
export const widgetContentFieldsValidator = (message) =>
  bindMessageToValidator(validate.isNotEmptyArray, message);
