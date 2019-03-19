import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './tooltip.scss';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../constants';

const cx = classNames.bind(styles);
const DEFAULT_TOOLTIP_WIDTH = 200;

export class Tooltip extends Component {
  static propTypes = {
    data: PropTypes.object,
    hoverRect: PropTypes.object,
    hideTooltip: PropTypes.func,
    children: PropTypes.node,
  };
  static defaultProps = {
    data: {},
    hoverRect: null,
    hideTooltip: () => {},
    children: null,
  };
  state = {
    shown: false,
  };
  componentDidMount() {
    this.props.hoverRect.addEventListener('mouseleave', this.mouseLeaveHandler, false);
    this.setTooltipPosition();
    this.onMount();
  }
  componentWillUnmount() {
    this.props.hoverRect.removeEventListener('mouseleave', this.mouseLeaveHandler, false);
  }
  onMount() {
    this.setState({ shown: true });
  }
  setTooltipPosition = () => {
    const { data } = this.props;
    const hoverRect = this.getBox(this.props.hoverRect);
    const tooltipWidth = data.width || DEFAULT_TOOLTIP_WIDTH;
    let left = 0;
    if (data.dynamicWidth) {
      this.tooltip.style.maxWidth = `${tooltipWidth}px`;
    } else {
      this.tooltip.style.width = `${tooltipWidth}px`;
    }
    this.tooltip.style.top = `${hoverRect.top + hoverRect.height}px`;
    switch (data.align) {
      case ALIGN_LEFT:
        left = hoverRect.left;
        break;
      case ALIGN_RIGHT:
        left = hoverRect.right - tooltipWidth;
        break;
      default:
        left = hoverRect.left + (hoverRect.width / 2 - tooltipWidth / 2);
    }
    data.leftOffset && (left += data.leftOffset);
    this.tooltip.style.left = `${left}px`;
  };
  getBox = (elem) => {
    const box = elem.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      top: box.top + window.pageYOffset,
      left: box.left + window.pageXOffset,
      right: box.right,
    };
  };
  mouseLeaveHandler = () => {
    this.setState({ shown: false });
  };
  render() {
    return (
      <CSSTransition
        in={this.state.shown}
        timeout={300}
        classNames={cx('tooltip-fade')}
        onExited={this.props.hideTooltip}
      >
        <div
          ref={(tooltip) => {
            this.tooltip = tooltip;
          }}
          className={cx('tooltip', { 'no-arrow': this.props.data.noArrow })}
        >
          <div className={cx('tooltip-content')}>{this.props.children}</div>
        </div>
      </CSSTransition>
    );
  }
}
