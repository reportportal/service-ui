import { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import C3Chart from 'react-c3js';
import { DefectTypeTooltip } from 'pages/inside/launchesPage/defectTypeTooltip';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { projectConfigSelector } from 'controllers/project';
import styles from './pieChart.scss';

const cx = classNames.bind(styles);

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
}))
export class PieChart extends PureComponent {
  static propTypes = {
    type: PropTypes.string,
    data: PropTypes.object.isRequired,
    projectConfig: PropTypes.object.isRequired,
  };
  static defaultProps = {
    type: '',
  };
  getChartData = () => {
    const data = {
      columns: [],
      type: 'donut',
      order: null,
      colors: {},
    };
    Object.keys(this.props.data)
      .forEach((key) => {
        if (key !== 'total') {
          const defectType = this.props.projectConfig.subTypes[this.props.type.toUpperCase()];
          data.columns.push([key, this.props.data[key]]);
          data.colors[key] = defectType.find(item => item.locator === key).color;
        }
      });
    return data;
  };
  chartConfig = {
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

  render() {
    const { data, type, projectConfig } = this.props;
    const color = projectConfig.subTypes[type.toUpperCase()][0].color;
    return (
      <a href="/">
        <div className={cx('chart-container')}>
          <C3Chart {...this.chartConfig} data={this.getChartData()} />
        </div>
        <div className={cx('total')} style={{ borderColor: color }}>
          { data.total }
        </div>
      </a>
    );
  }
}
