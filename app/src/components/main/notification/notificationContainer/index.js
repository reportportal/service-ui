import { connect } from 'react-redux';
import { hideNotification } from 'controllers/notification';
import { NotificationContainer as NotificationContainerComponent } from './notificationContainer';

const mapStateToProps = (state) => ({
  notifications: state.notifications,
});

export const NotificationContainer = connect(mapStateToProps, { hideNotification })(
  NotificationContainerComponent,
);
