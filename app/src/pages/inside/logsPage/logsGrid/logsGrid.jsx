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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { Grid } from 'components/main/grid';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { logsSizeSelector, noLogsCollapsingSelector } from 'controllers/user';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import { NoItemMessage } from 'components/main/noItemMessage';
import { DEFAULT_LOGS_SIZE } from 'common/constants/logsSettings';
import { FlexibleLogTime } from './flexibleLogTime';
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
const LOGS_GRID_EVENTS_INFO = {
  clickOnExpandAccordion: LOG_PAGE_EVENTS.EXPAND_LOG_MSG,
  getClickOnLoadMore: LOG_PAGE_EVENTS.getClickOnLoadMoreLogsEvent,
  clickOnLoadCurrentStep: LOG_PAGE_EVENTS.LOAD_CURRENT_STEP,
};

const MessageColumn = ({ className, value, customProps, ...rest }) => {
  const { consoleView: console, logsSize = DEFAULT_LOGS_SIZE } = customProps;

  return (
    <div
      className={cx(
        'message-column',
        `level-${value.level}`,
        `column-size-${logsSize}`,
        className,
        { console },
      )}
    >
      <LogMessageBlock value={value} customProps={customProps} {...rest} />
    </div>
  );
};
MessageColumn.propTypes = {
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object,
  value: PropTypes.object,
};
MessageColumn.defaultProps = {
  customProps: {},
  value: {},
};

const AttachmentColumn = ({ className, value, customProps }) => {
  const { mobile, consoleView: console, logsSize = DEFAULT_LOGS_SIZE } = customProps;

  return (
    <div
      className={cx('attachment-column', `column-size-${logsSize}`, className, { mobile, console })}
    >
      {value.binaryContent?.contentType && (
        <AttachmentBlock customProps={customProps} value={value.binaryContent} />
      )}
    </div>
  );
};
AttachmentColumn.propTypes = {
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object,
  value: PropTypes.object,
};
AttachmentColumn.defaultProps = {
  customProps: {},
  value: {},
};

const StatusColumn = ({ className, customProps }) => {
  const { logsSize = DEFAULT_LOGS_SIZE } = customProps;

  return <div className={cx(className, `column-size-${logsSize}`)} />;
};
StatusColumn.propTypes = {
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object,
};
StatusColumn.defaultProps = {
  customProps: {},
};

const TimeColumn = ({ className, value, customProps }) => {
  const { mobile, logsSize = DEFAULT_LOGS_SIZE } = customProps;

  return (
    <div className={cx('time-column', className, `column-size-${logsSize}`, { mobile })}>
      <FlexibleLogTime time={value.time} />
    </div>
  );
};
TimeColumn.propTypes = {
  className: PropTypes.string.isRequired,
  customProps: PropTypes.object,
  value: PropTypes.object,
};
TimeColumn.defaultProps = {
  customProps: {},
  value: {},
};

const LogMessageSearchCell = ({ className, rawStylesConfig, ...rest }) => (
  <div className={className} style={rawStylesConfig}>
    <LogMessageSearch {...rest} />
  </div>
);
LogMessageSearchCell.propTypes = {
  className: PropTypes.string,
  rawStylesConfig: PropTypes.object,
};
LogMessageSearchCell.defaultProps = {
  className: '',
  rawStylesConfig: {},
};
const LogStatusCell = ({ className, rawStylesConfig, ...props }) => (
  <div className={className} style={rawStylesConfig}>
    <LogStatusBlock {...props} />
  </div>
);
LogStatusCell.propTypes = {
  className: PropTypes.string,
  rawStylesConfig: PropTypes.object,
};
LogStatusCell.defaultProps = {
  className: '',
  rawStylesConfig: {},
};

