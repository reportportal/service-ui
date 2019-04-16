import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Manager, Reference, Popper } from 'react-popper';
import styles from './hoverableTooltip.scss';

const cx = classNames.bind(styles);

export const withHoverableTooltip = ({ TooltipComponent, data }) => (WrappedComponent) =>
  class Wrapper extends Component {
    static propTypes = {
      children: PropTypes.node,
    };

    static defaultProps = {
      children: null,
    };

    state = {
      showTooltip: false,
    };

    showTooltip = () => {
      this.setState({ showTooltip: true });
    };

    hideTooltip = () => {
      this.setState({ showTooltip: false });
    };

    render() {
      const { showTooltip } = this.state;

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
          {showTooltip &&
            ReactDOM.createPortal(
              <Popper placement={data.placement} modifiers={data.modifiers}>
                {({ placement, ref, style, arrowProps }) => (
                  <div
                    className={cx('tooltip', {
                      'no-mobile': data.noMobile,
                      'desktop-only': data.desktopOnly,
                    })}
                    ref={ref}
                    style={{ ...style, width: data.width }}
                    data-placement={placement}
                    onMouseEnter={this.showTooltip}
                    onMouseLeave={this.hideTooltip}
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
              document.querySelector('#tooltip-root'),
            )}
        </Manager>
      );
    }
  };
