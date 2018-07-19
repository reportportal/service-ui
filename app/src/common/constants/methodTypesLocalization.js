import { defineMessages } from 'react-intl';
import * as methodTypes from './methodTypes';

export const methodTypesLocalization = defineMessages({
  [methodTypes.TEST]: {
    id: 'MethodTypes.test',
    defaultMessage: 'Test class',
  },
  [methodTypes.STEP]: {
    id: 'MethodTypes.step',
    defaultMessage: 'Test',
  },
  [methodTypes.AFTER_CLASS]: {
    id: 'MethodTypes.afterClass',
    defaultMessage: 'After class',
  },
  [methodTypes.AFTER_GROUPS]: {
    id: 'MethodTypes.afterGroups',
    defaultMessage: 'After groups',
  },
  [methodTypes.AFTER_METHOD]: {
    id: 'MethodTypes.afterMethod',
    defaultMessage: 'After method',
  },
  [methodTypes.AFTER_SUITE]: {
    id: 'MethodTypes.afterSuite',
    defaultMessage: 'After suite',
  },
  [methodTypes.AFTER_TEST]: {
    id: 'MethodTypes.afterTest',
    defaultMessage: 'After test',
  },
  [methodTypes.BEFORE_CLASS]: {
    id: 'MethodTypes.beforeClass',
    defaultMessage: 'Before class',
  },
  [methodTypes.BEFORE_GROUPS]: {
    id: 'MethodTypes.beforeGroups',
    defaultMessage: 'Before groups',
  },
  [methodTypes.BEFORE_METHOD]: {
    id: 'MethodTypes.beforeMethod',
    defaultMessage: 'Before Method',
  },
  [methodTypes.BEFORE_SUITE]: {
    id: 'MethodTypes.beforeSuite',
    defaultMessage: 'Before suite',
  },
  [methodTypes.BEFORE_TEST]: {
    id: 'MethodTypes.beforeTest',
    defaultMessage: 'Before test',
  },
});
