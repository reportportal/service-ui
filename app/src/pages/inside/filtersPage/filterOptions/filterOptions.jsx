import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import moment from 'moment';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { defectTypesSelector } from 'controllers/project';
import { getTimestampFromMinutes } from 'common/utils';
import styles from './filterOptions.scss';

const cx = classNames.bind(styles);
const CONDITIONS = {
  GTE: 'gte',
  LTE: 'lte',
  EQ: 'eq',
  NOT: 'ne',
  IN: 'in',
  NOT_IN: '!in',
  CNT: 'cnt',
  NOT_CNT: '!cnt',
  HAS: 'has',
  NOT_HAS: '!has',
};
const TIME_DATE_FORMAT = 'HH:mm DD/MM/YYYY';
const OPTIONS = {
  STATISTICS: 'statistics',
  EXECUTIONS: 'executions',
  START_TIME: 'start_time',
  TOTAL: 'total',
};
const messages = defineMessages({
  skipped: {
    id: 'FilterOptions.skipped',
    defaultMessage: 'Skipped',
  },
  passed: {
    id: 'FilterOptions.passed',
    defaultMessage: 'Passed',
  },
  failed: {
    id: 'FilterOptions.failed',
    defaultMessage: 'Failed',
  },
  total: {
    id: 'FilterOptions.total',
    defaultMessage: 'Total',
  },
  automation_bug: {
    id: 'FilterOptions.automation_bug',
    defaultMessage: 'Automation bug',
  },
  AB: {
    id: 'FilterOptions.AB',
    defaultMessage: 'AB',
  },
  system_issue: {
    id: 'FilterOptions.system_issue',
    defaultMessage: 'System issue',
  },
  SI: {
    id: 'FilterOptions.SI',
    defaultMessage: 'SI',
  },
  product_bug: {
    id: 'FilterOptions.product_bug',
    defaultMessage: 'Product bug',
  },
  PB: {
    id: 'FilterOptions.PB',
    defaultMessage: 'PB',
  },
  to_investigate: {
    id: 'FilterOptions.to_investigate',
    defaultMessage: 'To investigate',
  },
  TI: {
    id: 'FilterOptions.TI',
    defaultMessage: 'TI',
  },
  and: {
    id: 'FilterOptions.and',
    defaultMessage: 'AND',
  },
  number: {
    id: 'FilterOptions.number',
    defaultMessage: 'Launch number',
  },
  user: {
    id: 'FilterOptions.user',
    defaultMessage: 'Owner',
  },
  in: {
    id: 'FilterOptions.in',
    defaultMessage: 'has any of',
  },
  not_in: {
    id: 'FilterOptions.not_in',
    defaultMessage: 'without',
  },
  name: {
    id: 'FilterOptions.name',
    defaultMessage: 'Launch name',
  },
  cnt: {
    id: 'FilterOptions.cnt',
    defaultMessage: 'contains',
  },
  start_time: {
    id: 'FilterOptions.start_time',
    defaultMessage: 'Start time',
  },
  from: {
    id: 'FilterOptions.from',
    defaultMessage: 'from',
  },
  to: {
    id: 'FilterOptions.to',
    defaultMessage: 'to',
  },
  dynamic: {
    id: 'FilterOptions.dynamic',
    defaultMessage: '(dynamic)',
  },
  not_cnt: {
    id: 'FilterOptions.not_cnt',
    defaultMessage: 'not contains',
  },
  description: {
    id: 'FilterOptions.description',
    defaultMessage: 'Description',
  },
  tags: {
    id: 'FilterOptions.tags',
    defaultMessage: 'Tags',
  },
  has: {
    id: 'FilterOptions.has',
    defaultMessage: 'has',
  },
  not_has: {
    id: 'FilterOptions.not_has',
    defaultMessage: 'without any of',
  },
  sort: {
    id: 'FilterOptions.sort',
    defaultMessage: 'sorted by',
  },
});

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
@injectIntl
export class FilterOptions extends Component {
  static propTypes = {
    entities: PropTypes.array,
    sort: PropTypes.array,
    defectTypes: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    entities: [],
    sort: [],
  };

