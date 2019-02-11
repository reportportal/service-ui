import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './common.scss';

const cx = classNames.bind(styles);

export const CreateUser = ({ activity }) => (
  <div className={cx('create-user', 'clearfix')}>
    <span className={cx('new-user-name')}>{activity.details.objectName}, </span>
    <FormattedMessage id="CreateUser.welcome" defaultMessage="welcome to Report Portal!" />
  </div>
);
CreateUser.propTypes = {
  activity: PropTypes.object,
};
CreateUser.defaultProps = {
  activity: {},
};
