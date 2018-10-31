import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { ItemInfo } from 'pages/inside/common/itemInfo';
import {
  STATS_TOTAL,
  STATS_SKIPPED,
  STATS_PASSED,
  STATS_FAILED,
} from 'common/constants/statistics';
import { ExecutionStatistics } from 'pages/inside/common/launchSuiteGrid/executionStatistics';
import { DefectStatistics } from 'pages/inside/common/launchSuiteGrid/defectStatistics';
import { ToInvestigateStatistics } from 'pages/inside/common/launchSuiteGrid/toInvestigateStatistics';
import { DefectLink } from 'pages/inside/common/defectLink';
import { formatStatus } from 'common/utils/localizationUtils';
import { getStatisticsStatuses } from './utils';
import {
  STATS_SI,
  STATS_AB,
  STATS_PB,
  STATS_TI,
  START_TIME,
  NAME,
  END_TIME,
  STATUS,
  TIME_COLUMN_KEY,
  DEFECT_COLUMN_KEY,
  STATISTICS_COLUMN_KEY,
  STATUS_COLUMN_KEY,
  NAME_COLUMN_KEY,
} from './constants';
import {
  COLUMN_NAMES_MAP,
  defaultStatusesMessages,
  defaultStatisticsMessages,
  hintMessages,
} from './messages';
import styles from './launchesTable.scss';

const cx = classNames.bind(styles);
let formatMessage = null;

const NameColumn = ({ className, value }) => {
  const { values } = value;
  const itemPropValue = {
    id: value.id,
    name: value.name,
    owner: values.user,
    number: value.number,
    description: values.description,
    tags: values.tags && value.values.tags.split(','),
  };
  return (
    <div className={cx('name-col', className)}>
      <ItemInfo value={itemPropValue} editDisabled />
    </div>
  );
};
NameColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const StatusColumn = ({ className, value: { values } }) => (
  <div className={cx('status-col', className)}>
    <span className={cx('mobile-hint')}>{formatMessage(hintMessages.statusHint)}</span>
    {formatStatus(formatMessage, values.status)}
  </div>
);
StatusColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const TimeColumn = ({ className, value }, name) => (
  <div className={cx('time-col', className)}>
    <span className={cx('mobile-hint')}>
      {formatMessage(name === START_TIME ? hintMessages.startTimeHint : hintMessages.endTimeHint)}
    </span>
    <AbsRelTime startTime={Number(name === START_TIME ? value.startTime : value.values.end_time)} />
  </div>
);
TimeColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const StatisticsColumn = ({ className, value }, name) => (
  <div className={cx('statistics-col', className)}>
    <div className={cx('desktop-block')}>
      <ExecutionStatistics
        itemId={Number(value.id)}
        value={Number(value.values[name])}
        statuses={getStatisticsStatuses(name)}
      />
    </div>
    <div className={cx('mobile-block', `statistics-${name.split('$')[2]}`)}>
      <div className={cx('block-content')}>
        <span className={cx('value')}>{Number(value.values[name])}</span>
        <span className={cx('message')}>{defaultStatisticsMessages[name]}</span>
      </div>
    </div>
  </div>
);
StatisticsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const DefectsColumn = ({ className, value }, name) => {
  const nameConfig = name.split('$');
  const defectType = nameConfig[2];
  const defectLocator = nameConfig[3];
  const itemValue = value.values[name];

  return (
    <div className={cx('defect-col', className)}>
      <div className={cx('desktop-block')}>
        {!!Number(itemValue) &&
          (name === STATS_TI ? (
            <ToInvestigateStatistics
              value={{
                [defectLocator]: itemValue,
                total: itemValue,
              }}
              itemId={Number(value.id)}
            />
          ) : (
            <DefectStatistics
              type={defectType}
              data={{
                [defectLocator]: itemValue,
                total: itemValue,
              }}
              itemId={Number(value.id)}
            />
          ))}
      </div>
      <div className={cx('mobile-block', `defect-${defectType}`)}>
        <div className={cx('block-content')}>
          <DefectLink itemId={Number(value.id)} defects={[defectLocator, 'total']}>
            {itemValue}
          </DefectLink>
          <span className={cx('message')}>{defaultStatusesMessages[name]}</span>
        </div>
      </div>
    </div>
  );
};
DefectsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const columnComponentsMap = {
  [STATISTICS_COLUMN_KEY]: StatisticsColumn,
  [DEFECT_COLUMN_KEY]: DefectsColumn,
  [TIME_COLUMN_KEY]: TimeColumn,
  [NAME_COLUMN_KEY]: NameColumn,
  [STATUS_COLUMN_KEY]: StatusColumn,
};

const getColumn = (name, columnType) => ({
  id: name,
  title: COLUMN_NAMES_MAP[name],
  component: (data) => columnComponentsMap[columnType](data, name),
});

const COLUMNS_MAP = {
  [NAME]: getColumn(NAME, NAME_COLUMN_KEY),
  [STATUS]: getColumn(STATUS, STATUS_COLUMN_KEY),
  [START_TIME]: getColumn(START_TIME, TIME_COLUMN_KEY),
  [END_TIME]: getColumn(END_TIME, TIME_COLUMN_KEY),
  [STATS_TOTAL]: getColumn(STATS_TOTAL, STATISTICS_COLUMN_KEY),
  [STATS_PASSED]: getColumn(STATS_PASSED, STATISTICS_COLUMN_KEY),
  [STATS_FAILED]: getColumn(STATS_FAILED, STATISTICS_COLUMN_KEY),
  [STATS_SKIPPED]: getColumn(STATS_SKIPPED, STATISTICS_COLUMN_KEY),
  [STATS_AB]: getColumn(STATS_AB, DEFECT_COLUMN_KEY),
  [STATS_PB]: getColumn(STATS_PB, DEFECT_COLUMN_KEY),
  [STATS_SI]: getColumn(STATS_SI, DEFECT_COLUMN_KEY),
  [STATS_TI]: getColumn(STATS_TI, DEFECT_COLUMN_KEY),
};

@injectIntl
export class LaunchesTable extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    formatMessage = props.intl.formatMessage;
    this.columns = this.getColumns();
  }

  getColumns = () => {
    const { widget } = this.props;
    const fieldsFromProps = widget.content_parameters.content_fields;

    return fieldsFromProps.reduce(
      (columns, item) => (COLUMNS_MAP[item] ? [...columns, COLUMNS_MAP[item]] : columns),
      [],
    );
  };

  render() {
    const { result } = this.props.widget.content;

    return <Grid columns={this.columns} data={result} />;
  }
}
