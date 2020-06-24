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
import Link from 'redux-first-router-link';
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
import { statisticsLinkSelector, TEST_ITEMS_TYPE_LIST } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { DefectStatistics } from 'pages/inside/common/launchSuiteGrid/defectStatistics';
import { DefectLink } from 'pages/inside/common/defectLink';
import { getItemNameConfig, getDefaultTestItemLinkParams } from 'components/widgets/common/utils';
import {
  defaultDefectsMessages,
  defaultStatisticsMessages,
} from 'components/widgets/singleLevelWidgets/tables/components/messages';
import { getStatisticsStatuses } from 'components/widgets/singleLevelWidgets/tables/components/utils';
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

const NameColumn = ({ className, value }, name, { formatMessage }) => (
  <div className={cx('name-col', className)} title={value.attributeValue}>
    {value.attributeValue ? (
      <span className={cx('name-attr')}>{value.attributeValue}</span>
    ) : (
      <span className={cx('name-total', 'total-item')}>
        {formatMessage(hintMessages.nameTotal)}
      </span>
    )}
  </div>
);
NameColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const CustomColumn = ({ className, value }, name, { formatMessage }) => {
  return (
    <div className={cx('custom-column-col', className)} title={value.customColumn}>
      {!!value.customColumn && (
        <Fragment>
          <span className={cx('mobile-hint')}>{formatMessage(hintMessages.customColumnHint)}</span>
          <span className={cx('custom-column-item')}>{value.customColumn.join(', ')}</span>
        </Fragment>
      )}
    </div>
  );
};
CustomColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const StatusColumn = ({ className, value }, name, { minPassingRate, formatMessage }) => {
  const status = value.passingRate < minPassingRate ? FAILED : PASSED;

  return (
    <div className={cx('status-col', className)}>
      {!!value.passingRate && (
        <Fragment>
          <span className={cx('mobile-hint')}>{formatMessage(hintMessages.statusHint)}</span>
          <span className={cx('status-item', status.toLowerCase())}>{status}</span>
        </Fragment>
      )}
    </div>
  );
};
StatusColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const StatisticsColumn = ({ className, value }, name, { onStatisticsClick }) => {
  const itemValue = Number(value.statistics && value.statistics[name]);
  const statuses = getStatisticsStatuses(name);

  return (
    <div className={cx('statistics-col', className)}>
      {value.statistics ? (
        <Fragment>
          <div className={cx('desktop-block')}>
            {!!itemValue && (
              <Link className={cx('link')} to={onStatisticsClick(statuses)} target="_blank">
                {itemValue}
              </Link>
            )}
          </div>
          <div className={cx('mobile-block', `statistics-${name.split('$')[2]}`)}>
            <div className={cx('block-content')}>
              {!!itemValue && (
                <Link className={cx('link')} to={onStatisticsClick(statuses)} target="_blank">
                  {itemValue}
                </Link>
              )}
              <span className={cx('message')}>{defaultStatisticsMessages[name]}</span>
            </div>
          </div>
        </Fragment>
      ) : (
        <span className={cx('total-item')}>{Number(value.total && value.total[name])}</span>
      )}
    </div>
  );
};
StatisticsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const getDefects = (values, name) => {
  const defects = Object.keys(values)
    .filter((item) => item.indexOf(name) !== -1)
    .map((defect) => {
      const value = values[defect];
      const { locator } = getItemNameConfig(defect);

      return {
        [locator]: value,
      };
    });

  return Object.assign({}, ...defects);
};

const DefectsColumn = ({ className, value }, name) => {
  const defaultColumnProps = {};
  const data = value.statistics
    ? getDefects(value.statistics, name)
    : getDefects(value.total, name);

  return (
    <div className={cx('defect-col', className)}>
      {value.statistics ? (
        <Fragment>
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
        </Fragment>
      ) : (
        <span className={cx('total-item')}>{data.total}</span>
      )}
    </div>
  );
};
DefectsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const PassingRateColumn = ({ className, value }, name, { formatMessage }) => (
  <div className={cx('passing-rate-col', className)}>
    {value.passingRate ? (
      <Fragment>
        <span className={cx('mobile-hint')}>{formatMessage(hintMessages.passingRateHint)}</span>
        <span className={cx('passing-rate-item')}>{value.passingRate}%</span>
      </Fragment>
    ) : (
      <span className={cx('total-item')}>{!!value.total && value.total.passingRate}%</span>
    )}
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
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class ComponentHealthCheckTable extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    fetchWidget: PropTypes.func,
    clearQueryParams: PropTypes.func,
    container: PropTypes.instanceOf(Element).isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
  };

  getCustomColumn = () =>
    this.props.widget.contentParameters &&
    this.props.widget.contentParameters.widgetOptions.customColumn;

  getContentResult = () =>
    this.props.widget.content && [
      ...this.props.widget.content.result,
      { total: this.props.widget.content.total },
    ];

  getPassingRateValue = () =>
    Number(
      this.props.widget.contentParameters &&
        this.props.widget.contentParameters.widgetOptions.minPassingRate,
    );

  onStatisticsClick = (...statuses) => {
    const { widget, getStatisticsLink, project } = this.props;

    const launchesLimit = widget.contentParameters.itemsCount;
    const isLatest = widget.contentParameters.widgetOptions.latest;
    const link = getStatisticsLink({
      statuses,
      launchesLimit,
      isLatest,
    });
    const navigationParams = getDefaultTestItemLinkParams(
      project,
      widget.appliedFilters[0].id,
      TEST_ITEMS_TYPE_LIST,
    );

    return Object.assign(link, navigationParams);
  };

  getColumns = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const customProps = {
      minPassingRate: this.getPassingRateValue(),
      formatMessage,
      onStatisticsClick: this.onStatisticsClick,
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
