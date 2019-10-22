import PropTypes from 'prop-types';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { OverallStatisticsPanel } from './overallStatisticsPanel';
import { LaunchExecutionAndIssueStatistics } from '../launchExecutionAndIssueStatistics';

export class OverallStatisticsChart extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
  };

  views = {
    [MODES_VALUES[CHART_MODES.PANEL_VIEW]]: (props) => <OverallStatisticsPanel {...props} />,
    [MODES_VALUES[CHART_MODES.DONUT_VIEW]]: (props) => (
      <LaunchExecutionAndIssueStatistics {...props} />
    ),
  };

  render() {
    const { viewMode } = this.props.widget.contentParameters.widgetOptions;

    return viewMode ? this.views[viewMode](this.props) : '';
  }
}
