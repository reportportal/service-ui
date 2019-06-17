import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { Legend } from 'components/widgets/charts/common/legend';
import { CumulativeChartBreadcrumbs } from './cumulativeChartBreadcrumbs';
import styles from './cumulativeTrendChart.scss';

const cx = classNames.bind(styles);

export class CumulativeChartLegend extends PureComponent {
  static propTypes = {
    onChangeFocusType: PropTypes.func.isRequired,
    onChangeTotals: PropTypes.func.isRequired,
    onChangeSeparate: PropTypes.func.isRequired,
    onChangePercentage: PropTypes.func.isRequired,
    attributes: PropTypes.array,
    activeAttribute: PropTypes.object,
    clearAttributes: PropTypes.func,
  };
  static defaultProps = {
    attributes: [],
    activeAttribute: null,
    clearAttributes: () => {},
  };
  constructor() {
    super();

    this.state = {
      defectTypes: false,
      totals: false,
      separate: false,
      percentage: false,
    };
  }

  onChangeFocusType = () => {
    const newVal = !this.state.defectTypes;
    const { onChangeFocusType } = this.props;

    this.setState({
      defectTypes: newVal,
    });

    onChangeFocusType(newVal);
  };

  onChangeTotals = () => {
    this.setState(
      {
        totals: !this.state.totals,
      },
      () => {
        this.props.onChangeTotals(this.state.totals);
      },
    );
  };

  onChangeSeparate = () => {
    this.setState(
      {
        separate: !this.state.separate,
      },
      () => {
        this.props.onChangeSeparate(this.state.separate);
      },
    );
  };

  onChangePercentage = () => {
    this.setState(
      {
        percentage: !this.state.percentage,
      },
      () => {
        this.props.onChangePercentage(this.state.percentage);
      },
    );
  };

  render() {
    const { defectTypes, totals, separate, percentage } = this.state;
    const { attributes, activeAttribute, clearAttributes } = this.props;
    return (
      <div className={cx('cumulative-trend-chart')}>
        <CumulativeChartBreadcrumbs
          attributes={attributes}
          activeAttribute={activeAttribute}
          clearAttributes={clearAttributes}
        />

        <Legend className={cx('legend')} {...this.props} />

        <div className={cx('controls')}>
          <div className={cx('control')}>
            <InputCheckbox value={defectTypes} onChange={this.onChangeFocusType}>
              Focus on Defect Types
            </InputCheckbox>
          </div>

          <div className={cx('control')}>
            <InputCheckbox className={cx('control')} value={totals} onChange={this.onChangeTotals}>
              Totals
            </InputCheckbox>
          </div>

          <div
            className={cx('control', 'separate', { 'separate-active': separate })}
            onClick={this.onChangeSeparate}
          >
            <InputCheckbox className={cx('control')} value={separate}>
              Separate
            </InputCheckbox>
          </div>

          <div
            className={cx('control', 'percentage', { 'percentage-active': percentage })}
            onClick={this.onChangePercentage}
          >
            <InputCheckbox className={cx('control')} value={percentage}>
              Percentage
            </InputCheckbox>
          </div>
        </div>
      </div>
    );
  }
}
