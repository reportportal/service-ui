import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { SelectedItems } from 'pages/inside/common/selectedItems';
import { ActionPanel } from './actionPanel';
import styles from './launchToolbar.scss';

const cx = classNames.bind(styles);

export const LaunchToolbar = ({
  selectedLaunches,
  errors,
  onUnselect,
  onUnselectAll,
  onMove,
  onMerge,
  onCompare,
  onForceFinish,
  onProceedValidItems,
  onImportLaunch,
  debugMode,
  onRefresh,
  onDelete,
}) => (
  <div className={cx('launch-toolbar', { 'sticky-toolbar': selectedLaunches.length })}>
    {!!selectedLaunches.length && (
      <SelectedItems
        selectedItems={selectedLaunches}
        onUnselect={onUnselect}
        onClose={onUnselectAll}
        errors={errors}
      />
    )}
    <ActionPanel
      debugMode={debugMode}
      showBreadcrumb={selectedLaunches.length === 0}
      hasErrors={selectedLaunches.some((launch) => !!errors[launch.id])}
      hasValidItems={selectedLaunches.length > Object.keys(errors).length}
      onProceedValidItems={onProceedValidItems}
      onMove={onMove}
      onMerge={onMerge}
      onCompare={onCompare}
      onForceFinish={onForceFinish}
      selectedLaunches={selectedLaunches}
      onImportLaunch={onImportLaunch}
      onRefresh={onRefresh}
      onDelete={onDelete}
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
  onMove: PropTypes.func,
  onForceFinish: PropTypes.func,
  onDelete: PropTypes.func,
  onImportLaunch: PropTypes.func,
  debugMode: PropTypes.bool,
  onRefresh: PropTypes.func,
};
LaunchToolbar.defaultProps = {
  selectedLaunches: [],
  onUnselect: () => {},
  onUnselectAll: () => {},
  errors: {},
  onProceedValidItems: () => {},
  onMerge: () => {},
  onCompare: () => {},
  onMove: () => {},
  onForceFinish: () => {},
  onDelete: () => {},
  onImportLaunch: () => {},
  debugMode: false,
  onRefresh: () => {},
};
