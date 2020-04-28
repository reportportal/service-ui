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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { Grid } from 'components/main/grid';
import { dateFormat } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { ERROR, FATAL } from 'common/constants/logLevels';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import { NoItemMessage } from 'components/main/noItemMessage';
import { LogMessageSearch } from './logMessageSearch';
import { LogMessageBlock } from './logMessageBlock';
import { AttachmentBlock } from './attachmentBlock';
import { NestedStepHeader } from './nestedStepHeader';
import { LogStatusBlock } from './logStatusBlock';
import styles from './logsGrid.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  timeColumnTitle: {
    id: 'LogsGrid.timeColumnTitle',
    defaultMessage: 'Time',
  },
  statusColumnTitle: {
    id: 'LogsGrid.statusColumnTitle',
    defaultMessage: 'Status',
  },
  noResults: {
    id: 'LogsGrid.noResults',
    defaultMessage: 'No results found',
  },
});
const TIME_COLUMN_ID = 'logTime';
const STATUS_COLUMN_ID = 'status';

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
    {value.binaryContent && value.binaryContent.contentType && (
      <AttachmentBlock customProps={customProps} value={value.binaryContent} />
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

const LogMessageSearchCell = ({ className, ...rest }) => (
  <div className={className}>
    <LogMessageSearch {...rest} />
  </div>
);
LogMessageSearchCell.propTypes = {
  className: PropTypes.string,
};
LogMessageSearchCell.defaultProps = {
  className: '',
};

@injectIntl
export class LogsGrid extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    logItems: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
    filter: PropTypes.string,
    onFilterChange: PropTypes.func,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    consoleView: PropTypes.bool,
    markdownMode: PropTypes.bool,
    logStatus: PropTypes.string,
    onChangeLogStatusFilter: PropTypes.func,
    isNestedStepView: PropTypes.bool,
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
    markdownMode: false,
    logStatus: null,
    onChangeLogStatusFilter: () => {},
    isNestedStepView: false,
  };

  getConsoleViewColumns = () => [
    {
      id: 'attachment',
      component: AttachmentColumn,
      customProps: {
        consoleView: true,
      },
    },
    {
      id: TIME_COLUMN_ID,
      sortable: true,
      title: {
        component: this.renderConsoleViewHeader,
      },
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
      title: {
        component: () => <div className={cx('no-header')} />,
      },
      customProps: {
        mobile: true,
      },
    },
  ];

  getDefaultViewColumns = () => {
    const { isNestedStepView } = this.props;
    const statusColumn = {
      id: STATUS_COLUMN_ID,
      title: {
        full: this.props.intl.formatMessage(messages.statusColumnTitle),
        component: LogStatusBlock,
        componentProps: {
          logStatus: this.props.logStatus,
          onChangeLogStatusFilter: this.props.onChangeLogStatusFilter,
        },
      },
      sortable: true,
      component: () => <div />,
    };
    const columns = [
      {
        id: 'logMessage',
        title: {
          component: LogMessageSearchCell,
          componentProps: {
            filter: this.props.filter,
            onFilterChange: this.props.onFilterChange,
          },
        },
        sortable: true,
        maxHeight: 200,
        component: MessageColumn,
        customProps: {
          markdownMode: this.props.markdownMode,
        },
      },
      {
        id: 'attachment',
        component: AttachmentColumn,
      },
      {
        id: TIME_COLUMN_ID,
        title: {
          full: this.props.intl.formatMessage(messages.timeColumnTitle),
        },
        sortable: true,
        component: TimeColumn,
        sortingEventInfo: LOG_PAGE_EVENTS.TIME_SORTING,
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
    if (isNestedStepView) {
      columns.splice(2, 0, statusColumn);
    }
    return columns;
  };

  getColumns = () =>
    this.props.consoleView ? this.getConsoleViewColumns() : this.getDefaultViewColumns();

  getLogRowClasses = (value) => {
    const { consoleView } = this.props;

    return {
      log: true,
      'error-row': !consoleView && (value.level === ERROR || value.level === FATAL),
      'row-console': consoleView,
    };
  };

  renderConsoleViewHeader = () => {
    const {
      intl,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      filter,
      onFilterChange,
    } = this.props;

    return (
      <div className={cx('console-view-header')}>
        <div
          className={cx('time-header', {
            [`sorting-${sortingDirection.toLowerCase()}`]: sortingDirection,
            'sorting-active': sortingColumn === TIME_COLUMN_ID,
          })}
          onClick={() => onChangeSorting(TIME_COLUMN_ID)}
        >
          {intl.formatMessage(messages.timeColumnTitle)}
          <div className={cx('arrow')}>{Parser(ArrowIcon)}</div>
        </div>
        <LogMessageSearch filter={filter} onFilterChange={onFilterChange} />
      </div>
    );
  };

  renderNestedStepHeader = (props) => (
    <NestedStepHeader {...props} markdownMode={this.props.markdownMode} />
  );

  render() {
    const {
      intl,
      logItems,
      loading,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
    } = this.props;

    return (
      <div className={cx('logs-grid')}>
        <Grid
          columns={this.getColumns()}
          data={logItems}
          rowClassMapper={this.getLogRowClasses}
          changeOnlyMobileLayout
          loading={loading}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          toggleAccordionEventInfo={LOG_PAGE_EVENTS.EXPAND_LOG_MSG}
          nestedStepHeader={this.renderNestedStepHeader}
          nestedView
        />
        {!logItems.length && !loading && (
          <NoItemMessage message={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
        )}
      </div>
    );
  }
}
