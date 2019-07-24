import React, { Component } from 'react';
import { withTooltip } from 'components/main/tooltips/tooltip';
import PropTypes from 'prop-types';
import { ExampleTooltip } from '../exampleTooltip';

@withTooltip({ TooltipComponent: ExampleTooltip, data: { width: 200 } })
export class BlockWithTooltip extends Component {
  static propTypes = {
    children: PropTypes.node,
  };
  static defaultProps = {
    children: null,
  };

  render() {
    return (
      <div
        style={{ width: '100%', height: '100%', border: '3px solid red', boxSizing: 'border-box' }}
      >
        {this.props.children}
      </div>
    );
  }
}