  getTotalStatistics = (defectTypeTotal) => {
    const { intl, defectTypes } = this.props;
    if (defectTypes[defectTypeTotal.toUpperCase()].length === 1) {
      return intl.formatMessage(messages[defectTypeTotal]);
    }
    const currentDefectType = defectTypes[defectTypeTotal.toUpperCase()][0];
    return `${intl.formatMessage(messages.total)} ${intl.formatMessage(
      messages[currentDefectType.shortName],
    )}`;
  };

  statisticsOptions = (entity) => {
    const { intl, defectTypes } = this.props;
    const splitKey = entity.filtering_field.split('$');
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
    const time = this.parseValue(entity.value);
    const optionName = intl.formatMessage(messages[entity.filtering_field]);
    const condition = `${this.fotmatTime(time.start)} ${intl.formatMessage(
      messages.to,
    )} ${this.fotmatTime(time.end)} ${time.dynamic && intl.formatMessage(messages.dynamic)}`;
    return `${optionName} ${intl.formatMessage(messages.from)} ${condition}`;
  };

  optionsToString = () => {
    const { intl } = this.props;
    let optionName;
    let condition;
    const result = [];
    this.props.entities.forEach((entity) => {
      const splitKey = entity.filtering_field.split('$');
      const type = splitKey[0];
      if (type === OPTIONS.STATISTICS) {
        optionName = this.statisticsOptions(entity);
      } else if (type === OPTIONS.START_TIME) {
        result.push(this.startTimeOption(entity));
        return;
      } else {
        optionName = intl.formatMessage(messages[entity.filtering_field]);
      }
      switch (entity.condition) {
        case CONDITIONS.GTE:
          condition = '>=';
          break;
        case CONDITIONS.LTE:
          condition = '<=';
          break;
        case CONDITIONS.EQ:
          condition = '=';
          break;
        case CONDITIONS.NOT:
          condition = '!=';
          break;
        case CONDITIONS.IN:
          condition = this.props.intl.formatMessage(messages.in);
          break;
        case CONDITIONS.NOT_IN:
          condition = this.props.intl.formatMessage(messages.not_in);
          break;
        case CONDITIONS.CNT:
          condition = this.props.intl.formatMessage(messages.cnt);
          break;
        case CONDITIONS.NOT_CNT:
          condition = this.props.intl.formatMessage(messages.not_cnt);
          break;
        case CONDITIONS.HAS:
          condition = this.props.intl.formatMessage(messages.has);
          break;
        case CONDITIONS.NOT_HAS:
          condition = this.props.intl.formatMessage(messages.not_has);
          break;
        default:
          condition = '';
      }
      result.push(`${optionName} ${condition} ${entity.value}`);
    });
    const options = result.join(` ${intl.formatMessage(messages.and)} `);
    const sort = `${intl.formatMessage(messages.sort)}: ${this.sortingToString()}`;
    return `(${options}) ${sort}`;
  };

  sortingToString = () => {
    const { intl } = this.props;
    const sort = this.props.sort[0].sorting_column;
    const splitKey = this.props.sort[0].sorting_column.split('$');
    const type = splitKey[0];
    if (type === OPTIONS.STATISTICS) {
      const defectTypeTotal = splitKey[2];
      return this.getTotalStatistics(defectTypeTotal);
    }
    return `${intl.formatMessage(messages[sort])}`;
  };

  parseValue = (value) => {
    const dateString = value;
    if (dateString.indexOf(',') !== -1) {
      const splitted = dateString.split(',');
      return {
        start: parseInt(splitted[0], 10),
        end: parseInt(splitted[1], 10),
        dynamic: false,
      };
    }
    if (dateString.indexOf(';') !== -1) {
      const splitted = dateString.split(';');
      return {
        start: getTimestampFromMinutes(splitted[0]),
        end: getTimestampFromMinutes(splitted[1]),
        dynamic: true,
      };
    }
    throw new Error('Invalid date string provided');
  };

  render() {
    return <p className={cx('options')}>{this.optionsToString()}</p>;
  }
}
