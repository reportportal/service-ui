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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import {
  STATS_TOTAL,
  STATS_SKIPPED,
  STATS_PASSED,
  STATS_FAILED,
} from 'common/constants/statistics';
import {
  PRODUCT_BUG,
  TO_INVESTIGATE,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
} from 'common/constants/defectTypes';
import { FAILED, PASSED } from 'common/constants/testStatuses';
import { Grid, ALIGN_CENTER, ALIGN_RIGHT } from 'components/main/grid';
import { statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ExecutionStatistics } from 'pages/inside/common/launchSuiteGrid/executionStatistics';
import { StatisticsLink } from 'pages/inside/common/statisticsLink';
import { DefectStatistics } from 'pages/inside/common/launchSuiteGrid/defectStatistics';
import { DefectLink } from 'pages/inside/common/defectLink';
import { getItemNameConfig } from 'components/widgets/common/utils';
import {
  defaultDefectsMessages,
  defaultStatisticsMessages,
} from 'components/widgets/singleLevelWidgets/tables/components/messages';
import {
  NAME,
  NAME_KEY,
  CUSTOM_COLUMN,
  CUSTOM_COLUMN_KEY,
  STATUS,
  STATUS_COLUMN_KEY,
  STATISTICS_COLUMN_KEY,
  DEFECT_COLUMN_KEY,
  PASS_RATE,
  PASS_RATE_KEY,
} from './constants';
import { COLUMN_NAMES_MAP, hintMessages } from './messages';
import styles from './componentHealthCheckTable.scss';

const cx = classNames.bind(styles);

