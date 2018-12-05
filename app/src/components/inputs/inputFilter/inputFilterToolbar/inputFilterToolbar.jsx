import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { BigButton } from '../../../buttons/bigButton';
import styles from './inputFilterToolbar.scss';

const cx = classNames.bind(styles);

export class InputFilterToolbar extends PureComponent {
  static propTypes = {
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    onClear: PropTypes.func,
  };
  static defaultProps = {
    onApply: () => {},
    onCancel: () => {},
    onClear: () => {},
  };

  render() {
    const { onApply, onClear, onCancel } = this.props;

    return (
      <div className={cx('toolbar')}>
        <div className={cx('button-container', 'left')}>
          <BigButton color={'white-two'} onClick={onClear}>
            Clear all filters
          </BigButton>
        </div>
        <div className={cx('button-container', 'middle')}>
          <BigButton color={'white-two'} onClick={onCancel}>
            Cancel
          </BigButton>
        </div>
        <div className={cx('button-container')}>
          <BigButton color={'topaz'} onClick={onApply}>
            Apply
          </BigButton>
        </div>
      </div>
    );
  }
}
