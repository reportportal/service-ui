import { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InfoLine } from 'pages/inside/common/infoLine';
import { SelectedItems } from 'pages/inside/common/selectedItems';
import { ActionPanel } from './actionPanel';
import { RefineFiltersPanel } from './refineFiltersPanel';
import styles from './suiteTestToolbar.scss';

const cx = classNames.bind(styles);

export const SuiteTestToolbar = ({
  parentItem,
  selectedItems,
  errors,
  onUnselect,
  onUnselectAll,
  onRefresh,
  onProceedValidItems,
  onIgnoreInAA,
  onIncludeInAA,
  onUnlinkIssue,
  onLinkIssue,
  onEditDefects,
  debugMode,
  onDelete,
  events,
  onFilterAdd,
  onFilterRemove,
  onFilterValidate,
  onFilterChange,
  filterErrors,
  filterEntities,
}) => (
  <Fragment>
    <div className={cx({ 'sticky-toolbar': selectedItems.length })}>
      {!!selectedItems.length && (
        <SelectedItems
          selectedItems={selectedItems}
          errors={errors}
          onUnselect={onUnselect}
          onClose={onUnselectAll}
        />
      )}
      <ActionPanel
        debugMode={debugMode}
        hasErrors={selectedItems.some((item) => !!errors[item.id])}
        hasValidItems={selectedItems.length > Object.keys(errors).length}
        onProceedValidItems={onProceedValidItems}
        showBreadcrumbs={selectedItems.length === 0}
        onRefresh={onRefresh}
        selectedItems={selectedItems}
        onIgnoreInAA={onIgnoreInAA}
        onIncludeInAA={onIncludeInAA}
        onUnlinkIssue={onUnlinkIssue}
        onLinkIssue={onLinkIssue}
        onEditDefects={onEditDefects}
        onDelete={onDelete}
        deleteDisabled={!selectedItems.length}
      />
    </div>
    {parentItem && <InfoLine data={parentItem} events={events} />}
    <RefineFiltersPanel
      onFilterAdd={onFilterAdd}
      onFilterRemove={onFilterRemove}
      onFilterValidate={onFilterValidate}
      onFilterChange={onFilterChange}
      filterErrors={filterErrors}
      filterEntities={filterEntities}
    />
  </Fragment>
);
SuiteTestToolbar.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  errors: PropTypes.object,
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
  parentItem: PropTypes.object,
  onRefresh: PropTypes.func,
  onProceedValidItems: PropTypes.func,
  onIgnoreInAA: PropTypes.func,
  onIncludeInAA: PropTypes.func,
  onUnlinkIssue: PropTypes.func,
  onLinkIssue: PropTypes.func,
  onEditDefects: PropTypes.func,
  debugMode: PropTypes.bool,
  onDelete: PropTypes.func,
  events: PropTypes.object,
  onFilterAdd: PropTypes.func,
  onFilterRemove: PropTypes.func,
  onFilterValidate: PropTypes.func,
  onFilterChange: PropTypes.func,
  filterErrors: PropTypes.object,
  filterEntities: PropTypes.array,
};
SuiteTestToolbar.defaultProps = {
  selectedItems: [],
  errors: {},
  onUnselect: () => {},
  onUnselectAll: () => {},
  parentItem: null,
  onRefresh: () => {},
  onProceedValidItems: () => {},
  onIgnoreInAA: () => {},
  onIncludeInAA: () => {},
  onUnlinkIssue: () => {},
  onLinkIssue: () => {},
  onEditDefects: () => {},
  onDelete: () => {},
  debugMode: false,
  updateFilters: () => {},
  onFilterAdd: () => {},
  onFilterRemove: () => {},
  onFilterValidate: () => {},
  onFilterChange: () => {},
  filterErrors: {},
  filterEntities: [],
  events: {},
};
