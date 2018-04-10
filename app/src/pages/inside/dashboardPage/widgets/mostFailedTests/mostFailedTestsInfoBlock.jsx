import * as React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './mostFailedTests.scss';

const cx = classNames.bind(styles);

function MostFailedTestsInfoBlock({ launchName, issueType }) {
  return (
    <div className={cx('info-block')}>
      <p>
        <FormattedMessage
          id="MostFailedTests.header.launchName"
          defaultMessage="Launch name"
        />: <span className={cx('info-block-launch-name')}>{launchName}</span>
      </p>
      <p>
        <FormattedMessage
          id="MostFailedTests.header.basedOn"
          defaultMessage="Based on"
        />: <span className={cx('info-block-launch-name')}>{issueType}</span>
      </p>
    </div>
  );
}

MostFailedTestsInfoBlock.propTypes = {
  launchName: string.isRequired,
  issueType: string,
};

MostFailedTestsInfoBlock.defaultProps = {
  issueType: null,
};

export default MostFailedTestsInfoBlock;
