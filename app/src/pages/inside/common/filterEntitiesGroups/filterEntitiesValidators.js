import { validate } from 'common/utils';

export const validators = {
  itemNameEntity: (entityObject) =>
    (!entityObject ||
      validate.isEmpty(entityObject.value) ||
      !validate.itemNameEntity(entityObject.value)) &&
    'itemNameEntityHint',
  launchNumericEntity: (entityObject) =>
    (!entityObject ||
      validate.isEmpty(entityObject.value) ||
      !validate.launchNumericEntity(entityObject.value)) &&
    'launchNumericEntityHint',
  descriptionEntity: (entityObject) =>
    (!entityObject ||
      validate.isEmpty(entityObject.value) ||
      !validate.descriptionEntity(entityObject.value)) &&
    'descriptionEntityHint',
};
