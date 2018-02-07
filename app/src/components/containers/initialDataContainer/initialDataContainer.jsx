import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchInfoAction } from 'controllers/appInfo';
import {
  TOKEN_KEY,
  DEFAULT_TOKEN,
  fetchUserAction,
  authSuccessAction,
} from 'controllers/auth';

@connect(null, {
  fetchInfoAction,
  fetchUserAction,
  authSuccessAction,
})
export class InitialDataContainer extends Component {
  static propTypes = {
    fetchInfoAction: PropTypes.func.isRequired,
    fetchUserAction: PropTypes.func.isRequired,
    authSuccessAction: PropTypes.func.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  state = {
    initialDataReady: false,
  };

  componentDidMount() {
    const infoPromise = this.props.fetchInfoAction();
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      localStorage.setItem(TOKEN_KEY, DEFAULT_TOKEN);
    }
    const userPromise = this.props.fetchUserAction()
      .then(() => this.props.authSuccessAction())
      .catch(() => {
        localStorage.setItem(TOKEN_KEY, DEFAULT_TOKEN);
      });
    Promise.all([infoPromise, userPromise])
      .then(() => this.setState({ initialDataReady: true }));
  }

  render() {
    return (
      this.state.initialDataReady ? this.props.children : <span>Loading...</span>
    );
  }
}
