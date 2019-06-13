import { Fragment } from 'react';
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
        {typeof total !== 'undefined' && (
          <Fragment>
            <div className={cx('total')}>
              <div className={cx('amount')}>{total || 0}</div>
              <div>Total</div>
            </div>
            <ProgressBar progressData={progressData} />
          </Fragment>
        )}

        <div className={cx('details')}>
          <div className={cx('details-item')}>
            <div className={cx('amount')}>{passed || 0}</div>

            <div className={cx('label')}>
              <div className={cx('marker', 'passed')} /> Passed
            </div>
          </div>

          <div className={cx('details-item')}>
            <div className={cx('amount')}>{failed || 0}</div>

            <div className={cx('label')}>
              <div className={cx('marker', 'failed')} /> Failed
            </div>
          </div>

          <div className={cx('details-item')}>
            <div className={cx('amount')}>{skipped || 0}</div>

            <div className={cx('label')}>
              <div className={cx('marker')} /> Skipped
            </div>
          </div>
        </div>
      </div>
    );
  }
}
