import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import moment from 'moment';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { defectTypesSelector } from 'controllers/project';
import { getTimestampFromMinutes } from 'common/utils';
import { messages } from './optionTranslations';
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
    if (
      defectTypes[defectTypeTotal.toUpperCase()] &&
      defectTypes[defectTypeTotal.toUpperCase()].length !== 1
    ) {
      const currentDefectType = defectTypes[defectTypeTotal.toUpperCase()][0];
      return `${intl.formatMessage(messages.total)} ${intl.formatMessage(
        messages[currentDefectType.shortName],
      )}`;
    }
    return intl.formatMessage(messages[defectTypeTotal]);
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
    if (value.indexOf(',') !== -1) {
      const splitted = value.split(',');
      return {
        start: parseInt(splitted[0], 10),
        end: parseInt(splitted[1], 10),
        dynamic: false,
      };
    }
    if (value.indexOf(';') !== -1) {
      const splitted = value.split(';');
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
