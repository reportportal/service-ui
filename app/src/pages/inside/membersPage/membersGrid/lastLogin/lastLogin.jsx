import { Fragment } from 'react';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { AbsRelTime } from 'components/main/absRelTime';

import styles from './lastLogin.scss';

const cx = classNames.bind(styles);

export const LastLogin = ({ time }) => (
  <Fragment>
    <span className={cx('mobile-title', 'mobile-show')}>
      <FormattedMessage id={'LastLogin.mobileTitle'} defaultMessage={'Last login:'} />
    </span>
    <AbsRelTime startTime={time} />
  </Fragment>
);

LastLogin.propTypes = {
  time: PropTypes.number,
};
LastLogin.defaultProps = {
  time: 0,
};
