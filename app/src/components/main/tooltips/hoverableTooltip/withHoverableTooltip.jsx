import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './hoverableTooltip.scss';

const cx = classNames.bind(styles);
const DEFAULT_TOOLTIP_WIDTH = 200;

export const withHoverableTooltip = ({ TooltipComponent, data }) => WrappedComponent => (
  class Wrapper extends Component {
    static propTypes = {
      children: PropTypes.node,
    };
    static defaultProps = {
      children: null,
    };
    componentDidMount() {
      const tooltipWidth = data.width || DEFAULT_TOOLTIP_WIDTH;
      this.tooltip.style.width = `${tooltipWidth}px`;
      this.tooltip.style.left = `${(this.hoverRect.offsetWidth / 2) - (tooltipWidth / 2)}px`;
    }
    render() {
      return (
        <div className={cx('hover-rect')} ref={(hoverRect) => { this.hoverRect = hoverRect; }} >
          <WrappedComponent>
            { this.props.children }
          </WrappedComponent>
          <div ref={(tooltip) => { this.tooltip = tooltip; }} className={cx('hoverable-tooltip')}>
            <div className={cx('hoverable-tooltip-content')}>
              <TooltipComponent />
            </div>
          </div>
        </div>
      );
    }
});
