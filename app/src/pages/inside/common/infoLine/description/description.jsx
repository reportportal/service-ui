import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import TooltipIcon from 'common/img/tooltip-icon-inline.svg';
import { DescriptionTooltip } from './descriptionTooltip';
import styles from './description.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: DescriptionTooltip,
  data: {
    width: 420,
    placement: 'bottom-start',
    noArrow: true,
  },
})
export class Description extends Component {
  static propTypes = {
    description: PropTypes.string,
  };

  static defaultProps = {
    description: '',
  };

  render() {
    return (
      <div className={cx('description-block')}>
        <div className={cx('description-icon')}>{Parser(TooltipIcon)}</div>
      </div>
    );
  }
}
