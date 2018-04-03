import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './hoverableTooltip.scss';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../constants';

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
      let left = 0;
      this.tooltip.style.width = `${tooltipWidth}px`;
      switch (data.align) {
        case ALIGN_LEFT:
          left = 0;
          break;
        case ALIGN_RIGHT:
          left = this.hoverRect.offsetWidth - tooltipWidth;
          break;
        default:
          left = `${(this.hoverRect.offsetWidth / 2) - (tooltipWidth / 2)}`;
      }
      data.leftOffset && (left += data.leftOffset);
      this.tooltip.style.left = `${left}px`;

      if (data.verticalOffset) {
        this.tooltip.style.top = `${this.hoverRect.offsetHeight + data.verticalOffset}px`;
      }
    }
    render() {
      return (
        <div className={cx('hover-rect')} ref={(hoverRect) => { this.hoverRect = hoverRect; }} >
          <WrappedComponent {...this.props}>
            { this.props.children }
          </WrappedComponent>
          <div
            ref={(tooltip) => { this.tooltip = tooltip; }}
            className={cx(
              'hoverable-tooltip',
              {
                'no-arrow': data.noArrow,
                'no-mobile': data.noMobile,
                'desktop-only': data.desktopOnly,
              },
            )}
          >
            <div className={cx('hoverable-tooltip-content')}>
              <TooltipComponent {...this.props} />
            </div>
          </div>
        </div>
      );
    }
});
