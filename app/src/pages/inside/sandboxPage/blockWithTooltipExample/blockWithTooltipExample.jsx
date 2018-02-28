import React, { Component } from 'react';
import { withTooltip } from 'components/main/tooltip';
import { ExampleTooltip } from '../exampleTooltip';

@withTooltip({ TooltipComponent: ExampleTooltip, data: { width: 200 } })
export class BlockWithTooltipExample extends Component {
  render() {
    return (
      <div style={{ width: '100%', height: '100%', border: '1px solid red', boxSizing: 'border-box' }}>
        HOVER ME, AND YOU WIll SEE TOOLTIP
      </div>
    );
  }
}
