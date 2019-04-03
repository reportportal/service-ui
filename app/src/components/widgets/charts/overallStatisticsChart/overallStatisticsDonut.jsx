import PropTypes from 'prop-types';
import { LaunchExecutionAndIssueStatistics } from '../launchExecutionAndIssueStatistics';

export class OverallStatisticsDonut extends React.PureComponent {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    observer: {
      subscribe() {},
    },
  };

  render() {
    return <LaunchExecutionAndIssueStatistics {...this.props} />;
  }
}
