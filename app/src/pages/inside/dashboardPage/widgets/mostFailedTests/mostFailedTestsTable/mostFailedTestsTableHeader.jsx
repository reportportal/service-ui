import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from '../mostFailedTests.scss';

const cx = classNames.bind(styles);

function FlakyTestsTableHeader() {
  return (
    <div className={cx('failed-tests-table-header')}>
      <div className={cx('col', 'col-name')}>
        <FormattedMessage
          id="MostFailedTests.table.header.testCase"
          defaultMessage="Test case"
        />
      </div>
      <div className={cx('col', 'col-count')}>
        <span className={cx('full')}>
          <FormattedMessage
            id="MostFailedTests.table.header.issuesInExec"
            defaultMessage="Issues in execution"
          />
        </span>
        <span className={cx('short')}>
          <FormattedMessage
            id="MostFailedTests.table.header.issuesInExecShort"
            defaultMessage="Issues"
          />
        </span>
      </div>
      <div className={cx('col', 'col-percents')}>
        <span className={cx('full')}>
          <FormattedMessage
            id="MostFailedTests.table.header.ofIssues"
            defaultMessage="% of issues"
          />
        </span>
        <span className={cx('short')}>
          <FormattedMessage
            id="MostFailedTests.table.header.ofIssuesShort"
            defaultMessage="% issues"
          />
        </span>
      </div>
      <div className={cx('col', 'col-date')}>
        <FormattedMessage
          id="MostFailedTests.table.header.lastIssue"
          defaultMessage="Last issue"
        />
      </div>
    </div>
  );
}

export default FlakyTestsTableHeader;
