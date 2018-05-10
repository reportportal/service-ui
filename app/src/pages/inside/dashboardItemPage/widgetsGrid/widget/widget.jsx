import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './widget.scss';

const cx = classNames.bind(styles);

export class Widget extends PureComponent {
  static propTypes = {
    switchDraggable: PropTypes.func,
  };

  static defaultProps = {
    switchDraggable: () => {},
  };

  constructor(props) {
    super(props);
    this.isDragging = false;
  }

  onHeaderMouseOver = () => {
    this.props.switchDraggable(true);
  };

  onHeaderMouseDown = () => {
    this.isDragging = true;
  };

  onHeaderMouseUp = () => {
    this.isDragging = false;
  };

  onWidgetMouseOver = () => {
    if (!this.isDragging) {
      this.props.switchDraggable(false);
    }
  };

  render() {
    return (
      <div className={cx('widget-container')}>
        <div
          className={cx('widget-header')}
          onMouseOver={this.onHeaderMouseOver}
          onMouseUp={this.onHeaderMouseUp}
          onMouseDown={this.onHeaderMouseDown}
        />
        <div className={cx('widget')} onMouseOver={this.onWidgetMouseOver} />
      </div>
    );
  }
}
