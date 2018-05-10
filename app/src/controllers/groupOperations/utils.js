import { EXECUTE_GROUP_OPERATION } from './constants';

export const validateItems = (items = [], validator, state) =>
  items.reduce((acc, item) => {
    const error = validator(item, items, state);
    if (error) {
      return { ...acc, [item.id]: error };
    }
    return acc;
  }, {});

const groupOperationMap = {};

export const getGroupOperationDescriptor = (name) => groupOperationMap[name];

export const defineGroupOperation = (namespace, name, operationAction, validator) => {
  groupOperationMap[name] = {
    action: operationAction,
    validator,
  };
  return (selectedItems, additionalArgs) => ({
    type: EXECUTE_GROUP_OPERATION,
    payload: {
      name,
      selectedItems,
      additionalArgs,
    },
    meta: {
      namespace,
    },
  });
};
