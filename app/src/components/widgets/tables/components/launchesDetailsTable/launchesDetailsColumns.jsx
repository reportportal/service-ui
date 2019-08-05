import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames/bind';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { NameLink } from 'pages/inside/common/nameLink';
import { ExecutionStatistics } from 'pages/inside/common/launchSuiteGrid/executionStatistics';
import { formatItemName } from 'controllers/testItem';
import { DefectTypeBlock } from 'pages/inside/common/infoLine/defectTypeBlock';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import { getStatisticsStatuses, getPassingRate } from '../utils';
import styles from './launchesDetailsColumns.scss';

const cx = classNames.bind(styles);

export const NameColumn = ({ className, value, customProps }) => {
  const ownLinkParams = {
    page: TEST_ITEM_PAGE,
    payload: customProps.linkPayload,
  };

  return (
    <div className={cx('name-col', className)}>
      <NameLink itemId={value.id} ownLinkParams={ownLinkParams} className={cx('name-link')}>
        <span title={value.name} className={cx('name')}>
          {`${formatItemName(value.name)} `}
          {value.number && `#${value.number}`}
        </span>
      </NameLink>
    </div>
  );
};
NameColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object.isRequired,
};

export const StatisticsColumn = ({
  id,
  className,
  value,
  customProps: { linkPayload, statsKey },
}) => {
  const {
    id: itemId,
    statistics: { executions },
  } = value;

  const defaultColumnProps = {
    itemId: Number(itemId),
    statuses: getStatisticsStatuses(id),
    ownLinkParams: {
      page: TEST_ITEM_PAGE,
      payload: linkPayload,
    },
  };
  return (
    <div className={cx('statistics-col', className)}>
      <ExecutionStatistics value={Number(executions[statsKey])} {...defaultColumnProps} />
    </div>
  );
};
StatisticsColumn.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object.isRequired,
};

export const PassingRateColumn = ({ className, value }) => {
  const {
    statistics: {
      executions: { passed, total },
    },
  } = value;

  const passingRate = getPassingRate(passed, total);

  return <div className={cx('passing-rate-col', className)}>{passingRate}</div>;
};
PassingRateColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export const DefectTypesColumn = ({ className, value, customProps }) => {
  const {
    statistics: { defects },
  } = value;
  const ownLinkParams = {
    itemId: Number(value.id),
    ownLinkParams: {
      page: TEST_ITEM_PAGE,
      payload: customProps.linkPayload,
    },
  };

  return (
    <div className={cx(className)}>
      {DEFECT_TYPES_SEQUENCE.map((defect) => {
        const defectValue = defects[defect.toLowerCase()];

        return defectValue ? (
          <div key={defect} className={cx('defect-type')}>
            <DefectTypeBlock {...ownLinkParams} type={defect} data={defectValue} />
          </div>
        ) : null;
      })}
    </div>
  );
};
DefectTypesColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object.isRequired,
};
