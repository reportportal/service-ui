import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Grid } from 'components/main/grid';
import { ItemInfo } from 'pages/inside/common/itemInfo';
import { AbsRelTime } from 'components/main/absRelTime';
import { formatMethodType, formatStatus } from 'common/utils/localizationUtils';
import { FAILED } from 'common/constants/testStatuses';
import { PredefinedFilterSwitcher } from './predefinedFilterSwitcher';
import { DefectType } from './defectType';
import { GroupHeader } from './groupHeader';
import styles from './stepGrid.scss';

const cx = classNames.bind(styles);

const MethodTypeColumn = ({ className, value, customProps: { formatMessage } }) => (
  <div className={cx('method-type-col', className)}>
    {formatMethodType(formatMessage, value.type)}
  </div>
);
MethodTypeColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};
MethodTypeColumn.defaultProps = {
  className: null,
  value: {},
};

const NameColumn = ({ className, ...rest }) => (
  <div className={cx('name-col', className)}>
    <ItemInfo {...rest} />
  </div>
);
NameColumn.propTypes = {
  className: PropTypes.string,
};
NameColumn.defaultProps = {
  className: null,
};

const StatusColumn = ({ className, value, customProps: { formatMessage } }) => (
  <div className={cx('status-col', className)}>{formatStatus(formatMessage, value.status)}</div>
);
StatusColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};
StatusColumn.defaultProps = {
  className: null,
  value: {},
};

const StartTimeColumn = ({ className, value }) => (
  <div className={cx('start-time-col', className)}>
    <AbsRelTime startTime={value.start_time} />
  </div>
);
StartTimeColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
};
StartTimeColumn.defaultProps = {
  className: null,
  value: {},
};

const DefectTypeColumn = ({ className, value }) => (
  <div className={cx('defect-type-col', className)}>
    {value.issue && <DefectType issue={value.issue} />}
  </div>
);
DefectTypeColumn.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object,
};
DefectTypeColumn.defaultProps = {
  className: null,
  value: {},
};

const PredefinedFilterSwitcherCell = ({ className }) => (
  <div className={cx('filter-switcher-col', className)}>
    <PredefinedFilterSwitcher />
  </div>
);
PredefinedFilterSwitcherCell.propTypes = {
  className: PropTypes.string,
};
PredefinedFilterSwitcherCell.defaultProps = {
  className: null,
};

@injectIntl
export class StepGrid extends Component {
  static propTypes = {
    data: PropTypes.array,
    intl: PropTypes.object.isRequired,
    selectedItems: PropTypes.array,
    onItemSelect: PropTypes.func,
    onAllItemsSelect: PropTypes.func,
    loading: PropTypes.bool,
    listView: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
    selectedItems: [],
    onItemSelect: () => {},
    onAllItemsSelect: () => {},
    loading: false,
    listView: false,
  };

  constructor(props) {
    super(props);
    this.columns = [
      {
        id: 'predefinedFilterSwitcher',
        title: {
          component: PredefinedFilterSwitcherCell,
        },
        formatter: () => {},
      },
      {
        id: 'methodType',
        title: {
          full: 'method type',
        },
        sortable: true,
        component: MethodTypeColumn,
        customProps: {
          formatMessage: this.props.intl.formatMessage,
        },
      },
      {
        id: 'name',
        title: {
          full: 'name',
        },
        sortable: true,
        component: NameColumn,
        maxHeight: 170,
      },
      {
        id: 'status',
        title: {
          full: 'status',
        },
        sortable: true,
        component: StatusColumn,
        customProps: {
          formatMessage: this.props.intl.formatMessage,
        },
      },
      {
        id: 'startTime',
        title: {
          full: 'start time',
        },
        sortable: true,
        component: StartTimeColumn,
      },
      {
        id: 'defectType',
        title: {
          full: 'defect type',
        },
        sortable: true,
        component: DefectTypeColumn,
      },
    ];
  }

  highlightFailedItems = (value) => ({
    [cx('failed')]: value.status === FAILED,
  });

  groupStepItems = () =>
    this.props.data.reduce((groups, step) => {
      const group = groups[step.parent] || [];
      return {
        ...groups,
        [step.parent]: [...group, step],
      };
    }, {});

  render() {
    const { data, onItemSelect, onAllItemsSelect, selectedItems, loading, listView } = this.props;
    return (
      <Grid
        columns={this.columns}
        data={data}
        onToggleSelection={onItemSelect}
        onToggleSelectAll={onAllItemsSelect}
        selectedItems={selectedItems}
        selectable
        rowClassMapper={this.highlightFailedItems}
        loading={loading}
        groupHeader={GroupHeader}
        groupFunction={this.groupStepItems}
        grouped={listView}
      />
    );
  }
}
