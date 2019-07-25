import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { analyticsEnabledSelector } from 'controllers/appInfo';
import { AnalyticsWrapper } from 'components/main/analytics/AnalyticsWrapper';
import { fetchInitialDataAction, initialDataReadySelector } from 'controllers/initialData';

@connect(
  (state) => ({
    isAnalyticsEnabled: analyticsEnabledSelector(state),
    isInitialDataReady: initialDataReadySelector(state),
  }),
  {
    fetchInitialDataAction,
  },
)
export class InitialDataContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
    initialDispatch: PropTypes.func.isRequired,
    isAnalyticsEnabled: PropTypes.bool.isRequired,
    fetchInitialDataAction: PropTypes.func.isRequired,
    isInitialDataReady: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    children: null,
  };

  state = {
    initialDataReady: false,
  };

  componentDidMount() {
    this.props.fetchInitialDataAction();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.isInitialDataReady !== this.props.isInitialDataReady &&
      this.props.isInitialDataReady
    ) {
      this.props.initialDispatch();
    }
  }

  render() {
    const { isAnalyticsEnabled } = this.props;
    const component = isAnalyticsEnabled ? (
      <AnalyticsWrapper>{this.props.children}</AnalyticsWrapper>
    ) : (
      this.props.children
    );

    return this.props.isInitialDataReady ? component : <span>Loading...</span>;
  }
}
