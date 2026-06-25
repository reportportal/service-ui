/*
 * Copyright 2019 EPAM Systems
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import Link from 'redux-first-router-link';
import { actionToPath, history, selectLocationState } from 'redux-first-router';
import qs from 'qs';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import track from 'react-tracking';
import {
  testCaseNameLinkSelector,
  TEST_ITEMS_TYPE_LIST,
  STABILITY_WIDGET_ITEM_LIST_LAUNCH_LIMIT,
} from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { activeDashboardIdSelector } from 'controllers/pages';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import AnotherPageIcon from 'common/img/go-to-another-page-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';
import {
  getNewActiveAttributes,
  getNewActiveBreadcrumbs,
} from 'components/widgets/multiLevelWidgets/common/utils';
import { WIDGETS_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import styles from './testStabilityFlaky.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  groupsTitle: {
    id: 'TestStabilityFlaky.groupsTitle',
    defaultMessage: 'Stability by {key}',
  },
  launchCountCol: {
    id: 'TestStabilityFlaky.col.launches',
    defaultMessage: 'Launches',
  },
  launchNameCol: {
    id: 'TestStabilityFlaky.col.launchName',
    defaultMessage: 'Launch',
  },
  colTotalTests: {
    id: 'TestStabilityFlaky.col.totalTests',
    defaultMessage: 'Total tests',
  },
  colTotalTestsTooltip: {
    id: 'TestStabilityFlaky.col.totalTestsTooltip',
    defaultMessage:
      'With “merge by test name” off, each run of a case in each launch counts separately (aligned with summing launch TOTALs). With merge on, same-named cases collapse into one row.',
  },
  leafSummary: {
    id: 'TestStabilityFlaky.leafSummary',
    defaultMessage: '{count, plural, one {# test in this view} other {# tests in this view}}',
  },
  filterStability: {
    id: 'TestStabilityFlaky.filterStability',
    defaultMessage: 'Stability',
  },
  filterAll: {
    id: 'TestStabilityFlaky.filterAll',
    defaultMessage: 'All',
  },
});

function trimmedLabel(attr) {
  return attr && attr.value != null ? attr.value : '';
}

@injectIntl
@track()
@connect((state) => ({
  project: activeProjectSelector(state),
  dashboardId: activeDashboardIdSelector(state),
  getTestCaseNameLink: testCaseNameLinkSelector(state),
  routesMap: selectLocationState(state).routesMap || {},
}))
export class TestStabilityFlaky extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    fetchWidget: PropTypes.func,
    clearQueryParams: PropTypes.func,
    getTestCaseNameLink: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired,
    dashboardId: PropTypes.number,
    routesMap: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
    }),
  };

  static defaultProps = {
    clearQueryParams: () => {},
    fetchWidget: () => {},
    dashboardId: undefined,
    tracking: { trackEvent: () => {} },
  };

  state = {
    activeBreadcrumbs: null,
    activeBreadcrumbId: 0,
    activeAttributes: [],
    isLoading: false,
    groupSortKey: 'groupLabel',
    groupSortAsc: true,
    leafSortKey: 'name',
    leafSortAsc: true,
    stabilityFilter: 'ALL',
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget.contentParameters, this.props.widget.contentParameters)) {
      this.clearState();
    }
  }

  onSortGroup = (key) => () => {
    this.setState((s) =>
      s.groupSortKey === key
        ? { groupSortAsc: !s.groupSortAsc }
        : { groupSortKey: key, groupSortAsc: true },
    );
  };

  onSortLeaf = (key) => () => {
    this.setState((s) =>
      s.leafSortKey === key ? { leafSortAsc: !s.leafSortAsc } : { leafSortKey: key, leafSortAsc: true },
    );
  };

  getDefaultLinkParams = () => ({
    payload: {
      projectId: this.props.project,
      filterId: this.props.widget.appliedFilters?.[0]?.id,
      testItemIds: TEST_ITEMS_TYPE_LIST,
    },
    type: TEST_ITEM_PAGE,
  });

  /** Align with stability SQL launch scope so filter-based item list is not narrower than the widget. */
  widgetLaunchesLimit = () => STABILITY_WIDGET_ITEM_LIST_LAUNCH_LIMIT;

  /**
   * Drill one grouping level. Band-count cells pass stabilityFilterOverride so the leaf table
   * matches widget classification; raw launch list status filters are not equivalent.
   */
  navigateIntoGroup = (groupLabel, { stabilityFilterOverride } = {}) => {
    const { activeBreadcrumbId, activeBreadcrumbs, activeAttributes } = this.state;
    const attributes = this.props.widget.contentParameters?.widgetOptions?.attributeKeys || [];
    const newActiveBreadcrumbId = activeBreadcrumbId + 1;
    const additionalProperties = {
      value: groupLabel,
      passingRate: 0,
      color: 'transparent',
    };
    const newActiveBreadcrumbs = getNewActiveBreadcrumbs(
      newActiveBreadcrumbId,
      activeBreadcrumbs,
      activeBreadcrumbId,
      attributes,
      additionalProperties,
    );
    const breadcrumbForKey =
      newActiveBreadcrumbs && newActiveBreadcrumbs[activeBreadcrumbId]
        ? newActiveBreadcrumbs[activeBreadcrumbId].key
        : attributes[activeBreadcrumbId];
    const newActiveAttributes = getNewActiveAttributes(
      breadcrumbForKey,
      groupLabel,
      activeAttributes,
    );

    const nextStability =
      stabilityFilterOverride !== undefined ? stabilityFilterOverride : 'ALL';

    this.setState(
      {
        activeBreadcrumbs: newActiveBreadcrumbs,
        activeBreadcrumbId: newActiveBreadcrumbId,
        activeAttributes: newActiveAttributes,
        stabilityFilter: nextStability,
        isLoading: true,
      },
      () =>
        this.props
          .fetchWidget({
            attributes: newActiveAttributes.map((item) => item.value),
          })
          .then(() => this.setState({ isLoading: false }))
          .catch(() => this.setState({ isLoading: false })),
    );
  };

  onClickGroupItem = (groupLabel) => {
    this.navigateIntoGroup(groupLabel, { stabilityFilterOverride: 'ALL' });
  };

  onClickGroupBandCount = (e, groupLabel, band) => {
    e.preventDefault();
    e.stopPropagation();
    this.navigateIntoGroup(groupLabel, { stabilityFilterOverride: band });
  };

  jumpToDepth = (depth) => {
    const { activeAttributes } = this.state;
    const trimmed = activeAttributes.slice(0, depth);
    this.setState(
      {
        activeAttributes: trimmed,
        activeBreadcrumbId: depth,
        activeBreadcrumbs: null,
        isLoading: true,
        stabilityFilter: 'ALL',
      },
      () =>
        this.props
          .fetchWidget({
            attributes: trimmed.map((x) => x.value),
          })
          .then(() => this.setState({ isLoading: false })),
    );
  };

  /** All + one slot per configured attributeKey; depth 0 = root, depth N = leaf. */
  stabilityCrumbSlots = (attributeKeys) => [
    { type: 'all' },
    ...attributeKeys.map((key, idx) => ({ type: 'attr', key, idx })),
  ];

  renderStabilityCrumbs = (attributeKeys, activeBreadcrumbId, activeAttributes, launchBreakdown, breakdownTestName) => {
    const { intl } = this.props;
    const slots = this.stabilityCrumbSlots(attributeKeys);
    const visible = slots.slice(0, Math.min(activeBreadcrumbId + 1, slots.length));

    return (
      <ul className={cx('crumbs')}>
        {visible.map((slot, i) => {
          const isCurrent = i === visible.length - 1 && !launchBreakdown;
          const label =
            slot.type === 'all'
              ? intl.formatMessage({
                  id: 'TestStabilityFlaky.root',
                  defaultMessage: 'All',
                })
              : `${slot.key}: ${trimmedLabel(activeAttributes[slot.idx]) || '—'}`;
          return (
            <li key={slot.type === 'all' ? 'all' : slot.key} className={cx('crumb-item')}>
              {isCurrent ? (
                <span className={cx('crumb-static')} title={label}>
                  {label}
                </span>
              ) : (
                <button
                  type="button"
                  className={cx('crumb-btn')}
                  onClick={() => this.jumpToDepth(i)}
                >
                  {label}
                </button>
              )}
              {i < visible.length - 1 && <span className={cx('crumb-sep')}>/</span>}
            </li>
          );
        })}
        {launchBreakdown && (
          <li className={cx('crumb-item')}>
            <span className={cx('crumb-sep')}>/</span>
            <span className={cx('crumb-static')} title={breakdownTestName}>
              {breakdownTestName}
            </span>
          </li>
        )}
      </ul>
    );
  };

  clearState = () => {
    this.setState({
      activeBreadcrumbs: null,
      activeBreadcrumbId: 0,
      activeAttributes: [],
      stabilityFilter: 'ALL',
    });
    this.props.clearQueryParams();
  };

  sortedGroups = (groups) => {
    const { groupSortKey, groupSortAsc } = this.state;
    const arr = [...groups];
    const mul = groupSortAsc ? 1 : -1;
    arr.sort((a, b) => {
      const av = a[groupSortKey];
      const bv = b[groupSortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return av === bv ? 0 : av < bv ? -1 * mul : 1 * mul;
      }
      const as = String(av ?? '');
      const bs = String(bv ?? '');
      return as.localeCompare(bs, undefined, { sensitivity: 'base' }) * mul;
    });
    return arr;
  };

  getFilteredTests = (tests) => {
    const { stabilityFilter } = this.state;
    if (!tests || stabilityFilter === 'ALL') {
      return tests || [];
    }
    return tests.filter((t) => t.stability === stabilityFilter);
  };

  sortedLeaves = (tests) => {
    const { leafSortKey, leafSortAsc } = this.state;
    const arr = [...tests];
    const mul = leafSortAsc ? 1 : -1;
    const pick = (t) => {
      if (leafSortKey === 'launchName') {
        return this.launchLabel(t);
      }
      if (leafSortKey === 'launchCount') {
        return Number(t.launchCount) || 0;
      }
      if (leafSortKey === 'transitions') {
        return Number(t.transitions) || 0;
      }
      if (leafSortKey === 'flakinessPercent') {
        return Number(t.flakinessPercent) || 0;
      }
      if (leafSortKey === 'stability') {
        return t.stability || '';
      }
      return t.name || '';
    };
    arr.sort((a, b) => {
      const av = pick(a);
      const bv = pick(b);
      if (typeof av === 'number' && typeof bv === 'number') {
        return av === bv ? 0 : av < bv ? -1 * mul : 1 * mul;
      }
      return String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' }) * mul;
    });
    return arr;
  };

  badgeClass = (band) => {
    const b = (band || '').toLowerCase();
    return cx('badge', `badge-${b}`);
  };

  /** Backend classification key (launch×case when merge-by-name is off); falls back to RP uniqueId. */
  stabilityDrillKey = (row) =>
    row.classificationKey != null && row.classificationKey !== ''
      ? row.classificationKey
      : row.uniqueId;

  leafItemLink(row) {
    const filterId = this.props.widget.appliedFilters?.[0]?.id;
    const rpId = row.uniqueId;
    const link = this.props.getTestCaseNameLink({
      uniqueId: rpId,
      testCaseName: row.name,
      linkByTestName: typeof rpId === 'string' && rpId.startsWith('tn:'),
      testItemIds: TEST_ITEMS_TYPE_LIST,
      ...(row.launchId != null ? { launchId: row.launchId } : {}),
      filterId,
      launchesLimit: this.widgetLaunchesLimit(),
    });
    return Object.assign(link, this.getDefaultLinkParams());
  }

  openLeafRow = (row) => {
    const { routesMap, tracking, dashboardId } = this.props;
    const { trackEvent } = tracking;
    const link = this.leafItemLink(row);
    trackEvent(WIDGETS_EVENTS.clickOnMostFailedTestCaseName(dashboardId));
    const path = actionToPath(link, routesMap, qs);
    window.open(history().createHref({ pathname: path }), '_blank', 'noopener,noreferrer');
  };

  drillIntoLaunchBreakdown = (row) => {
    const vals = this.state.activeAttributes.map((a) => a.value);
    this.setState({ isLoading: true }, () =>
      this.props
        .fetchWidget({ attributes: [...vals, this.stabilityDrillKey(row)] })
        .then(() => this.setState({ isLoading: false }))
        .catch(() => this.setState({ isLoading: false })),
    );
  };

  /** In-widget breakdown when multiple logical launches or multiple executions in the timeline. */
  stabilityRowNeedsLaunchBreakdown = (row) => {
    const lc = row.launchCount != null ? row.launchCount : 1;
    const exec = row.executionCount != null ? row.executionCount : 0;
    return lc > 1 || exec > 1;
  };

  handleTestRowActivate = (row) => {
    if (this.stabilityRowNeedsLaunchBreakdown(row)) {
      this.drillIntoLaunchBreakdown(row);
    } else {
      this.openLeafRow(row);
    }
  };

  perLaunchItemLink = (pl) => {
    const filterId = this.props.widget.appliedFilters?.[0]?.id;
    const link = this.props.getTestCaseNameLink({
      uniqueId: pl.uniqueId,
      testCaseName: pl.name,
      linkByTestName: typeof pl.uniqueId === 'string' && pl.uniqueId.startsWith('tn:'),
      testItemIds: TEST_ITEMS_TYPE_LIST,
      launchId: pl.launchId,
      filterId,
      launchesLimit: this.widgetLaunchesLimit(),
    });
    return Object.assign(link, this.getDefaultLinkParams());
  };

  openPerLaunchRow = (pl) => {
    const { routesMap, tracking, dashboardId } = this.props;
    const { trackEvent } = tracking;
    const link = this.perLaunchItemLink(pl);
    trackEvent(WIDGETS_EVENTS.clickOnMostFailedTestCaseName(dashboardId));
    const path = actionToPath(link, routesMap, qs);
    window.open(history().createHref({ pathname: path }), '_blank', 'noopener,noreferrer');
  };

  render() {
    const { intl, widget } = this.props;
    const { activeBreadcrumbId, activeAttributes, isLoading, stabilityFilter } = this.state;
    const result = widget?.content?.result;
    const attributeKeys = widget.contentParameters?.widgetOptions?.attributeKeys || [];
    const groupKey = result?.groupKey;
    const groups = result?.groups || [];
    const isLeaf = result?.leaf === true;
    const tests = result?.testStabilityFlakiness || [];
    const launchBreakdown = result?.launchBreakdown === true;
    const perLaunchRows = result?.testStabilityPerLaunch || [];
    const breakdownTestName = result?.breakdownTestName || '';

    if (!result && !widget?.content?.testStabilityFlakiness?.length) {
      return <NoDataAvailable />;
    }

    if (!result && widget?.content?.testStabilityFlakiness?.length) {
      return (
        <div className={cx('stability-table-widget')}>
          <ScrollWrapper>{this.renderLeafTable(widget.content.testStabilityFlakiness)}</ScrollWrapper>
        </div>
      );
    }

    if (!isLeaf && (!groups || groups.length === 0) && !isLoading) {
      return <NoDataAvailable />;
    }

    if (launchBreakdown && (!perLaunchRows || perLaunchRows.length === 0) && !isLoading) {
      return <NoDataAvailable />;
    }

    return (
      <div className={cx('stability-table-widget')}>
        <ScrollWrapper>
          <div className={cx('legend-wrap')}>
            {this.renderStabilityCrumbs(
              attributeKeys,
              activeBreadcrumbId,
              activeAttributes,
              launchBreakdown,
              breakdownTestName,
            )}
          </div>

          {isLoading ? (
            <div className={cx('loading')}>
              <SpinningPreloader />
            </div>
          ) : launchBreakdown ? (
            this.renderLaunchBreakdownTable(perLaunchRows)
          ) : !isLeaf ? (
            <Fragment>
              <h4 className={cx('section-title')}>
                {intl.formatMessage(messages.groupsTitle, { key: groupKey || '' })}
              </h4>
              <table className={cx('table')}>
                <thead>
                  <tr>
                    <th className={cx('sortable')} onClick={this.onSortGroup('groupLabel')}>
                      {groupKey || (
                        <FormattedMessage id="TestStabilityFlaky.col.group" defaultMessage="Group" />
                      )}
                    </th>
                    <th className={cx('sortable')} onClick={this.onSortGroup('avgFlakinessPercent')}>
                      <FormattedMessage
                        id="TestStabilityFlaky.col.avgFlak"
                        defaultMessage="Ø Flakiness %"
                      />
                    </th>
                    <th className={cx('sortable')} onClick={this.onSortGroup('avgTransitions')}>
                      <FormattedMessage
                        id="TestStabilityFlaky.col.avgTrans"
                        defaultMessage="Ø Transitions"
                      />
                    </th>
                    <th className={cx('sortable')} onClick={this.onSortGroup('transitional')}>
                      <FormattedMessage
                        id="TestStabilityFlaky.col.trans"
                        defaultMessage="Transitional"
                      />
                    </th>
                    <th className={cx('sortable')} onClick={this.onSortGroup('stable')}>
                      <FormattedMessage id="TestStabilityFlaky.col.stable" defaultMessage="Stable" />
                    </th>
                    <th className={cx('sortable')} onClick={this.onSortGroup('flaky')}>
                      <FormattedMessage id="TestStabilityFlaky.col.flaky" defaultMessage="Flaky" />
                    </th>
                    <th className={cx('sortable')} onClick={this.onSortGroup('failed')}>
                      <FormattedMessage id="TestStabilityFlaky.col.failed" defaultMessage="Failed" />
                    </th>
                    <th title={intl.formatMessage(messages.colTotalTestsTooltip)}>
                      <FormattedMessage {...messages.colTotalTests} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.sortedGroups(groups).map((g) => (
                    <tr
                      key={g.groupLabel}
                      className={cx('row')}
                      onClick={() => this.onClickGroupItem(g.groupLabel)}
                      onKeyDown={(e) => e.key === 'Enter' && this.onClickGroupItem(g.groupLabel)}
                      role="button"
                      tabIndex={0}
                    >
                      <td className={cx('name-cell')}>{g.groupLabel}</td>
                      <td>{g.avgFlakinessPercent}</td>
                      <td>{g.avgTransitions}</td>
                      <td>
                        <button
                          type="button"
                          className={cx('cell-link')}
                          onClick={(e) => this.onClickGroupBandCount(e, g.groupLabel, 'TRANSITIONAL')}
                        >
                          {g.transitional}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={cx('cell-link')}
                          onClick={(e) => this.onClickGroupBandCount(e, g.groupLabel, 'STABLE')}
                        >
                          {g.stable}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={cx('cell-link')}
                          onClick={(e) => this.onClickGroupBandCount(e, g.groupLabel, 'FLAKY')}
                        >
                          {g.flaky}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={cx('cell-link')}
                          onClick={(e) => this.onClickGroupBandCount(e, g.groupLabel, 'FAILED')}
                        >
                          {g.failed}
                        </button>
                      </td>
                      <td>
                        {g.totalTests != null
                          ? g.totalTests
                          : (g.transitional || 0) +
                            (g.stable || 0) +
                            (g.flaky || 0) +
                            (g.failed || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Fragment>
          ) : tests.length === 0 ? (
            <NoDataAvailable />
          ) : (
            <Fragment>
              <p className={cx('leaf-summary')}>
                <FormattedMessage
                  {...messages.leafSummary}
                  values={{ count: this.getFilteredTests(tests).length }}
                />
              </p>
              <div className={cx('stability-filter')}>
                <label htmlFor="rp-stability-filter" className={cx('stability-filter-label')}>
                  <FormattedMessage {...messages.filterStability} />
                </label>
                <select
                  id="rp-stability-filter"
                  className={cx('stability-select')}
                  value={stabilityFilter}
                  onChange={(e) => this.setState({ stabilityFilter: e.target.value })}
                >
                  <option value="ALL">{intl.formatMessage(messages.filterAll)}</option>
                  <option value="STABLE">STABLE</option>
                  <option value="TRANSITIONAL">TRANSITIONAL</option>
                  <option value="FLAKY">FLAKY</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
              {this.getFilteredTests(tests).length === 0 ? (
                <div className={cx('filter-empty')}>
                  <FormattedMessage
                    id="TestStabilityFlaky.filterEmpty"
                    defaultMessage="No tests match the selected stability filter."
                  />
                </div>
              ) : (
                this.renderLeafTable(this.sortedLeaves(this.getFilteredTests(tests)))
              )}
            </Fragment>
          )}
        </ScrollWrapper>
      </div>
    );
  }

  renderLaunchBreakdownTable(rows) {
    return (
      <table className={cx('table')}>
        <thead>
          <tr>
            <th>
              <FormattedMessage id="TestStabilityFlaky.table.launch" defaultMessage="Launch" />
            </th>
            <th>
              <FormattedMessage
                id="TestStabilityFlaky.table.transitions"
                defaultMessage="Transitions"
              />
            </th>
            <th>
              <FormattedMessage
                id="TestStabilityFlaky.table.flakinessPercent"
                defaultMessage="Flakiness %"
              />
            </th>
            <th>
              <FormattedMessage id="TestStabilityFlaky.table.stability" defaultMessage="Stability" />
            </th>
            <th className={cx('ext-col')} aria-hidden />
          </tr>
        </thead>
        <tbody>
          {rows.map((pl) => (
            <tr
              key={`${pl.launchId}-${pl.itemId}`}
              className={cx('row')}
              onClick={() => this.openPerLaunchRow(pl)}
              onKeyDown={(e) => e.key === 'Enter' && this.openPerLaunchRow(pl)}
              role="button"
              tabIndex={0}
            >
              <td className={cx('name-cell')}>{pl.launchName || `Launch ${pl.launchId}`}</td>
              <td>{pl.transitions}</td>
              <td>{pl.flakinessPercent}</td>
              <td>
                <span className={this.badgeClass(pl.stability)}>{pl.stability}</span>
              </td>
              <td>
                <Link
                  className={cx('icon-link')}
                  to={this.perLaunchItemLink(pl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {Parser(AnotherPageIcon)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  /** Pipeline label for leaf rows (name + optional #number). */
  launchLabel = (row) => {
    const name = row.launchName && String(row.launchName).trim();
    if (!name) {
      return row.launchId != null ? `Launch ${row.launchId}` : '—';
    }
    return row.launchNumber != null ? `${name} #${row.launchNumber}` : name;
  };

  renderLeafTable(tests) {
    return (
      <table className={cx('table')}>
        <thead>
          <tr>
            <th className={cx('sortable')} onClick={this.onSortLeaf('name')}>
              <FormattedMessage id="TestStabilityFlaky.table.testCase" defaultMessage="Test case" />
            </th>
            <th className={cx('sortable')} onClick={this.onSortLeaf('launchName')}>
              <FormattedMessage {...messages.launchNameCol} />
            </th>
            <th className={cx('sortable')} onClick={this.onSortLeaf('launchCount')}>
              <FormattedMessage {...messages.launchCountCol} />
            </th>
            <th className={cx('sortable')} onClick={this.onSortLeaf('transitions')}>
              <FormattedMessage
                id="TestStabilityFlaky.table.transitions"
                defaultMessage="Transitions"
              />
            </th>
            <th className={cx('sortable')} onClick={this.onSortLeaf('flakinessPercent')}>
              <FormattedMessage
                id="TestStabilityFlaky.table.flakinessPercent"
                defaultMessage="Flakiness %"
              />
            </th>
            <th className={cx('sortable')} onClick={this.onSortLeaf('stability')}>
              <FormattedMessage id="TestStabilityFlaky.table.stability" defaultMessage="Stability" />
            </th>
            <th className={cx('ext-col')} aria-hidden />
          </tr>
        </thead>
        <tbody>
          {tests.map((row) => (
            <tr
              key={`${this.stabilityDrillKey(row)}-${row.itemId}`}
              className={cx('row', {
                'row-drillable': this.stabilityRowNeedsLaunchBreakdown(row),
              })}
              onClick={() => this.handleTestRowActivate(row)}
              onKeyDown={(e) => e.key === 'Enter' && this.handleTestRowActivate(row)}
              role="button"
              tabIndex={0}
            >
              <td className={cx('name-cell')}>
                <span className={cx('name')}>{row.name}</span>
                {row.uniqueId &&
                  !String(row.uniqueId).startsWith('tn:') &&
                  <span className={cx('uid')}>{row.uniqueId}</span>}
              </td>
              <td className={cx('name-cell')} title={this.launchLabel(row)}>
                {this.launchLabel(row)}
              </td>
              <td>{row.launchCount != null ? row.launchCount : 1}</td>
              <td>{row.transitions}</td>
              <td>{row.flakinessPercent}</td>
              <td>
                <span className={this.badgeClass(row.stability)}>{row.stability}</span>
              </td>
              <td>
                <Link
                  className={cx('icon-link')}
                  to={this.leafItemLink(row)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {Parser(AnotherPageIcon)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
