import { Component } from 'react';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import C3Chart from 'react-c3js';
import { DefectTypeTooltip } from 'pages/inside/launchesPage/defectTypeTooltip';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { projectConfigSelector, defectColorsSelector } from 'controllers/project';
import styles from './pieChart.scss';

const cx = classNames.bind(styles);
const chartConfig = {
  size: {
    width: 56,
    height: 56,
  },
  donut: {
    width: 12,
    label: {
      show: false,
    },
  },
  interaction: {
    enabled: false,
  },
  legend: {
    show: false,
  },
};
@withHoverableTooltip({
  TooltipComponent: DefectTypeTooltip,
  data: {
    width: 235,
    align: 'right',
    noArrow: true,
    desktopOnly: true,
    verticalOffset: -10,
  },
})
@connect(state => ({
  projectConfig: projectConfigSelector(state),
  defectColors: defectColorsSelector(state),
}))
export class PieChart extends Component {
  static propTypes = {
    type: PropTypes.string,
    data: PropTypes.object.isRequired,
    projectConfig: PropTypes.object.isRequired,
    defectColors: PropTypes.object.isRequired,
  };
  static defaultProps = {
    type: '',
  };
  getChartData = () => {
    const data = {
      columns: [],
      type: 'donut',
      order: null,
      colors: this.props.defectColors,
    };
    Object.keys(this.props.data)
      .forEach((key) => {
        if (key !== 'total') {
          data.columns.push([key, this.props.data[key]]);
        }
      });
    return data;
  };

  render() {
    const { data, type } = this.props;
    return (
      <a href="/">
        <div className={cx('chart-container')}>
          <C3Chart {...chartConfig} data={this.getChartData()} />
        </div>
        <div className={cx('total')} style={{ borderColor: this.props.defectColors[type] }}>
          { data.total }
        </div>
      </a>
    );
  }
}
