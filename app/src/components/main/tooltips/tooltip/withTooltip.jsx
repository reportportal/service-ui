import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Manager, Reference, Popper } from 'react-popper';
import styles from './tooltip.scss';

const cx = classNames.bind(styles);
const DEFAULT_TOOLTIP_WIDTH = 300;

export const withTooltip = ({ TooltipComponent, data = {} }) => (WrappedComponent) =>
  class Wrapper extends Component {
    static propTypes = {
      children: PropTypes.node,
    };
    static defaultProps = {
      children: null,
    };
    state = {
      shown: false,
    };

    tooltipRoot = document.getElementById('tooltip-root');
    showTooltip = () => {
      this.setState({ shown: true });
    };
    hideTooltip = () => {
      this.setState({ shown: false });
    };
    render() {
      const { shown } = this.state;
      const styleWidth = data.dynamicWidth ? null : { width: data.width || DEFAULT_TOOLTIP_WIDTH };
      const topOffset = data.topOffset || 0;
      const leftOffset = data.leftOffset || 0;
      return (
        <Manager>
          <Reference>
            {({ ref }) => (
              <div
                ref={ref}
                className={cx('tooltip-trigger')}
                onMouseEnter={this.showTooltip}
                onMouseLeave={this.hideTooltip}
              >
                <WrappedComponent {...this.props}>{this.props.children}</WrappedComponent>
              </div>
            )}
          </Reference>
          {shown &&
            ReactDOM.createPortal(
              <Popper placement={data.placement} modifiers={data.modifiers}>
                {({ placement, ref, style, arrowProps }) => (
                  <div
                    className={cx('tooltip', {
                      'no-mobile': data.noMobile,
                      'desktop-only': data.desktopOnly,
                    })}
                    ref={ref}
                    style={{
                      ...style,
                      ...styleWidth,
                      top: style.top + topOffset,
                      left: style.left + leftOffset,
                    }}
                    data-placement={placement}
                    onMouseEnter={data.hoverable ? this.showTooltip : null}
                    onMouseLeave={data.hoverable ? this.hideTooltip : null}
                  >
                    <div className={cx('tooltip-content')}>
                      <TooltipComponent {...this.props} />
                      {!data.noArrow && (
                        <div
                          className={cx('tooltip-arrow')}
                          data-placement={placement}
                          ref={arrowProps.ref}
                          style={arrowProps.style}
                        />
                      )}
                    </div>
                  </div>
                )}
              </Popper>,
              this.tooltipRoot,
            )}
        </Manager>
      );
    }
  };
