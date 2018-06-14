import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { InvalidIconTooltip } from './invalidIconTooltip';
import styles from './iconStateIndicators.scss';
import WarningIcon from './img/ic-warning-inline.svg';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: InvalidIconTooltip,
  data: {
    width: 160,
    noArrow: false,
    desktopOnly: true,
  },
})
export class InvalidIcon extends Component {
  static propTypes = {
    rejectMessage: PropTypes.string,
  };

  static defaultProps = {
    rejectMessage: '',
  };

  render() {
    return <div className={cx('indicator-icon')}>{Parser(WarningIcon)}</div>;
  }
}
