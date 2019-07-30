import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './mostTimeConsumingTestCasesTable.scss';
import { TestsTableWidget } from '../../tables/components/testsTableWidget/index';
import * as cfg from './tableConfig';

const cx = classNames.bind(styles);

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

export const MostTimeConsumingTestCasesTable = ({ widget: { content } }) => (
  <div className={cx('most-time-consuming-table')}>
    <TestsTableWidget
      tests={prepareWidgetData(content)}
      hideInfoBlock
      launch={content.latestLaunch}
      columns={cfg.columns}
    />
  </div>
);

MostTimeConsumingTestCasesTable.propTypes = {
  widget: PropTypes.object.isRequired,
};
