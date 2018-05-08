import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import styles from './widget.scss';

const cx = classNames.bind(styles);

export class Widget extends PureComponent {
  state = {
    isDragging: false
  };

  onHeaderMouseOver = () => {
    this.props.switchDraggable(true);
  }

  onHeaderMouseDown = () => {
    this.setState({ isDragging: true });
  }

  onHeaderMouseUp = () => {
    this.setState({ isDragging: false });
  }

  onWidgetMouseOver = () => {
    if (!this.state.isDragging) {
      this.props.switchDraggable(false);
    }
  }

  render() {
    return (
      <div className={cx('widget-container')}>
        <div
          className={cx('widget-header')}
          onMouseOver={this.onHeaderMouseOver}
          onMouseUp={this.onHeaderMouseUp}
          onMouseDown={this.onHeaderMouseDown}
        >
        </div>
        <div
          className={cx('widget')}
          onMouseOver={this.onWidgetMouseOver}
        >
        </div>
      </div>
    );
  }
}