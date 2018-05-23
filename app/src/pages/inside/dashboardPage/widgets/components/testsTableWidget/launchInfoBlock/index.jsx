import * as React from 'react';
import { string, element } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './launchInfoBlock.scss';

const cx = classNames.bind(styles);

export const LaunchInfoBlock = ({ launchName, issueType }) => (
  <div className={cx('info-block')}>
    <p>
      <FormattedMessage id="TestsTableWidget.header.launchName" defaultMessage="Launch name" />:{' '}
      <span className={cx('info-block-launch-name')}>{launchName}</span>
    </p>
    {issueType && (
      <p>
        <FormattedMessage id="TestsTableWidget.header.basedOn" defaultMessage="Based on" />:{' '}
        <span className={cx('info-block-launch-name')}>{issueType}</span>
      </p>
    )}
  </div>
);

LaunchInfoBlock.propTypes = {
  launchName: string.isRequired,
  issueType: element,
};

LaunchInfoBlock.defaultProps = {
  issueType: null,
};