const NameColumn = ({ className, value: { attributeValue } }) => (
  <div className={cx('name-col', className)} title={attributeValue}>
    <span>{attributeValue}</span>
  </div>
);
NameColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const CustomColumn = ({ className, value: { customColumn } }, name, { formatMessage }) => {
  return (
    <div className={cx('custom-column-col', className)} title={customColumn}>
      <span className={cx('mobile-hint')}>{formatMessage(hintMessages.customColumnHint)}</span>
      <span className={cx('custom-column-item')}>{customColumn.join(', ')}</span>
    </div>
  );
};
CustomColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const StatusColumn = (
  { className, value: { passingRate } },
  name,
  { minPassingRate, formatMessage },
) => {
  const status = passingRate < minPassingRate ? FAILED : PASSED;

  return (
    <div className={cx('status-col', className)}>
      <span className={cx('mobile-hint')}>{formatMessage(hintMessages.statusHint)}</span>
      <span className={cx('status-item', status.toLowerCase())}>{status}</span>
    </div>
  );
};
StatusColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const StatisticsColumn = ({ className, value }, name) => {
  const defaultColumnProps = {
    className: 'text-alight-right',
  };
  const itemValue = Number(value.statistics[name]);

  return (
    <div className={cx('statistics-col', className)}>
      <div className={cx('desktop-block')}>
        <ExecutionStatistics value={itemValue} {...defaultColumnProps} />
      </div>
      <div className={cx('mobile-block', `statistics-${name.split('$')[2]}`)}>
        <div className={cx('block-content')}>
          {!!itemValue && <StatisticsLink {...defaultColumnProps}>{itemValue}</StatisticsLink>}
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

const DefectsColumn = ({ className, value: { statistics } }, name) => {
  const defaultColumnProps = {};
  const defects = Object.keys(statistics)
    .filter((item) => item.indexOf(name) !== -1)
    .map((defect) => {
      const value = statistics[defect];
      const { locator } = getItemNameConfig(defect);

      return {
        [locator]: value,
      };
    });
  const data = Object.assign({}, ...defects);

  return (
    <div className={cx('defect-col', className)}>
      <div className={cx('desktop-block')}>
        <DefectStatistics type={name} data={data} {...defaultColumnProps} />
      </div>
      <div className={cx('mobile-block', `defect-${name}`)}>
        <div className={cx('block-content')}>
          {!!data.total && (
            <DefectLink {...defaultColumnProps} defects={Object.keys(data)}>
              {data.total}
            </DefectLink>
          )}
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

const PassingRateColumn = ({ className, value: { passingRate } }, name, { formatMessage }) => (
  <div className={cx('passing-rate-col', className)}>
    <span className={cx('mobile-hint')}>{formatMessage(hintMessages.passingRateHint)}</span>
    <span className={cx('passing-rate-item')}>{passingRate}%</span>
  </div>
);
PassingRateColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const columnComponentsMap = {
  [NAME_KEY]: NameColumn,
  [CUSTOM_COLUMN_KEY]: CustomColumn,
  [STATUS_COLUMN_KEY]: StatusColumn,
  [STATISTICS_COLUMN_KEY]: StatisticsColumn,
  [DEFECT_COLUMN_KEY]: DefectsColumn,
  [PASS_RATE_KEY]: PassingRateColumn,
};

const COLUMNS_KEYS_MAP = {
  [NAME]: NAME_KEY,
  [CUSTOM_COLUMN]: CUSTOM_COLUMN_KEY,
  [STATUS]: STATUS_COLUMN_KEY,
  [STATS_TOTAL]: STATISTICS_COLUMN_KEY,
  [STATS_PASSED]: STATISTICS_COLUMN_KEY,
  [STATS_FAILED]: STATISTICS_COLUMN_KEY,
  [STATS_SKIPPED]: STATISTICS_COLUMN_KEY,
  [PRODUCT_BUG]: DEFECT_COLUMN_KEY,
  [AUTOMATION_BUG]: DEFECT_COLUMN_KEY,
  [SYSTEM_ISSUE]: DEFECT_COLUMN_KEY,
  [TO_INVESTIGATE]: DEFECT_COLUMN_KEY,
  [PASS_RATE]: PASS_RATE_KEY,
};

const getGridAlign = (type) => {
  switch (type) {
    case STATISTICS_COLUMN_KEY:
      return ALIGN_RIGHT;
    case STATUS_COLUMN_KEY:
      return ALIGN_CENTER;
    case DEFECT_COLUMN_KEY:
      return ALIGN_CENTER;
    case PASS_RATE_KEY:
      return ALIGN_RIGHT;
    default:
      return null;
  }
};

const getColumn = (name, customProps, customColumn) => {
  const align = getGridAlign(COLUMNS_KEYS_MAP[name]);

  return {
    id: name,
    title: COLUMN_NAMES_MAP[name](customColumn),
    align,
    component: (data) => columnComponentsMap[COLUMNS_KEYS_MAP[name]](data, name, customProps),
  };
};

@injectIntl
@connect((state) => ({
  project: activeProjectSelector(state),
  getStatisticsLink: statisticsLinkSelector(state),
}))
export class ComponentHealthCheckTable extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    fetchWidget: PropTypes.func,
    clearQueryParams: PropTypes.func,
    container: PropTypes.instanceOf(Element).isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired,
  };

  getCustomColumn = () =>
    this.props.widget.contentParameters &&
    this.props.widget.contentParameters.widgetOptions.customColumn;

  getContentResult = () => this.props.widget.content && this.props.widget.content.result;

  getPassingRateValue = () =>
    Number(
      this.props.widget.contentParameters &&
        this.props.widget.contentParameters.widgetOptions.minPassingRate,
    );

  getColumns = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const customProps = {
      minPassingRate: this.getPassingRateValue(),
      formatMessage,
      linkPayload: {},
      onOwnerClick: () => {},
      onClickAttribute: () => {},
    };
    const customColumn = this.getCustomColumn();

    return Object.keys(COLUMNS_KEYS_MAP).reduce((columns, item) => {
      if (!customColumn && item === CUSTOM_COLUMN) {
        return columns;
      }

      return [...columns, getColumn(item, customProps, customColumn)];
    }, []);
  };

  render() {
    const columns = this.getColumns();
    const data = this.getContentResult();

    return (
      <ScrollWrapper hideTracksWhenNotNeeded>
        {columns && (
          <Fragment>
            <Grid columns={columns} data={data} />
          </Fragment>
        )}
      </ScrollWrapper>
    );
  }
}
