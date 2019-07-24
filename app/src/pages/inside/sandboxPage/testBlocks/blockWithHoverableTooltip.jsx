import React, { Component } from 'react';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import PropTypes from 'prop-types';
import { ExampleTooltip } from '../exampleTooltip';

@withHoverableTooltip({ TooltipComponent: ExampleTooltip, data: { width: 400 } })
export class BlockWithHoverableTooltip extends Component {
  static propTypes = {
    children: PropTypes.node,
  };
  static defaultProps = {
    children: null,
  };

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          border: '3px solid green',
          boxSizing: 'border-box',
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
