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
import { PREVIOUS } from 'controllers/log';
import {
  nestedStepsSelector,
  requestNestedStepAction,
  loadMoreNestedStepAction,
  fetchCurrentStepAction,
} from 'controllers/log/nestedSteps';
import { INITIAL_STATE } from 'controllers/log/nestedSteps/constants';
import { buildLogRows, ROW_KIND } from './buildLogRows';
import { LogRow } from './logRows';

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
  ...rowProps
}) => {
  const dispatch = useDispatch();
  const nestedSteps = useSelector(nestedStepsSelector);
  const rows = useMemo(() => buildLogRows(data, nestedSteps), [data, nestedSteps]);
  const { eventsInfo = {}, expanded } = rowProps;

  // the expanded state of long messages, restored when a row is mounted again; it starts over
  // when the "no logs collapsing" setting changes, as the rows do
  const expandedRows = useMemo(() => new Map(), [expanded]);
  const onExpandedChange = useCallback(
    (rowId, rowExpanded) => expandedRows.set(rowId, rowExpanded),
    [expandedRows],
  );

  const itemIntoViewRef = useRef(null);
  const scrollToLog = useCallback(() => {
    itemIntoViewRef.current?.scrollIntoView({ block: 'center' });
    itemIntoViewRef.current = null;
  }, []);
  const { anchorId, setAnchor } = useLoadPreviousAnchor(nestedSteps, scrollToLog);

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

  return rows.map((row) => {
    const logRowProps =
      row.kind === ROW_KIND.LOG
        ? {
            initialExpanded: expandedRows.get(row.item.id),
            onExpandedChange,
            ...(row.item.id === anchorId && { itemIntoViewId: anchorId, itemIntoViewRef }),
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
        {...logRowProps}
      />
    );
  });
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
};
LogsGridBodyComponent.defaultProps = {
  data: [],
  nestedView: true,
  grouped: false,
  groupHeader: null,
  groupFunction: null,
  gridRowClassName: '',
};

// The rows of the logs grid rendered from a flat row model (log rows, nested step headers and
// "load previous/next" rows) instead of recursive nested grid bodies.
export const LogsGridBody = track()(LogsGridBodyComponent);
