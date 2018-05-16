import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { HoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import styles from './iconStateIndicators.scss';
import WarningIcon from './img/ic-warning-inline.svg';

const cx = classNames.bind(styles);

export const InvalidIcon = ({ rejectMessage }) => (
  <HoverableTooltip
    render={() => <p className={cx('invalid-tooltip')}> {rejectMessage} </p>}
    data={{
      width: 160,
      noArrow: false,
      desktopOnly: true,
    }}
  >
    <div className={cx('indicator-icon')}>{Parser(WarningIcon)}</div>
  </HoverableTooltip>
);

InvalidIcon.propTypes = {
  rejectMessage: PropTypes.string,
};
InvalidIcon.defaultProps = {
  rejectMessage: '',
};
