import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { BigButton } from 'components/buttons/bigButton';
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
      <div className={cx('input-filter-toolbar')}>
        <div className={cx('button-container', 'left')}>
          <BigButton color="white-two" onClick={onClear}>
            <span className={cx('button', 'clear-all-filters')}>
              <FormattedMessage
                id="InputFilterToolbar.clearAllfilters"
                defaultMessage="Clear all filters"
              />
            </span>
          </BigButton>
        </div>
        <div className={cx('button-splitter')}>
          <div className={cx('button-container', 'right')}>
            <BigButton color="white-two" onClick={onCancel}>
              <span className={cx('button', 'cancel')}>
                <FormattedMessage id="Common.cancel" defaultMessage="Cancel" />
              </span>
            </BigButton>
          </div>
          <div className={cx('button-container', 'right')}>
            <BigButton color="topaz" roundedCorners onClick={onApply}>
              <span className={cx('button', 'apply')}>
                <FormattedMessage id="InputFilterToolbar.apply" defaultMessage="Apply" />
              </span>
            </BigButton>
          </div>
        </div>
      </div>
    );
  }
}
