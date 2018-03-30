import * as React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './failedTests.scss';

const cx = classNames.bind(styles);

function FailedTestsInfoBlock({ launchName }) {
  return (
    <div className={cx('info-block')}>
      <p>
        <FormattedMessage
          id="FlakyTests.header.launchName"
          defaultMessage="Launch name"
        />: <span className={cx('info-block-launch-name')}>{launchName}</span></p>
    </div>
  );
}

FailedTestsInfoBlock.propTypes = {
  launchName: string.isRequired,
};

export default FailedTestsInfoBlock;
