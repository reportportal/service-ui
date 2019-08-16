import PropTypes from 'prop-types';
import { CHART_MODES } from 'common/constants/chartModes';
import { OverallStatisticsPanel } from './overallStatisticsPanel';
import { LaunchExecutionAndIssueStatistics } from '../launchExecutionAndIssueStatistics';

export class OverallStatisticsChart extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
  };

  views = {
    [CHART_MODES.PANEL_VIEW]: (props) => <OverallStatisticsPanel {...props} />,
    [CHART_MODES.DONUT_VIEW]: (props) => <LaunchExecutionAndIssueStatistics {...props} />,
  };

  render() {
    const { viewMode } = this.props.widget.contentParameters.widgetOptions;

    return viewMode ? this.views[viewMode](this.props) : '';
  }
}
