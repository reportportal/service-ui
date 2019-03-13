import React from 'react';
import ReactDOM from 'react-dom';
import { NotificationList } from './notificationList';

const notificationRoot = document.getElementById('notification-root');

export const NotificationContainer = () =>
  ReactDOM.createPortal(<NotificationList />, notificationRoot);
