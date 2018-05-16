import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton/index';
import RefreshIcon from 'common/img/refresh-inline.svg';
import HistoryIcon from 'common/img/history-inline.svg';
import DeleteIcon from 'common/img/bin-icon-inline.svg';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

export const ActionPanel = ({ onRefresh }) => (
  <div className={cx('action-panel')}>
    <div className={cx('breadcrumbs')} />
    <div className={cx('action-buttons')}>
      <div className={cx('action-button')}>
        <GhostButton icon={DeleteIcon} disabled>
          Delete
        </GhostButton>
      </div>
      <div className={cx('action-button')}>
        <GhostButton icon={HistoryIcon} disabled>
          History
        </GhostButton>
      </div>
      <div className={cx('action-button')}>
        <GhostButton icon={RefreshIcon} onClick={onRefresh}>
          Refresh
        </GhostButton>
      </div>
    </div>
  </div>
);
ActionPanel.propTypes = {
  onRefresh: PropTypes.func,
};
ActionPanel.defaultProps = {
  onRefresh: () => {},
};
