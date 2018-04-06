import * as React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './failedTests.scss';

const cx = classNames.bind(styles);

function FailedTestsInfoBlock({ launchName, issueType }) {
  return (
    <div className={cx('info-block')}>
      <p>
        <FormattedMessage
          id="FlakyTests.header.launchName"
          defaultMessage="Launch name"
        />: <span className={cx('info-block-launch-name')}>{launchName}</span>
      </p>
      {
        issueType &&
        <p>
          <FormattedMessage
            id="FlakyTests.header.basedOn"
            defaultMessage="Based on"
          />: <span className={cx('info-block-launch-name')}>{issueType}</span>
        </p>
      }
    </div>
  );
}

FailedTestsInfoBlock.propTypes = {
  launchName: string.isRequired,
  issueType: string,
};

FailedTestsInfoBlock.defaultProps = {
  issueType: null,
};

export default FailedTestsInfoBlock;
