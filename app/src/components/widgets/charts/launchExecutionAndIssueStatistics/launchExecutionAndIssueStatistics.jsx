import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { LaunchExecutionChart } from './launchExecutionChart';
import { IssueStatisticsChart } from './issueStatisticsChart';
import styles from './launchExecutionAndIssueStatistics.scss';

const cx = classNames.bind(styles);

@injectIntl
export class LaunchExecutionAndIssueStatistics extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    observer: PropTypes.object,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
    isOnStatusPageMode: PropTypes.bool,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {
      subscribe: () => {},
      unsubscribe: () => {},
    },
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
    isOnStatusPageMode: false,
  };

  render() {
    const {
      widget,
      container,
      observer,
      isPreview,
      uncheckedLegendItems,
      onChangeLegend,
      isOnStatusPageMode,
    } = this.props;

    return (
      <div className={cx('launch-execution-and-issues-chart')}>
        <LaunchExecutionChart
          widget={widget}
          container={container}
          observer={observer}
          isPreview={isPreview}
          uncheckedLegendItems={uncheckedLegendItems}
          onChangeLegend={onChangeLegend}
          isOnStatusPageMode={isOnStatusPageMode}
        />
        <IssueStatisticsChart
          widget={widget}
          container={container}
          observer={observer}
          isPreview={isPreview}
          uncheckedLegendItems={uncheckedLegendItems}
          onChangeLegend={onChangeLegend}
          isOnStatusPageMode={isOnStatusPageMode}
        />
      </div>
    );
  }
}
