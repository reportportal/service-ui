import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './flakyTests.scss';

const cx = classNames.bind(styles);

function FlakyTestsTableHeader() {
  return (
    <div className={cx('most-failed-table-header')}>
      <div className={cx('col', 'col-name')}>
        <FormattedMessage
          id="FlakyTests.table.header.testCase"
          defaultMessage="Test case"
        />
      </div>
      <div className={cx('col', 'col-count')}>
        <span className={cx('full')}>
          <FormattedMessage
            id="FlakyTests.table.header.issuesInExec"
            defaultMessage="Issues in execution"
          />
        </span>
        <span className={cx('short')}>
          <FormattedMessage
            id="FlakyTests.table.header.issuesInExecShort"
            defaultMessage="Issues"
          />
        </span>
      </div>
      <div className={cx('col', 'col-percents')}>
        <span className={cx('full')}>
          <FormattedMessage
            id="FlakyTests.table.header.ofIssues"
            defaultMessage="% of issues"
          />
        </span>
        <span className={cx('short')}>
          <FormattedMessage
            id="FlakyTests.table.header.ofIssuesShort"
            defaultMessage="% issues"
          />
        </span>
      </div>
      <div className={cx('col', 'col-date')}>
        <FormattedMessage
          id="FlakyTests.table.header.lastIssue"
          defaultMessage="Last issue"
        />
      </div>
    </div>
  );
}

export default FlakyTestsTableHeader;
