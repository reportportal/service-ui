import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { ProgressBar } from './progressBar';
import styles from './totalStatistics.scss';

const cx = classNames.bind(styles);

export class TotalStatistics extends React.PureComponent {
  static propTypes = {
    values: PropTypes.object.isRequired,
  };

  render() {
    const { values } = this.props;
    const total = values.statistics$executions$total;
    const passed = values.statistics$executions$passed;
    const failed = values.statistics$executions$failed;
    const skipped = values.statistics$executions$skipped;
    const progressData = { total, passed, failed, skipped };

    return (
      <div className={cx('container')}>
        <div className={cx('total')}>
          <div className={cx('amount')}>{total}</div>

          <div>Total</div>
        </div>

        <ProgressBar progressData={progressData} />

        <div className={cx('details')}>
          <div className={cx('details-item')}>
            <div className={cx('amount')}>{passed}</div>

            <div className={cx('label')}>
              <div className={cx('marker', 'passed')} /> Passed
            </div>
          </div>

          <div className={cx('details-item')}>
            <div className={cx('amount')}>{failed}</div>

            <div className={cx('label')}>
              <div className={cx('marker', 'failed')} /> Failed
            </div>
          </div>

          <div className={cx('details-item')}>
            <div className={cx('amount')}>{skipped}</div>

            <div className={cx('label')}>
              <div className={cx('marker')} /> Skipped
            </div>
          </div>
        </div>
      </div>
    );
  }
}
