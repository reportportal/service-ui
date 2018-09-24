import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { instanceIdSelector } from 'controllers/appInfo';
import track from 'react-tracking';
import ReactGA from 'react-ga';

const PAGE_VIEW = 'pageview';
const GOOGLE_ANALYTICS_INSTANCE = 'UA-96321031-1';

@connect(
  (state) => ({
    instanceId: instanceIdSelector(state),
  }),
  null,
)
@track(
  {},
  {
    dispatch: (data) => {
      if (data.actionType && data.actionType === PAGE_VIEW) {
        ReactGA.pageview(data.page);
      } else {
        ReactGA.event(data);
      }
    },
    process: (ownTrackingData) => (ownTrackingData.page ? { actionType: PAGE_VIEW } : null),
  },
)
export class AnalyticsWrapper extends Component {
  static propTypes = {
    instanceId: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  componentDidMount() {
    ReactGA.initialize(GOOGLE_ANALYTICS_INSTANCE);
    ReactGA.pageview(window.location.hash.substr(1));
    ReactGA.set({ dimension1: this.props.instanceId });
  }

  render() {
    return this.props.children;
  }
}
