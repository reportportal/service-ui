import {
  NOTIFICATION_TYPES,
  showDefaultErrorNotification,
  showNotification,
} from 'controllers/notification';
import { ERROR_CODES } from './constants';

export function tryParseConfig(config) {
  try {
    return JSON.parse(config);
  } catch {
    return null;
  }
}

export function getDashboardNotificationAction(error, name) {
  const dashboardExists = error.errorCode === ERROR_CODES.DASHBOARD_EXISTS;

  return dashboardExists
    ? showNotification({
        messageId: 'dashboardExists',
        type: NOTIFICATION_TYPES.ERROR,
        values: { name },
      })
    : showDefaultErrorNotification(error);
}
