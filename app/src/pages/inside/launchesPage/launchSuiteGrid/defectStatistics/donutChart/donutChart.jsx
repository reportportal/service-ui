import { Component } from 'react';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DefectTypeTooltip } from 'pages/inside/launchesPage/defectTypeTooltip';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { projectConfigSelector, defectColorsSelector } from 'controllers/project';
import styles from './donutChart.scss';

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
@connect((state) => ({
  projectConfig: projectConfigSelector(state),
  defectColors: defectColorsSelector(state),
}))
export class DonutChart extends Component {
  static propTypes = {
    type: PropTypes.string,
    data: PropTypes.object.isRequired,
    diameter: PropTypes.number.isRequired,
    strokeWidth: PropTypes.number.isRequired,
    projectConfig: PropTypes.object.isRequired,
    defectColors: PropTypes.object.isRequired,
  };
  static defaultProps = {
    type: '',
  };
  componentWillMount() {
    const defects = this.props.data;
    let offset = 75;
    Object.keys(this.props.data).forEach((defect) => {
      if (defect !== 'total') {
        const val = defects[defect];
        const percents = val / defects.total * 100;

        this.chartData.push({
          id: defect,
          value: percents,
          color: this.props.defectColors[defect],
          offset: 100 - offset,
        });
        offset += percents;
      }
    });
  }
  chartData = [];

  render() {
    const { data, type, diameter, strokeWidth } = this.props;
    const radius = diameter / 2;
    const r = 100 / (2 * Math.PI);

    return (
      <a href="/">
        <div className={cx('chart-container')}>
          <svg width="100%" height="100%" viewBox={`0 0 ${diameter} ${diameter}`} className="donut">
            <circle cx={radius} cy={radius} r={r} fill="transparent" />
            <circle
              cx={radius}
              cy={radius}
              r={r}
              fill="transparent"
              stroke="#d2d3d4"
              strokeWidth={strokeWidth}
            />
            {this.chartData.map((item) => (
              <circle
                key={item.id}
                cx={radius}
                cy={radius}
                r={r}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${item.value} ${100 - item.value}`}
                strokeDashoffset={item.offset}
              />
            ))}
          </svg>
        </div>
        <div className={cx('total')} style={{ borderColor: this.props.defectColors[type] }}>
          {data.total}
        </div>
      </a>
    );
  }
}
