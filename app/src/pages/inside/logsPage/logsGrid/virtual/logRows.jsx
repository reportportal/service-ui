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

import { memo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { NEXT, PREVIOUS } from 'controllers/log';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { GridRow } from 'components/main/grid/gridBody/gridRow';
import {
  RowMore,
  LoadButton,
  messages,
} from 'components/main/grid/gridBody/nestedGridRow/nestedGridRow';
import nestedGridRowStyles from 'components/main/grid/gridBody/nestedGridRow/nestedGridRow.scss';
import DoubleArrow from 'common/img/double-arrow-inline.svg';
import LoadList from 'common/img/list-full-inline.svg';
import { ROW_KIND } from './buildLogRows';
import styles from './logRows.scss';

const cx = classNames.bind(styles);
const cxNested = classNames.bind(nestedGridRowStyles);

// Log steps can hold thousands of rows: skip re-rendering the ones whose props did not change.
const MemoGridRow = memo(GridRow);

const rowPropTypes = PropTypes.shape({
  key: PropTypes.string.isRequired,
  kind: PropTypes.oneOf(Object.values(ROW_KIND)).isRequired,
  item: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired,
  stepId: PropTypes.number,
  collapsed: PropTypes.bool,
  loading: PropTypes.bool,
  showLoadCurrentStep: PropTypes.bool,
});

const LoadCurrentStepButton = ({ row, onLoadCurrentStep, className }) => {
  const { formatMessage } = useIntl();

  return (
    <LoadButton
      customClassName={className}
      loading={row.loading}
      clickHandler={() => onLoadCurrentStep(row.stepId)}
      label={formatMessage(messages.loadCurrentStep)}
      icon={LoadList}
    />
  );
};
LoadCurrentStepButton.propTypes = {
  row: rowPropTypes.isRequired,
  onLoadCurrentStep: PropTypes.func.isRequired,
  className: PropTypes.string,
};
LoadCurrentStepButton.defaultProps = {
  className: '',
};

const StepHeaderRow = memo(
  ({ row, stepHeader: StepHeader, onToggleStep, onLoadCurrentStep, measureRef, dataIndex }) => (
    <StepHeader
      measureRef={measureRef}
      dataIndex={dataIndex}
      data={row.item}
      collapsed={row.collapsed}
      loading={row.collapsed && row.loading}
      onToggle={() => onToggleStep(row.stepId)}
      level={row.level}
      additionalNameCellBlock={
        row.showLoadCurrentStep && (
          <LoadCurrentStepButton
            row={row}
            onLoadCurrentStep={onLoadCurrentStep}
            className={cxNested('overflowed-button', {
              'overflowed-button-collapsed-view': row.collapsed,
            })}
          />
        )
      }
    />
  ),
);
StepHeaderRow.propTypes = {
  row: rowPropTypes.isRequired,
  stepHeader: PropTypes.elementType.isRequired,
  onToggleStep: PropTypes.func.isRequired,
  onLoadCurrentStep: PropTypes.func.isRequired,
  measureRef: PropTypes.func,
  dataIndex: PropTypes.number,
};
StepHeaderRow.defaultProps = {
  measureRef: null,
  dataIndex: undefined,
};

const LoadMoreRow = memo(({ row, onLoadMore, onLoadCurrentStep, measureRef, dataIndex }) => {
  const { formatMessage } = useIntl();
  const isPrevious = row.kind === ROW_KIND.LOAD_PREVIOUS;

  // a real table row around the cell: two adjacent cells would otherwise share one anonymous row
  return (
    <div className={cx('load-more-row')} ref={measureRef} data-index={dataIndex}>
      <RowMore level={row.level}>
        <LoadButton
          loading={row.loading}
          clickHandler={() => onLoadMore(row.stepId, isPrevious ? PREVIOUS : NEXT)}
          label={formatMessage(isPrevious ? messages.loadPreviousLabel : messages.loadLabel)}
          icon={DoubleArrow}
          iconClassName={isPrevious ? cxNested('rotate-icon') : ''}
        />
        <LoadCurrentStepButton row={row} onLoadCurrentStep={onLoadCurrentStep} />
        {row.loading && (
          <div className={cxNested('loading-icon')}>
            <SpinningPreloader />
          </div>
        )}
      </RowMore>
    </div>
  );
});
LoadMoreRow.propTypes = {
  row: rowPropTypes.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  onLoadCurrentStep: PropTypes.func.isRequired,
  measureRef: PropTypes.func,
  dataIndex: PropTypes.number,
};
LoadMoreRow.defaultProps = {
  measureRef: null,
  dataIndex: undefined,
};

// Renders one row of the flat row model with the same components as the recursive nested grid.
export const LogRow = ({
  row,
  rowProps,
  stepHeader,
  onToggleStep,
  onLoadMore,
  onLoadCurrentStep,
  measureRef,
  dataIndex,
  ...logRowProps
}) => {
  switch (row.kind) {
    case ROW_KIND.LOG:
      return (
        <MemoGridRow
          value={row.item}
          level={row.level}
          measureRef={measureRef}
          dataIndex={dataIndex}
          {...rowProps}
          {...logRowProps}
        />
      );
    case ROW_KIND.STEP_HEADER:
      return (
        <StepHeaderRow
          row={row}
          stepHeader={stepHeader}
          onToggleStep={onToggleStep}
          onLoadCurrentStep={onLoadCurrentStep}
          measureRef={measureRef}
          dataIndex={dataIndex}
        />
      );
    default:
      return (
        <LoadMoreRow
          row={row}
          onLoadMore={onLoadMore}
          onLoadCurrentStep={onLoadCurrentStep}
          measureRef={measureRef}
          dataIndex={dataIndex}
        />
      );
  }
};
LogRow.propTypes = {
  row: rowPropTypes.isRequired,
  rowProps: PropTypes.object.isRequired,
  stepHeader: PropTypes.elementType.isRequired,
  onToggleStep: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  onLoadCurrentStep: PropTypes.func.isRequired,
  measureRef: PropTypes.func,
  dataIndex: PropTypes.number,
};
LogRow.defaultProps = {
  measureRef: null,
  dataIndex: undefined,
};
