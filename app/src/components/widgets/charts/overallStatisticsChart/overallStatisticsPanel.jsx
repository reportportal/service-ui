import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { orderedContentFieldsSelector } from 'controllers/project';
import { TotalStatistics } from './totalStatistics';
import { OverallDefects } from './overallDefects';
import styles from './overallStatistics.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  orderedContentFields: orderedContentFieldsSelector(state),
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

    return orderedContentFields.map((key) => ({ key, value: values[key] || 0 }));
  };

  render() {
    const { widget, isPreview } = this.props;
    const values = widget.content.result[0].values;

    return (
      <div className={cx('container')}>
        <div className={cx('total')}>
          <TotalStatistics values={values} />
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