@connect((state) => ({
  noLogsCollapsing: noLogsCollapsingSelector(state),
  logsSize: logsSizeSelector(state),
}))
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
    rowHighlightingConfig: PropTypes.shape({
      isGridRowHighlighted: PropTypes.bool,
      highlightedRowId: PropTypes.number,
      highlightErrorRow: PropTypes.bool,
    }),
    rawHeaderCellStylesConfig: PropTypes.object,
    noLogsCollapsing: PropTypes.bool,
    loadNext: PropTypes.func,
    loadPrevious: PropTypes.func,
    loadingDirection: PropTypes.string,
    logsSize: PropTypes.string,
    onJumpToLog: PropTypes.func,
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
    rowHighlightingConfig: {},
    rawHeaderCellStylesConfig: {},
    noLogsCollapsing: false,
    loadingDirection: null,
    logsSize: DEFAULT_LOGS_SIZE,
    onJumpToLog: null,
  };

  getConsoleViewColumns = () => {
    const { logsSize, onJumpToLog } = this.props;
    return [
      {
        id: 'attachment',
        component: AttachmentColumn,
        customProps: {
          consoleView: true,
          rawHeaderCellStylesConfig: this.props.rawHeaderCellStylesConfig,
          logsSize,
          gridHeaderCellStyles: cx('header', `column-size-${logsSize}`),
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
          rawHeaderCellStylesConfig: this.props.rawHeaderCellStylesConfig,
          logsSize,
          gridHeaderCellStyles: cx('header', `column-size-${logsSize}`),
          onJumpToLog,
        },
        component: MessageColumn,
      },
      {
        id: 'mobileTime',
        component: TimeColumn,
        customProps: {
          mobile: true,
          rawHeaderCellStylesConfig: this.props.rawHeaderCellStylesConfig,
          logsSize,
          gridHeaderCellStyles: cx('header', 'mobile', `column-size-${logsSize}`),
        },
      },
    ];
  };

  getDefaultViewColumns = () => {
    const { isNestedStepView, rawHeaderCellStylesConfig, logsSize, onJumpToLog } = this.props;
    const statusColumn = {
      id: STATUS_COLUMN_ID,
      title: {
        full: this.props.intl.formatMessage(messages.statusColumnTitle),
        component: LogStatusCell,
        componentProps: {
          logStatus: this.props.logStatus,
          onChangeLogStatusFilter: this.props.onChangeLogStatusFilter,
          rawStylesConfig: rawHeaderCellStylesConfig,
        },
      },
      sortable: true,
      component: StatusColumn,
      customProps: {
        logsSize,
        gridHeaderCellStyles: cx('header', `column-size-${logsSize}`),
      },
    };
    const columns = [
      {
        id: 'logMessage',
        title: {
          component: LogMessageSearchCell,
          componentProps: {
            filter: this.props.filter,
            onFilterChange: this.props.onFilterChange,
            rawStylesConfig: rawHeaderCellStylesConfig,
          },
        },
        sortable: true,
        maxHeight: 200,
        component: MessageColumn,
        customProps: {
          markdownMode: this.props.markdownMode,
          logsSize,
          gridHeaderCellStyles: cx('header', `column-size-${logsSize}`),
          onJumpToLog,
        },
      },
      {
        id: 'attachment',
        component: AttachmentColumn,
        customProps: {
          rawHeaderCellStylesConfig,
          logsSize,
          gridHeaderCellStyles: cx('header', `column-size-${logsSize}`),
        },
      },
      {
        id: TIME_COLUMN_ID,
        title: {
          full: this.props.intl.formatMessage(messages.timeColumnTitle),
        },
        sortable: true,
        component: TimeColumn,
        sortingEventInfo: LOG_PAGE_EVENTS.TIME_SORTING,
        customProps: {
          rawHeaderCellStylesConfig,
          logsSize,
          gridHeaderCellStyles: cx('header', `column-size-${logsSize}`),
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

  getLogRowClasses = () => {
    const { consoleView } = this.props;

    return {
      log: true,
      'row-console': consoleView,
    };
  };

  renderConsoleViewHeader = (cellProps) => {
    const { className, style: cellClassName } = cellProps;
    const {
      intl,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      filter,
      onFilterChange,
    } = this.props;

    return (
      <div className={className} style={cellClassName}>
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
      </div>
    );
  };

  renderNestedStepHeader = (props) => (
    <NestedStepHeader
      {...props}
      markdownMode={this.props.markdownMode}
      logsSize={this.props.logsSize}
    />
  );

  render() {
    const {
      intl,
      noLogsCollapsing,
      logItems,
      loading,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      rowHighlightingConfig,
      loadNext,
      loadPrevious,
      loadingDirection,
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
          nestedStepHeader={this.renderNestedStepHeader}
          rowHighlightingConfig={rowHighlightingConfig}
          nestedView
          eventsInfo={LOGS_GRID_EVENTS_INFO}
          expanded={noLogsCollapsing}
          loadNext={loadNext}
          loadPrevious={loadPrevious}
          loadingDirection={loadingDirection}
        />
        {!logItems.length && !loading && (
          <NoItemMessage message={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
        )}
      </div>
    );
  }
}
