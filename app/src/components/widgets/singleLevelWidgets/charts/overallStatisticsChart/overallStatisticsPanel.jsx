import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { orderedDefectFieldsSelector } from 'controllers/project';
import { TotalStatistics } from './totalStatistics';
import { OverallDefects } from './overallDefects';
import styles from './overallStatistics.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  orderedContentFields: orderedDefectFieldsSelector(state),
}))
export class OverallStatisticsPanel extends React.PureComponent {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    orderedContentFields: PropTypes.array.isRequired,
    isPreview: PropTypes.bool,
  };

  static defaultProps = {
    isPreview: false,
  };

  getOrderedValues = () => {
    const { widget, orderedContentFields } = this.props;
    const values = widget.content.result[0].values;

    return orderedContentFields
      .filter((key) => widget.contentParameters.contentFields.indexOf(key) !== -1)
      .map((key) => ({ key, value: values[key] || 0 }));
  };

  getTotals = () => {
    const { widget } = this.props;
    const values = widget.content.result[0].values;
    const fields = widget.contentParameters.contentFields.filter(
      (field) => field.indexOf('executions') !== -1,
    );
    const newValues = {};

    fields.forEach((field) => {
      newValues[field] = values[field] || 0;
    });

    return newValues;
  };

  render() {
    const { isPreview } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('total')}>
          <TotalStatistics values={this.getTotals()} />
        </div>

        {!isPreview && (
          <div className={cx('defects')}>
            <OverallDefects valuesArray={this.getOrderedValues()} />
          </div>
        )}
      </div>
    );
  }
}
