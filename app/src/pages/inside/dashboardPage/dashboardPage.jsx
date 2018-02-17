import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import PropTypes from 'prop-types';

@connect(null, {
  showModalAction,
})
export class DashboardPage extends Component {
  static propTypes = {
    showModalAction: PropTypes.func.isRequired,
  };
  static defaultProps = {
    showModalAction: () => {},
  };
  render() {
    return (
      <button onClick={() => this.props.showModalAction({ modalType: 'dashboardModal' })}>
        click here to show modal
      </button>
    );
  }
}

