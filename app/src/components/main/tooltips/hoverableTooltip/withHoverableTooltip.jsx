import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HoverableTooltip } from './hoverableTooltip';

/* eslint-disable react/prefer-stateless-function */
export const withHoverableTooltip = ({ TooltipComponent, data }) => (WrappedComponent) =>
  class Wrapper extends Component {
    static propTypes = {
      children: PropTypes.node,
    };
    static defaultProps = {
      children: null,
    };

    render() {
      return (
        <HoverableTooltip data={data} render={() => <TooltipComponent {...this.props} />}>
          <WrappedComponent {...this.props}>{this.props.children}</WrappedComponent>
        </HoverableTooltip>
      );
    }
  };
