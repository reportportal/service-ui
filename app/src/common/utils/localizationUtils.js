import { methodTypesLocalization } from 'common/constants/methodTypesLocalization';
import { statusLocalization } from 'common/constants/statusLocalization';

export const formatMethodType = (formatter, methodType) =>
  methodTypesLocalization[methodType] ? formatter(methodTypesLocalization[methodType]) : methodType;

export const formatStatus = (formatter, status) =>
  statusLocalization[status] ? formatter(statusLocalization[status]) : status;
