import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ActionPanel } from './actionPanel';
import { SelectedLaunches } from './selectedLaunches';
import styles from './launchToolbar.scss';

const cx = classNames.bind(styles);

export const LaunchToolbar = ({
  selectedLaunches,
  errors,
  onUnselect,
  onUnselectAll,
  onMerge,
  onCompare,
  onProceedValidItems,
}) => (
  <div className={cx('launch-toolbar')}>
    {!!selectedLaunches.length && (
      <SelectedLaunches
        selectedLaunches={selectedLaunches}
        onUnselect={onUnselect}
        onClose={onUnselectAll}
        errors={errors}
      />
    )}
    <ActionPanel
      showBreadcrumb={selectedLaunches.length === 0}
      hasErrors={selectedLaunches.some((launch) => !!errors[launch.id])}
      hasValidItems={selectedLaunches.length > Object.keys(errors).length}
      onProceedValidItems={onProceedValidItems}
      onMerge={onMerge}
      onCompare={onCompare}
      selectedLaunches={selectedLaunches}
    />
  </div>
);
LaunchToolbar.propTypes = {
  selectedLaunches: PropTypes.arrayOf(PropTypes.object),
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
  errors: PropTypes.object,
  onProceedValidItems: PropTypes.func,
  onMerge: PropTypes.func,
  onCompare: PropTypes.func,
  onMoveToDebug: PropTypes.func,
  onForceFinish: PropTypes.func,
  onDelete: PropTypes.func,
};
LaunchToolbar.defaultProps = {
  selectedLaunches: [],
  onUnselect: () => {},
  onUnselectAll: () => {},
  errors: {},
  onProceedValidItems: () => {},
  onMerge: () => {},
  onCompare: () => {},
  onMoveToDebug: () => {},
  onForceFinish: () => {},
  onDelete: () => {},
};
