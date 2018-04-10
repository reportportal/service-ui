import * as React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { PTIssueType } from './pTypes';
import styles from './mostFailedTests.scss';

const cx = classNames.bind(styles);

class MostFailedTestsInfoBlock extends React.PureComponent {
  getIssueTypeMessage = (issueType) => {
    const type = issueType.split('$')[2];

    switch (type) {
      case 'failed':
        return (
          <FormattedMessage id="MostFailedTests.header.issueType.failed" defaultMessage="Failed" />
        );
      case 'skipped':
        return (
          <FormattedMessage
            id="MostFailedTests.header.issueType.skipped"
            defaultMessage="Skipped"
          />
        );
      case 'product_bug':
        return (
          <FormattedMessage
            id="MostFailedTests.header.issueType.product_bug"
            defaultMessage="Product Bug"
          />
        );
      case 'automation_bug':
        return (
          <FormattedMessage
            id="MostFailedTests.header.issueType.automation_bug"
            defaultMessage="Automation Bug"
          />
        );
      case 'system_issue':
        return (
          <FormattedMessage
            id="MostFailedTests.header.issueType.system_issue"
            defaultMessage="System Issue"
          />
        );
      case 'no_defect':
        return (
          <FormattedMessage
            id="MostFailedTests.header.issueType.no_defect"
            defaultMessage="No Defect"
          />
        );
      default:
        return null;
    }
  };

  render() {
    const { launchName, issueType } = this.props;
    const issueTypeMessage = this.getIssueTypeMessage(issueType);

    return (
      <div className={cx('info-block')}>
        <p>
          <FormattedMessage id="MostFailedTests.header.launchName" defaultMessage="Launch name" />:{' '}
          <span className={cx('info-block-launch-name')}>{launchName}</span>
        </p>
        <p>
          <FormattedMessage id="MostFailedTests.header.basedOn" defaultMessage="Based on" />:{' '}
          <span className={cx('info-block-launch-name')}>{issueTypeMessage}</span>
        </p>
      </div>
    );
  }
}

MostFailedTestsInfoBlock.propTypes = {
  launchName: string.isRequired,
  issueType: PTIssueType.isRequired,
};

export default MostFailedTestsInfoBlock;
