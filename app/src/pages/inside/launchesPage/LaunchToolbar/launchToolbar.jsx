import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ActionPanel } from './actionPanel';
import { SelectedLaunches } from './selectedLaunches';
import styles from './launchToolbar.scss';

const cx = classNames.bind(styles);

export const LaunchToolbar = ({ selectedLaunches, onUnselect, onUnselectAll }) => (
  <div className={cx('launch-toolbar')}>
    {
      !!selectedLaunches.length && <SelectedLaunches
        selectedLaunches={selectedLaunches}
        onUnselect={onUnselect}
        onClose={onUnselectAll}
      />
    }
    <ActionPanel />
  </div>
);
LaunchToolbar.propTypes = {
  selectedLaunches: PropTypes.arrayOf(PropTypes.object),
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
};
LaunchToolbar.defaultProps = {
  selectedLaunches: [],
  onUnselect: () => {
  },
  onUnselectAll: () => {
  },
};
