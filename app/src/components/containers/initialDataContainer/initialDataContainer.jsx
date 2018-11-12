import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchInfoAction, analyticsEnabledSelector } from 'controllers/appInfo';
import { AnalyticsWrapper } from 'components/main/analytics/AnalyticsWrapper';
import { fetchProjectAction } from 'controllers/project';
import { fetchUserAction, activeProjectSelector } from 'controllers/user';
import { authSuccessAction, setTokenAction } from 'controllers/auth';

@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
    isAnalyticsEnabled: analyticsEnabledSelector(state),
  }),
  {
    fetchInfoAction,
    fetchUserAction,
    fetchProjectAction,
    authSuccessAction,
    setTokenAction,
  },
)
export class InitialDataContainer extends Component {
  static propTypes = {
    fetchInfoAction: PropTypes.func.isRequired,
    fetchProjectAction: PropTypes.func.isRequired,
    fetchUserAction: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
    authSuccessAction: PropTypes.func.isRequired,
    setTokenAction: PropTypes.func.isRequired,
    children: PropTypes.node,
    initialDispatch: PropTypes.func.isRequired,
    isAnalyticsEnabled: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    children: null,
  };

  state = {
    initialDataReady: false,
  };

  componentDidMount() {
    const infoPromise = this.props.fetchInfoAction();

    const userPromise = this.props
      .fetchUserAction()
      .then(({ activeProject }) =>
        this.props.fetchProjectAction(activeProject).then(() => this.props.authSuccessAction()),
      )
      .catch(() => {
        this.props.setTokenAction();
      });

    Promise.all([infoPromise, userPromise]).then(() => {
      this.props.initialDispatch();
      this.setState({ initialDataReady: true });
    });
  }

  render() {
    const { isAnalyticsEnabled } = this.props;
    const component = isAnalyticsEnabled ? (
      <AnalyticsWrapper>{this.props.children}</AnalyticsWrapper>
    ) : (
      this.props.children
    );

    return this.state.initialDataReady ? component : <span>Loading...</span>;
  }
}
