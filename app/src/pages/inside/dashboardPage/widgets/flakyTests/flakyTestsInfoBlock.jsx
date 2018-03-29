import * as React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './flakyTests.scss';

const cx = classNames.bind(styles);

function FlakyTestsInfoBlock({ launchName }) {
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

FlakyTestsInfoBlock.propTypes = {
  launchName: string.isRequired,
};

export default FlakyTestsInfoBlock;
