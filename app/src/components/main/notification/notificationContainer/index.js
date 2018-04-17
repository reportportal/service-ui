import { connect } from 'react-redux';
import { NotificationContainer as NotificationContainerComponent } from './notificationContainer';

const mapStateToProps = (state) => ({
  notifications: state.notifications,
});

export const NotificationContainer = connect(mapStateToProps)(NotificationContainerComponent);
