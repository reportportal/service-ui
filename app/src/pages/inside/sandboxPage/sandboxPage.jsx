import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import PropTypes from 'prop-types';
import { BlockWithTooltip, BlockWithHoverableTooltip } from './testBlocks';

@connect(null, {
  showModalAction,
})
export class SandboxPage extends Component {
  static propTypes = {
    showModalAction: PropTypes.func.isRequired,
  };
  static defaultProps = {
    showModalAction: () => {},
  };
  render() {
    return (
      <div>
        <h1>Sandbox Page</h1>
        <br />
        <button onClick={() => this.props.showModalAction({ id: 'exampleModal', data: { param1: '123', param2: 312 } })}>
          click here to show modal
        </button>
        <br />
        <div style={{ width: 300, height: 50, marginLeft: 50, marginTop: 50 }}>
          <BlockWithTooltip>
            Hover me!
          </BlockWithTooltip>
        </div>
        <div style={{ width: 300, height: 50, marginLeft: 50, marginTop: 50 }}>
          <BlockWithHoverableTooltip>
            Hover me or my tooltip!
          </BlockWithHoverableTooltip>
        </div>
      </div>
    );
  }
}
