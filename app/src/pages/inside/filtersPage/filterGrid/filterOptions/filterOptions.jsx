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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import moment from 'moment';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { defectTypesSelector } from 'controllers/project';
import { parseDateTimeRange } from 'common/utils';
import {
  CONDITION_CNT,
  CONDITION_NOT_CNT,
  CONDITION_EQ,
  CONDITION_GREATER_EQ,
  CONDITION_LESS_EQ,
  CONDITION_HAS,
  CONDITION_NOT_HAS,
  CONDITION_IN,
  CONDITION_NOT_IN,
  CONDITION_NOT_EQ,
  ENTITY_NUMBER,
  CONDITION_ANY,
  CONDITION_NOT_ANY,
} from 'components/filterEntities/constants';
import { TIME_DATE_FORMAT } from 'common/constants/timeDateFormat';
import { messages } from './optionTranslations';
import styles from './filterOptions.scss';

const cx = classNames.bind(styles);
const OPTIONS = {
  STATISTICS: 'statistics',
  EXECUTIONS: 'executions',
  START_TIME: 'startTime',
  TOTAL: 'total',
};

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
@injectIntl
export class FilterOptions extends Component {
  static propTypes = {
    entities: PropTypes.array,
    sort: PropTypes.array,
    defectTypes: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  };

  static defaultProps = {
    children: null,
    entities: [],
    sort: [],
  };

  getTotalStatistics = (defectTypeTotal) => {
    const { intl, defectTypes } = this.props;
    if (defectTypes[defectTypeTotal.toUpperCase()]) {
      const currentDefectType = defectTypes[defectTypeTotal.toUpperCase()][0];
      if (defectTypes[defectTypeTotal.toUpperCase()].length !== 1) {
        return `${intl.formatMessage(messages.total)} ${currentDefectType.shortName}`;
      }
      return currentDefectType.longName;
    }
    return intl.formatMessage(messages[defectTypeTotal]);
  };

  statisticsOptions = (entity) => {
    const { intl, defectTypes } = this.props;
    const splitKey = entity.filteringField.split('$');
    const locator = splitKey.pop();
    const defectTypeTotal = splitKey.pop();
    if (defectTypeTotal === OPTIONS.EXECUTIONS) {
      return intl.formatMessage(messages[locator]);
    }
    if (locator === OPTIONS.TOTAL) {
      return this.getTotalStatistics(defectTypeTotal);
    }
    const currentDefectType = defectTypes[defectTypeTotal.toUpperCase()].find(
      (item) => item.locator === locator,
    );
    return (currentDefectType && currentDefectType.longName) || locator;
  };

  fotmatTime = (time) => moment(time).format(TIME_DATE_FORMAT);

  startTimeOption = (entity) => {
    const { intl } = this.props;
    const time = parseDateTimeRange(entity);
    const dynamic = time.dynamic ? intl.formatMessage(messages.dynamic) : '';
    const optionName = intl.formatMessage(messages[entity.filteringField]);
    const condition = `${this.fotmatTime(time.start)} ${intl.formatMessage(
      messages.to,
    )} ${this.fotmatTime(time.end)} ${dynamic}`;
    return `${optionName} ${intl.formatMessage(messages.from)} ${condition}`;
  };

  optionsToString = () => {
    const { intl } = this.props;
    let optionName;
    let condition;
    const result = this.props.entities.map((entity) => {
      const splitKey = entity.filteringField.split('$');
      const type = splitKey[0];
      if (type === OPTIONS.START_TIME) {
        return this.startTimeOption(entity);
      } else if (type === OPTIONS.STATISTICS) {
        optionName = this.statisticsOptions(entity);
      } else {
        optionName = intl.formatMessage(messages[entity.filteringField]);
      }
      switch (entity.condition) {
        case CONDITION_GREATER_EQ:
          condition = '>=';
          break;
        case CONDITION_LESS_EQ:
          condition = '<=';
          break;
        case CONDITION_EQ:
          condition = '=';
          break;
        case CONDITION_NOT_EQ:
          condition = '!=';
          break;
        case CONDITION_IN:
          condition = this.props.intl.formatMessage(messages.in);
          break;
        case CONDITION_NOT_IN:
          condition = this.props.intl.formatMessage(messages.not_in);
          break;
        case CONDITION_CNT:
          condition = this.props.intl.formatMessage(messages.cnt);
          break;
        case CONDITION_NOT_CNT:
          condition = this.props.intl.formatMessage(messages.not_cnt);
          break;
        case CONDITION_HAS:
          condition = this.props.intl.formatMessage(messages.has);
          break;
        case CONDITION_NOT_HAS:
          condition = this.props.intl.formatMessage(messages.not_has);
          break;
        case CONDITION_ANY:
          condition = this.props.intl.formatMessage(messages.any);
          break;
        case CONDITION_NOT_ANY:
          condition = this.props.intl.formatMessage(messages.not_any);
          break;
        default:
          condition = '';
      }
      return `${optionName} ${condition} ${entity.value}`;
    });
    const options = result.join(` ${intl.formatMessage(messages.and)} `);
    const sort = `${intl.formatMessage(messages.sort)}: ${this.sortingToString()}`;
    return `(${options}) ${sort}`;
  };

  sortingToString = () => {
    const { intl, sort } = this.props;
    const nonDefaultOrders = sort.filter((order) => order.sortingColumn !== ENTITY_NUMBER);
    const sortingColumn = nonDefaultOrders.length
      ? nonDefaultOrders[0].sortingColumn
      : sort[0].sortingColumn;
    const splitKey = sortingColumn.split('$');
    const type = splitKey[0];
    if (type === OPTIONS.STATISTICS) {
      const defectTypeTotal = splitKey[2];
      return this.getTotalStatistics(defectTypeTotal);
    }
    return `${intl.formatMessage(messages[sortingColumn])}`;
  };

  render() {
    const { children } = this.props;

    return (
      <p className={cx('filter-options')}>
        {this.optionsToString()} {children}
      </p>
    );
  }
}
