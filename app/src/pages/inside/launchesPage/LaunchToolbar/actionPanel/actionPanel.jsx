import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import ImportIcon from './img/import-inline.svg';
import RefreshIcon from './img/refresh-inline.svg';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

export const ActionPanel = () => (
  <div className={cx('action-panel')}>
    <div className={cx('breadcrumb')} />
    <div className={cx('action-buttons')}>
      <div className={cx('action-button', 'mobile-hidden')}>
        <GhostButton icon={ImportIcon} disabled>
          <FormattedMessage id="LaunchesPage.import" defaultMessage="Import" />
        </GhostButton>
      </div>
      <div className={cx('action-button', 'mobile-hidden')}>
        <GhostButton disabled>
          <FormattedMessage id="LaunchesPage.actions" defaultMessage="Actions" />
        </GhostButton>
      </div>
      <div className={cx('action-button')}>
        <GhostButton icon={RefreshIcon} disabled>
          <FormattedMessage id="LaunchesPage.refresh" defaultMessage="Refresh" />
        </GhostButton>
      </div>
    </div>
  </div>
);
