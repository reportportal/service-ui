import React from 'react';
import PropTypes from 'prop-types';
import { TestsTableWidget } from '../../tables/components/testsTableWidget/index';
import * as cfg from './tableConfig';

const defaultAvailableHeight = 300;

const prepareWidgetData = ({ result }) =>
  result.map((el) => ({
    type: el.type,
    path: el.path,
    id: el.id,
    name: el.name,
    uniqueId: el.uniqueId,
    startTime: el.startTime,
    status: [el.status.toLowerCase()],
    duration: el.duration,
  }));

export const TimeConsumingTestCasesTable = ({ widget: { content }, availableHeight }) => (
  <div style={{ height: availableHeight || defaultAvailableHeight }}>
    <TestsTableWidget
      tests={prepareWidgetData(content)}
      hideInfoBlock
      launch={content.latestLaunch}
      columns={cfg.columns}
    />
  </div>
);

TimeConsumingTestCasesTable.propTypes = {
  widget: PropTypes.object.isRequired,
  availableHeight: PropTypes.number.isRequired,
};
