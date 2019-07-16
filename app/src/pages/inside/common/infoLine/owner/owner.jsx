import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './owner.scss';
import { OwnerTooltip } from './ownerTooltip';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: OwnerTooltip,
  data: { width: 'auto', align: 'left', noArrow: true },
})
export class Owner extends Component {
  static propTypes = {
    owner: PropTypes.string,
  };

  static defaultProps = {
    owner: '',
  };

  render() {
    return (
      <div className={cx('owner-block')}>
        <div className={cx('owner-icon')} />
      </div>
    );
  }
}
