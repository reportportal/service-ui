/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { useScrollContainer } from 'components/main/scrollWrapper';
import { DEFAULT_LOGS_SIZE } from 'common/constants/logsSettings';
import { PREVIOUS } from 'controllers/log';
import {
  nestedStepsSelector,
  requestNestedStepAction,
  loadMoreNestedStepAction,
  fetchCurrentStepAction,
} from 'controllers/log/nestedSteps';
import { INITIAL_STATE } from 'controllers/log/nestedSteps/constants';
import { buildLogRows, findLogRowIndex, ROW_KIND } from './buildLogRows';
import { LogRow } from './logRows';
import { useLogsVirtualizer } from './useLogsVirtualizer';
import { getPadding } from './utils';
import styles from './logRows.scss';

const cx = classNames.bind(styles);

const isStep = (item) => 'hasContent' in item;

// Keeps the place of the user when "load previous" adds rows above: the first log row the step had
// before the load is brought back to the centre of the view once the step is loaded.
const useLoadPreviousAnchor = (nestedSteps, scrollToLog) => {
  const pendingRef = useRef(null);
  const [anchorId, setAnchorId] = useState(null);

  const setAnchor = useCallback((stepId, content) => {
    const logId = content.find((item) => !isStep(item))?.id;
    pendingRef.current = logId === undefined ? null : { stepId, logId, sawLoading: false };
    setAnchorId(logId ?? null);
  }, []);

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) {
      return;
    }
    if ((nestedSteps[pending.stepId] || INITIAL_STATE).loading) {
      pending.sawLoading = true;
      return;
    }
    if (pending.sawLoading) {
      pendingRef.current = null;
      scrollToLog(pending.logId);
      setAnchorId(null);
    }
  }, [nestedSteps, scrollToLog]);

  return { anchorId, setAnchor };
};

