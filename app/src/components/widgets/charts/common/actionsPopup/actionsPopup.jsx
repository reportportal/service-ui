import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import styles from './actionsPopup.scss';

const cx = classNames.bind(styles);

export class ActionsPopup extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        icon: PropTypes.any,
        title: PropTypes.string,
        onClick: PropTypes.func,
        disabled: PropTypes.bool,
      }),
    ),
  };

  static defaultProps = {
    items: [],
  };

  render() {
    const { items } = this.props;

    return (
      <div className={cx('actions-popup')}>
        {items.map((item) => (
          <div key={item.id} className={cx('action-item')}>
            <GhostButton
              onClick={item.onClick}
              icon={item.icon}
              disabled={item.disabled}
              transparentBorder
              notMinified
              large
            >
              {item.title}
            </GhostButton>
          </div>
        ))}
      </div>
    );
  }
}
