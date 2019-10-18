/*
 * Copyright 2019 EPAM Systems
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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { formatItemName } from 'controllers/testItem';
import { LAUNCHES_PAGE, TEST_ITEM_PAGE } from 'controllers/pages';
import { AbsRelTime } from 'components/main/absRelTime';
import { NameLink } from 'pages/inside/common/nameLink';
import { ExecutionStatistics } from 'pages/inside/common/launchSuiteGrid/executionStatistics';
import { DefectStatistics } from 'pages/inside/common/launchSuiteGrid/defectStatistics';
import { StatisticsLink } from 'pages/inside/common/statisticsLink';
import { DefectLink } from 'pages/inside/common/defectLink';
import { formatStatus } from 'common/utils/localizationUtils';
import { getStatisticsStatuses } from '../components/utils';
import { defaultDefectsMessages, defaultStatisticsMessages } from '../components/messages';
import { FILTER_TITLE_TYPE, FILTER_TYPE, TOTAL_TYPE } from './constants';
import { passingRateMessage, hintMessages, totalMessage, filterMessage } from './messages';

import styles from './innerComponents.scss';

const cx = classNames.bind(styles);

export const NameColumn = (
  { className, value },
  name,
  { formatMessage, linkPayload, onFilterNameClick },
) => {
  if (value.type === TOTAL_TYPE) {
    return (
      <div className={cx('name-col', 'total-col', 'total-col--desktop', className)}>
        {formatMessage(totalMessage)}
      </div>
    );
  }

  if (value.type === FILTER_TITLE_TYPE) {
    return (
      <div className={cx('filter-name-col', className)}>
        <span className={cx('prefix-text')}>{formatMessage(filterMessage)}:&nbsp;</span>
        <span className={cx('filter-name-text')}>{value.name}</span>
      </div>
    );
  }

  const ownLinkParams = {
    page: value.type === FILTER_TYPE ? LAUNCHES_PAGE : TEST_ITEM_PAGE,
    payload: { ...linkPayload },
  };

  return (
    <div
      className={cx('name-col', className)}
      onClick={() => {
        if (value.type === FILTER_TYPE) onFilterNameClick(value.filterId);
      }}
    >
      <NameLink itemId={value.linkId} ownLinkParams={ownLinkParams} className={cx('name-link')}>
        {value.name && (
          <span title={value.name} className={cx('name')}>
            {formatItemName(value.name)}
          </span>
        )}
        {value.number && <span className={cx('number')}> #{value.number}</span>}
      </NameLink>
      {value.qty && (
        <div className={cx('quantity-col')}>
          {Array.from(Array(value.qty).keys()).map((key) => (
            <div className={cx('red-square')} key={key} />
          ))}
        </div>
      )}
    </div>
  );
};
NameColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export const AttributeColumn = ({ className, value }, name) => {
  if (value.type === TOTAL_TYPE) {
    return <div className={cx('attribute-col', 'total-col', 'desktop-block', className)} />;
  }
  if (value.type === FILTER_TITLE_TYPE) {
    return null;
  }
  return (
    <div className={cx('attribute-col', className)}>
      <div className={cx('mobile-hint')}>{name}:</div>
      {value.attributes &&
        value.attributes[name] &&
        value.attributes[name].map((item) => <div>{item || ''}</div>)}
    </div>
  );
};
AttributeColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export const StatusColumn = ({ className, value }, name, { formatMessage }) => {
  if (value.type === TOTAL_TYPE) {
    return <div className={cx('status-col', 'total-col', 'desktop-block', className)} />;
  }
  if (value.type === FILTER_TITLE_TYPE) {
    return null;
  }
  return (
    <div className={cx('status-col', className)}>
      <span className={cx('mobile-hint')}>{formatMessage(hintMessages.statusHint)}</span>
      <span className={cx('uppercase')}>{formatStatus(formatMessage, value.status)}</span>
    </div>
  );
};
StatusColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export const TimeColumn = ({ className, value }, name, { formatMessage }) => {
  if (value.type === TOTAL_TYPE) {
    return <div className={cx('time-col', 'total-col', 'desktop-block', className)} />;
  }
  if (value.type === FILTER_TITLE_TYPE) {
    return null;
  }
  return (
    <div className={cx('time-col', className)}>
      {value.startTime && (
        <Fragment>
          <span className={cx('mobile-hint')}>{formatMessage(hintMessages.startTimeHint)}</span>
          <AbsRelTime startTime={new Date(value.startTime).getTime()} />
        </Fragment>
      )}
    </div>
  );
};
TimeColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export const StatisticsColumn = (
  { className, value },
  name,
  { linkPayload, onFilterNameClick },
) => {
  const defaultColumnProps = {
    itemId: Number(value.linkId),
    statuses: getStatisticsStatuses(name),
    ownLinkParams: {
      page: value.type === FILTER_TYPE ? LAUNCHES_PAGE : TEST_ITEM_PAGE,
      payload: { ...linkPayload },
    },
  };
  if (value.type === TOTAL_TYPE) {
    return (
      <div className={cx('statistics-col', 'total-col', className)}>
        <div className={cx('desktop-block', 'total-col--desktop')}>{value.values[name]}</div>
        <div className={cx('mobile-block', `statistics-${name.split('$')[2]}`)}>
          <div className={cx('block-content')}>
            <span>{value.values[name]}</span>
            <span className={cx('message')}>{defaultStatisticsMessages[name]}</span>
          </div>
        </div>
      </div>
    );
  }
  if (value.type === FILTER_TITLE_TYPE) {
    return null;
  }
  return (
    <div
      className={cx('statistics-col', className)}
      onClick={() => {
        if (value.type === FILTER_TYPE) onFilterNameClick(value.filterId);
      }}
    >
      <div className={cx('desktop-block')}>
        <ExecutionStatistics value={Number(value.values[name])} {...defaultColumnProps} />
      </div>
      <div className={cx('mobile-block', `statistics-${name.split('$')[2]}`)}>
        <div className={cx('block-content')}>
          <StatisticsLink className={cx('value')} {...defaultColumnProps}>
            {Number(value.values[name])}
          </StatisticsLink>
          <span className={cx('message')}>{defaultStatisticsMessages[name]}</span>
        </div>
      </div>
    </div>
  );
};
StatisticsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export const DefectsColumn = ({ className, value }, name, { linkPayload, onFilterNameClick }) => {
  const nameConfig = name.split('$');
  const defectType = nameConfig[2];
  const defectLocator = nameConfig[3];
  const itemValue = value.values[name];
  const defaultColumnProps = {
    itemId: Number(value.linkId),
    ownLinkParams: {
      page: value.type === FILTER_TYPE ? LAUNCHES_PAGE : TEST_ITEM_PAGE,
      payload: { ...linkPayload },
    },
  };
  if (value.type === TOTAL_TYPE) {
    return (
      <div className={cx('defect-col', 'total-col', className)}>
        <div className={cx('desktop-block', 'total-col--desktop')}>{itemValue}</div>
        <div className={cx('mobile-block', `defect-${defectType}`)}>
          <div className={cx('block-content')}>
            <span>{itemValue}</span>
            <span className={cx('message')}>{defaultDefectsMessages[name]}</span>
          </div>
        </div>
      </div>
    );
  }
  if (value.type === FILTER_TITLE_TYPE) {
    return null;
  }
  return (
    <div
      className={cx('defect-col', className)}
      onClick={() => {
        if (value.type === FILTER_TYPE) onFilterNameClick(value.filterId);
      }}
    >
      <div className={cx('desktop-block')}>
        <DefectStatistics
          type={defectType}
          data={{ [defectLocator]: itemValue, total: itemValue }}
          {...defaultColumnProps}
        />
      </div>
      <div className={cx('mobile-block', `defect-${defectType}`)}>
        <div className={cx('block-content')}>
          <DefectLink {...defaultColumnProps} defects={[defectLocator, 'total']}>
            {itemValue}
          </DefectLink>
          <span className={cx('message')}>{defaultDefectsMessages[name]}</span>
        </div>
      </div>
    </div>
  );
};
DefectsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export const PassingRateColumn = ({ className, value }, name, { formatMessage }) => {
  if (value.type === FILTER_TITLE_TYPE) {
    return null;
  }
  const passingRate = value.passingRate ? `${Math.round(value.passingRate)}%` : '';
  return (
    <div
      className={cx('passing-rate-col', className, {
        'total-col': value.type === 'total',
        success: value.passingRate === 100,
      })}
    >
      <div className={cx('desktop-block')}>{passingRate}</div>
      <div className={cx('mobile-block', `passing-rate`)}>
        <div className={cx('block-content', { success: value.passingRate === 100 })}>
          {passingRate}
          <span className={cx('message')}>{formatMessage(passingRateMessage)}</span>
        </div>
      </div>
    </div>
  );
};
PassingRateColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};
