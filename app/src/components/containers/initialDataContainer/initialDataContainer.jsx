import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchInfoAction } from 'controllers/appInfo';
import { fetchProjectAction } from 'controllers/project';
import { fetchUserAction, activeProjectSelector } from 'controllers/user';
import {
  TOKEN_KEY,
  DEFAULT_TOKEN,
  authSuccessAction,
} from 'controllers/auth';

@connect(
  state => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    fetchInfoAction,
    fetchUserAction,
    fetchProjectAction,
    authSuccessAction,
  },
)
export class InitialDataContainer extends Component {
  static propTypes = {
    fetchInfoAction: PropTypes.func.isRequired,
    fetchProjectAction: PropTypes.func.isRequired,
    fetchUserAction: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
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
      .then(() => this.props.fetchProjectAction(this.props.activeProject)
          .then(() => this.props.authSuccessAction()),
      )
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
