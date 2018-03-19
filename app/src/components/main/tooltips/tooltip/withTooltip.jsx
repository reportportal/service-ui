import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Tooltip } from './tooltip';

const TooltipRoot = document.getElementById('tooltip-root');

export const withTooltip = ({ TooltipComponent, data }) => WrappedComponent => (
  class Wrapper extends Component {
    static propTypes = {
      children: PropTypes.node,
    };
    static defaultProps = {
      children: null,
    };
    state = {
      shown: false,
      hoverRect: null,
    };
    componentDidMount() {
      this.hoverRect.addEventListener('mouseenter', this.mouseEnterHandler, false);
    }
    componentWillUnmount() {
      this.hoverRect.removeEventListener('mouseenter', this.mouseEnterHandler, false);
    }
    mouseEnterHandler = () => {
      this.setState({ shown: true });
    };
    hideTooltip = () => {
      this.setState({ shown: false });
    };
    render() {
      return (
        <Fragment>
          {
            ReactDOM.createPortal(
              this.state.shown
                ? <Tooltip data={data} hoverRect={this.hoverRect} hideTooltip={this.hideTooltip}>
                  <TooltipComponent {...this.props} />
                </Tooltip>
                : null
              ,
              TooltipRoot,
            )
          }
          <div style={{ width: '100%', height: '100%' }} ref={(hoverRect) => { this.hoverRect = hoverRect; }} >
            <WrappedComponent {...this.props}>
              { this.props.children }
            </WrappedComponent>
          </div>
        </Fragment>

      );
    }
});
