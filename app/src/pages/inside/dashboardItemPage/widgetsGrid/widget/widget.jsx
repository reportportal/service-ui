import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './widget.scss';

const cx = classNames.bind(styles);

export class Widget extends PureComponent {
  static propTypes = {
    isModifiable: PropTypes.bool,
  };

  static defaultProps = {
    isModifiable: false,
  };

  render() {
    const headerClassName = cx('widget-header', { modifiable: this.props.isModifiable });

    return (
      <div className={cx('widget-container')}>
        <div className={`${headerClassName} draggable-field`} />
        <div className={cx('widget')} />
      </div>
    );
  }
}
