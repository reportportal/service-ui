import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './tooltip.scss';

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
    const hoverRect = this.getBox(this.props.hoverRect);
    const tooltipWidth = this.props.data.width || DEFAULT_TOOLTIP_WIDTH;
    this.tooltip.style.width = `${tooltipWidth}px`;
    this.tooltip.style.top = `${hoverRect.top + hoverRect.height}px`;
    this.tooltip.style.left = `${hoverRect.left + ((hoverRect.width / 2) - (tooltipWidth / 2))}px`;
  };
  getBox = (elem) => {
    const box = elem.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      top: box.top + window.pageYOffset,
      left: box.left + window.pageXOffset,
    };
  };
  mouseLeaveHandler = () => {
    this.setState({ shown: false });
  };
  render() {
    return (
      <CSSTransition in={this.state.shown} timeout={300} classNames={cx('tooltip-fade')} onExited={this.props.hideTooltip}>
        <div ref={(tooltip) => { this.tooltip = tooltip; }} className={cx('tooltip')}>
          <div className={cx('tooltip-content')}>
            { this.props.children }
          </div>
        </div>
      </CSSTransition>
    );
  }
}
