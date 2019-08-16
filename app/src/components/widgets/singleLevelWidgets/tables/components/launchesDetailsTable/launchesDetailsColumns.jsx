import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames/bind';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { formatItemName } from 'controllers/testItem';
import { NameLink } from 'pages/inside/common/nameLink';
import { StatisticsLink } from 'pages/inside/common/statisticsLink';
import { ExecutionStatistics } from 'pages/inside/common/launchSuiteGrid/executionStatistics';
import { DefectTypeBlock } from 'pages/inside/common/infoLine/defectTypeBlock';
import { getStatisticsStatuses, getPassingRate } from '../utils';
import { defaultStatisticsMessages } from '../messages';
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
  const statValue = Number(executions[statsKey]);

  return (
    <div className={cx('statistics-col', className)}>
      <div className={cx('desktop-block')}>
        <ExecutionStatistics value={statValue} {...defaultColumnProps} />
      </div>
      <div className={cx('mobile-block')}>
        <div className={cx('block-content', 'hint-message')}>
          <span className={cx('message')}>{defaultStatisticsMessages[id]}</span>
          {statValue ? (
            <StatisticsLink className={cx('value')} {...defaultColumnProps}>
              {statValue}
            </StatisticsLink>
          ) : (
            0
          )}
        </div>
      </div>
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

  return (
    <div className={cx('passing-rate-col', className)}>
      <span className={cx('hint-message')}>Pass. rate</span>
      {passingRate}
    </div>
  );
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
    <div className={cx('defect-types-col', className)}>
      <h5 className={cx('hint-message')}>Defect type</h5>
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
