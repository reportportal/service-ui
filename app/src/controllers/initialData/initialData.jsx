import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchInfo } from 'controllers/appInfo';
import {
  fetchUser,
  TOKEN_KEY,
  setToken,
  clearToken,
  authSuccess,
  DEFAULT_TOKEN,
} from 'controllers/auth';

@connect(null, {
  fetchInfo,
  fetchUser,
  setToken,
  clearToken,
  authSuccess,
})
export class InitialData extends Component {
  static propTypes = {
    fetchInfo: PropTypes.func.isRequired,
    fetchUser: PropTypes.func.isRequired,
    setToken: PropTypes.func.isRequired,
    clearToken: PropTypes.func.isRequired,
    authSuccess: PropTypes.func,
  };

  state = {
    initialDataReady: false,
  };

  componentDidMount() {
    const infoPromise = this.props.fetchInfo();
    const token = localStorage.getItem(TOKEN_KEY) || DEFAULT_TOKEN;
    this.props.setToken(token);
    const userPromise = this.props.fetchUser(token)
      .then(() => this.props.authSuccess())
      .catch(this.props.clearToken);
    Promise.all([infoPromise, userPromise])
      .then(() => this.setState({ initialDataReady: true }));
  }

  render() {
    return (
      this.state.initialDataReady ? this.props.children : <span>Loading...</span>
    );
  }
}
