import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import WarningIcon from 'common/img/error-inline.svg';
import { InvalidIconTooltip } from './invalidIconTooltip';
import styles from './iconStateIndicators.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: InvalidIconTooltip,
  data: {
    width: 160,
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
