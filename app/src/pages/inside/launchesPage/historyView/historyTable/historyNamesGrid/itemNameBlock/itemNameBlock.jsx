import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { ItemInfoToolTip } from './itemInfoToolTip';
import styles from './itemNameBlock.scss';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: ItemInfoToolTip,
  data: {
    width: 500,
    align: 'left',
    noArrow: true,
    desktopOnly: true,
  },
})
export class ItemNameBlock extends Component {
  static propTypes = {
    data: PropTypes.object,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const { data } = this.props;

    return (
      <div className={cx('history-grid-record-name')}>
        <span>{data.name}</span>
      </div>
    );
  }
}
