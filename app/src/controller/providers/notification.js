import { Provider } from 'cerebral';

export default Provider({
  info(messageId) {
    this.context.controller.getSignal('app.notification.showMessage')({ messageId, type: 'info' });
  },
  error(messageId) {
    this.context.controller.getSignal('app.notification.showMessage')({ messageId, type: 'error' });
  },
  success(messageId) {
    this.context.controller.getSignal('app.notification.showMessage')({ messageId, type: 'success' });
  },
  infoMessage(message) {
    this.context.controller.getSignal('app.notification.showMessage')({ message, type: 'info' });
  },
  errorMessage(message) {
    this.context.controller.getSignal('app.notification.showMessage')({ message, type: 'error' });
  },
  successMessage(message) {
    this.context.controller.getSignal('app.notification.showMessage')({ message, type: 'success' });
  },
});

export const successNotification = messageId => ({ notification }) => {
  notification.success(messageId);
};
export const infoNotification = messageId => ({ notification }) => {
  notification.info(messageId);
};
export const errorNotification = messageId => ({ notification }) => {
  notification.error(messageId);
};
export const successNotificationMessage = message => ({ notification }) => {
  notification.successMessage(message);
};
export const infoNotificationMessage = message => ({ notification }) => {
  notification.infoMessage(message);
};
export const errorNotificationMessage = message => ({ notification }) => {
  notification.errorMessage(message);
};
