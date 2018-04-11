import * as React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './testsTableWidget.scss';

const cx = classNames.bind(styles);

class LaunchInfoBlock extends React.PureComponent {
  render() {
    const { launchName, issueType } = this.props;

    return (
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
  }
}

LaunchInfoBlock.propTypes = {
  launchName: string.isRequired,
  issueType: string,
};

LaunchInfoBlock.defaultProps = {
  issueType: null,
};

export default LaunchInfoBlock;
