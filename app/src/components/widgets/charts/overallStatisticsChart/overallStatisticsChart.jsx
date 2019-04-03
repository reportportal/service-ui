import PropTypes from 'prop-types';
import { OverallStatisticsPanel } from './overallStatisticsPanel';
import { OverallStatisticsDonut } from './overallStatisticsDonut';

export class OverallStatisticsChart extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
  };
  views = {
    panel: (props) => <OverallStatisticsPanel {...props} />,
    donut: (props) => <OverallStatisticsDonut {...props} />,
  };

  render() {
    const { widget } = this.props;
    const { viewMode } = widget.contentParameters.widgetOptions;

    return viewMode ? this.views[viewMode](this.props) : '';
  }
}
