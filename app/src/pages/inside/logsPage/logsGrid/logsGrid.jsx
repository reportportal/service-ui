import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { Grid } from 'components/main/grid';
import { dateFormat } from 'common/utils';
import { ERROR, FATAL } from 'common/constants/logLevels';
import { LogMessageSearch } from './logMessageSearch';
import { LogMessageBlock } from './logMessageBlock';
import { AttachmentBlock } from './attachmentBlock';
import ArrowIcon from './img/arrow-down-inline.svg';
import styles from './logsGrid.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  timeColumnTitle: {
    id: 'LogsGrid.timeColumnTitle',
    defaultMessage: 'Time',
  },
});
const timeColumnId = 'time';

const MessageColumn = ({ className, value, ...rest }) => (
  <div
    className={cx('message-column', `level-${value.level}`, className, {
      console: rest.customProps.consoleView,
    })}
  >
    <LogMessageBlock value={value} {...rest} />
  </div>
);
MessageColumn.propTypes = {
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object,
  value: PropTypes.object,
};
MessageColumn.defaultProps = {
  customProps: {},
  value: {},
};

const AttachmentColumn = ({ className, value, customProps }) => (
  <div
    className={cx('attachment-column', className, {
      mobile: customProps.mobile,
      console: customProps.consoleView,
    })}
  >
    {value.binary_content && (
      <AttachmentBlock customProps={customProps} value={value.binary_content} />
    )}
  </div>
);
AttachmentColumn.propTypes = {
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object,
  value: PropTypes.object,
};
AttachmentColumn.defaultProps = {
  customProps: {},
  value: {},
};

const TimeColumn = ({ className, value, customProps: { mobile } }) => (
  <div className={cx('time-column', className, { mobile })}>{dateFormat(value.time)}</div>
);
TimeColumn.propTypes = {
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object,
  value: PropTypes.object,
};
TimeColumn.defaultProps = {
  customProps: {},
  value: {},
};

@injectIntl
export class LogsGrid extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    logItems: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
    filter: PropTypes.string,
    onFilterChange: PropTypes.func,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    consoleView: PropTypes.bool,
  };

  static defaultProps = {
    logItems: [],
    loading: false,
    filter: '',
    onFilterChange: () => {},
    sortingColumn: '',
    sortingDirection: '',
    onChangeSorting: () => {},
    consoleView: false,
  };

  getColumns = () =>
    this.props.consoleView
      ? [
          {
            id: 'attachment',
            component: AttachmentColumn,
            customProps: {
              consoleView: true,
            },
          },
          {
            id: timeColumnId,
            sortable: true,
            customProps: {
              consoleView: true,
            },
            component: MessageColumn,
          },
          {
            id: 'mobileTime',
            component: TimeColumn,
            customProps: {
              mobile: true,
            },
          },
          {
            id: 'mobileAttachment',
            component: AttachmentColumn,
            customProps: {
              mobile: true,
            },
          },
        ]
      : [
          {
            id: 'logMessage',
            title: {
              component: LogMessageSearch,
              componentProps: {
                filter: this.props.filter,
                onFilterChange: this.props.onFilterChange,
              },
            },
            maxHeight: 200,
            component: MessageColumn,
          },
          {
            id: 'attachment',
            component: AttachmentColumn,
          },
          {
            id: timeColumnId,
            title: {
              full: this.props.intl.formatMessage(messages.timeColumnTitle),
            },
            sortable: true,
            component: TimeColumn,
          },
          {
            id: 'mobileAttachment',
            title: {
              component: () => <div className={cx('no-header')} />,
            },
            component: AttachmentColumn,
            customProps: {
              mobile: true,
            },
          },
        ];

  getLogRowClasses = (value) => {
    const { consoleView } = this.props;

    return {
      log: true,
      'error-row': !consoleView && (value.level === ERROR || value.level === FATAL),
      [cx('row-console')]: consoleView,
      [cx('error-row-console')]: consoleView && (value.level === ERROR || value.level === FATAL),
    };
  };

  render() {
    const {
      intl,
      logItems,
      loading,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      consoleView,
      filter,
      onFilterChange,
    } = this.props;

    return (
      <div className={cx('logs-grid')}>
        {consoleView && (
          <div className={cx('console-view-header')}>
            <div
              className={cx('time-header', {
                [`sorting-${sortingDirection.toLowerCase()}`]: sortingDirection,
                'sorting-active': sortingColumn === timeColumnId,
              })}
              onClick={() => onChangeSorting(timeColumnId)}
            >
              {intl.formatMessage(messages.timeColumnTitle)}
              <div className={cx('arrow')}>{Parser(ArrowIcon)}</div>
            </div>
            <LogMessageSearch filter={filter} onFilterChange={onFilterChange} />
          </div>
        )}
        <Grid
          columns={this.getColumns()}
          data={logItems}
          rowClassMapper={this.getLogRowClasses}
          changeOnlyMobileLayout
          loading={loading}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
        />
      </div>
    );
  }
}
