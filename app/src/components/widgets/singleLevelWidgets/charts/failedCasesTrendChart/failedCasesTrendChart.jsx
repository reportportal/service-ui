import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { STATS_FAILED } from 'common/constants/statistics';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { getConfig } from './config/getConfig';
import styles from './failedCasesTrendChart.scss';

const cx = classNames.bind(styles);

@injectIntl
export class FailedCasesTrendChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
  };

  configData = {
    getConfig,
    formatMessage: this.props.intl.formatMessage,
  };

  legendConfig = {
    showLegend: true,
    legendProps: {
      items: [STATS_FAILED],
      disabled: true,
    },
  };

  render() {
    return (
      <div className={cx('failed-cases-trend-chart')}>
        <ChartContainer
          {...getChartDefaultProps(this.props)}
          configData={this.configData}
          legendConfig={this.legendConfig}
        />
      </div>
    );
  }
}
