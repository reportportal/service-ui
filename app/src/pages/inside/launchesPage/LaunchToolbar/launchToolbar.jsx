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
  onEditItem,
  onEditItems,
  onMerge,
  onCompare,
  onForceFinish,
  onProceedValidItems,
  onImportLaunch,
  debugMode,
  onRefresh,
  onDelete,
  onAddNewWidget,
  activeFilterId,
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
      onEditItem={onEditItem}
      onEditItems={onEditItems}
      onMerge={onMerge}
      onCompare={onCompare}
      onForceFinish={onForceFinish}
      selectedLaunches={selectedLaunches}
      onImportLaunch={onImportLaunch}
      onRefresh={onRefresh}
      onDelete={onDelete}
      activeFilterId={activeFilterId}
      onAddNewWidget={onAddNewWidget}
    />
  </div>
);
LaunchToolbar.propTypes = {
  selectedLaunches: PropTypes.arrayOf(PropTypes.object),
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
  errors: PropTypes.object,
  onProceedValidItems: PropTypes.func,
  onEditItem: PropTypes.func,
  onEditItems: PropTypes.func,
  onMerge: PropTypes.func,
  onCompare: PropTypes.func,
  onMove: PropTypes.func,
  onForceFinish: PropTypes.func,
  onDelete: PropTypes.func,
  onImportLaunch: PropTypes.func,
  debugMode: PropTypes.bool,
  onRefresh: PropTypes.func,
  activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAddNewWidget: PropTypes.func,
};
LaunchToolbar.defaultProps = {
  selectedLaunches: [],
  onUnselect: () => {},
  onUnselectAll: () => {},
  errors: {},
  onProceedValidItems: () => {},
  onEditItem: () => {},
  onEditItems: () => {},
  onMerge: () => {},
  onCompare: () => {},
  onMove: () => {},
  onForceFinish: () => {},
  onDelete: () => {},
  onImportLaunch: () => {},
  debugMode: false,
  onRefresh: () => {},
  activeFilterId: null,
  onAddNewWidget: () => {},
};