const LogsGridBodyComponent = ({
  tracking,
  data,
  nestedStepHeader,
  nestedView,
  grouped,
  groupHeader,
  groupFunction,
  gridRowClassName,
  logsSize,
  layoutKey,
  ...rowProps
}) => {
  const dispatch = useDispatch();
  const nestedSteps = useSelector(nestedStepsSelector);
  const rows = useMemo(() => buildLogRows(data, nestedSteps), [data, nestedSteps]);
  const { eventsInfo = {}, expanded, rowHighlightingConfig = {} } = rowProps;
  const { virtualizer, bodyStartRef, virtual } = useLogsVirtualizer({
    rows,
    layoutKey,
    logsSize,
    scrollContainer: useScrollContainer(),
  });

  // the expanded state of long messages, restored when a row is mounted again; it starts over
  // when the "no logs collapsing" setting changes, as the rows do
  const expandedRows = useMemo(() => new Map(), [expanded]);
  const onExpandedChange = useCallback(
    (rowId, rowExpanded) => expandedRows.set(rowId, rowExpanded),
    [expandedRows],
  );

  const itemIntoViewRef = useRef(null);
  const scrollToLog = useCallback(
    (logId) => {
      if (virtual) {
        // the row can be far from the rendered ones: the virtualiser scrolls to it
        const index = findLogRowIndex(rows, logId);
        index >= 0 && virtualizer.scrollToIndex(index, { align: 'center' });
      } else {
        itemIntoViewRef.current?.scrollIntoView({ block: 'center' });
      }
      itemIntoViewRef.current = null;
    },
    [virtual, rows, virtualizer],
  );
  const { anchorId, setAnchor } = useLoadPreviousAnchor(nestedSteps, scrollToLog);

  // jump to error / jump to log: the highlighted row is scrolled to once per highlight, the row
  // itself only runs the highlight when it is mounted or updated (its own scrolling is off)
  const { highlightedRowId, isGridRowHighlighted } = rowHighlightingConfig;
  const highlightTarget = virtual && isGridRowHighlighted ? highlightedRowId : null;
  const scrolledHighlightRef = useRef(null);
  useEffect(() => {
    if (highlightTarget === null || highlightTarget === undefined) {
      scrolledHighlightRef.current = null;
      return;
    }
    const index = findLogRowIndex(rows, highlightTarget);
    if (scrolledHighlightRef.current !== highlightTarget && index >= 0) {
      scrolledHighlightRef.current = highlightTarget;
      virtualizer.scrollToIndex(index, { align: 'center' });
    }
  }, [highlightTarget, rows, virtualizer]);

  const onToggleStep = useCallback((id) => dispatch(requestNestedStepAction({ id })), [dispatch]);
  const onLoadMore = useCallback(
    (id, loadDirection) => {
      tracking.trackEvent(eventsInfo.getClickOnLoadMore(loadDirection));
      if (loadDirection === PREVIOUS) {
        setAnchor(id, (nestedSteps[id] || INITIAL_STATE).content);
      }
      dispatch(loadMoreNestedStepAction({ id, loadDirection }));
    },
    [dispatch, tracking, eventsInfo, setAnchor, nestedSteps],
  );
  const onLoadCurrentStep = useCallback(
    (id) => {
      tracking.trackEvent(eventsInfo.clickOnLoadCurrentStep);
      dispatch(fetchCurrentStepAction({ id }));
    },
    [dispatch, tracking, eventsInfo],
  );

  const renderRow = (row, index) => {
    const logRowProps =
      row.kind === ROW_KIND.LOG
        ? {
            initialExpanded: expandedRows.get(row.item.id),
            onExpandedChange,
            ...(row.item.id === anchorId && { itemIntoViewId: anchorId, itemIntoViewRef }),
            ...(virtual && { highlightOnMount: true, scrollOnHighlight: false }),
          }
        : {};

    return (
      <LogRow
        key={row.key}
        row={row}
        rowProps={rowProps}
        stepHeader={nestedStepHeader}
        onToggleStep={onToggleStep}
        onLoadMore={onLoadMore}
        onLoadCurrentStep={onLoadCurrentStep}
        {...(virtual && { measureRef: virtualizer.measureElement, dataIndex: index })}
        {...logRowProps}
      />
    );
  };

  if (!virtual) {
    return rows.map((row, index) => renderRow(row, index));
  }

  const virtualItems = virtualizer.getVirtualItems();
  const padding = getPadding(
    virtualItems,
    virtualizer.getTotalSize(),
    virtualizer.options.scrollMargin,
  );

  // spacer rows stand for the rows that are not rendered, the grid keeps its full height
  return (
    <>
      <div ref={bodyStartRef} className={cx('spacer')} style={{ height: padding.top }} aria-hidden>
        <div className={cx('spacer-cell')} />
      </div>
      {virtualItems.map(({ index }) => renderRow(rows[index], index))}
      <div className={cx('spacer')} style={{ height: padding.bottom }} aria-hidden>
        <div className={cx('spacer-cell')} />
      </div>
    </>
  );
};
LogsGridBodyComponent.propTypes = {
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
  }).isRequired,
  data: PropTypes.array,
  nestedStepHeader: PropTypes.elementType.isRequired,
  nestedView: PropTypes.bool,
  grouped: PropTypes.bool,
  groupHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  groupFunction: PropTypes.func,
  gridRowClassName: PropTypes.string,
  logsSize: PropTypes.string,
  layoutKey: PropTypes.string,
};
LogsGridBodyComponent.defaultProps = {
  data: [],
  nestedView: true,
  grouped: false,
  groupHeader: null,
  groupFunction: null,
  gridRowClassName: '',
  logsSize: DEFAULT_LOGS_SIZE,
  layoutKey: '',
};

// The rows of the logs grid rendered from a flat row model (log rows, nested step headers and
// "load previous/next" rows) instead of recursive nested grid bodies.
export const LogsGridBody = track()(LogsGridBodyComponent);
