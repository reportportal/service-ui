import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { TotalStatistics } from './totalStatistics';
import { OverallDefects } from './overallDefects';
import styles from './overallStatistics.scss';

const cx = classNames.bind(styles);

export class OverallStatisticsPanel extends React.PureComponent {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
  };

  static defaultProps = {
    isPreview: false,
  };
  render() {
    const { widget, isPreview } = this.props;
    const values = widget.content.result.values;

    return (
      <div className={cx('container')}>
        <div className={cx('total')}>
          <TotalStatistics values={values} />
        </div>

        {!isPreview && (
          <div className={cx('defects')}>
            <OverallDefects values={values} />
          </div>
        )}
      </div>
    );
  }
}
