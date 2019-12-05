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
import { injectIntl } from 'react-intl';
import * as d3 from 'd3-selection';
import classNames from 'classnames/bind';
import { STATS_PASSED } from 'common/constants/statistics';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { getConfig, NOT_PASSED_STATISTICS_KEY } from './config/getConfig';
import styles from './passingRateChart.scss';

const cx = classNames.bind(styles);

@injectIntl
export class PassingRateChart extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    observer: PropTypes.object,
    filterNameTitle: PropTypes.object,
    filterName: PropTypes.string,
    onChartClick: PropTypes.func,
  };

  static defaultProps = {
    isPreview: false,
    observer: {},
    filterNameTitle: {},
    filterName: '',
    onChartClick: () => {},
  };

  onChartCreated = (node) => {
    this.node = node;
    this.resizeHelper();
  };

  getConfigData = () => {
    const {
      intl: { formatMessage },
      widget: { contentParameters },
      onChartClick,
    } = this.props;

    return {
      formatMessage,
      getConfig,
      onChartClick,
      viewMode: contentParameters.widgetOptions.viewMode,
      onRendered: this.resizeHelper,
    };
  };

  getCustomBlock = () => {
    const {
      intl: { formatMessage },
      filterNameTitle,
      filterName,
    } = this.props;

    return (
      <div className={cx('filter-info-block')}>
        <span className={cx('filter-name-title')}>{formatMessage(filterNameTitle)}</span>
        <span className={cx('filter-name')}>{filterName}</span>
      </div>
    );
  };

  resizeHelper = () => {
    if (!this.node || this.props.isPreview) {
      return;
    }
    const nodeElement = this.node;

    // eslint-disable-next-line func-names
    d3.selectAll(nodeElement.querySelectorAll('.bar .c3-chart-texts .c3-text')).each(function(d) {
      const selector = `c3-target-${d.id}`;
      const barBox = d3
        .selectAll(nodeElement.getElementsByClassName(selector))
        .node()
        .getBBox();
      const textElement = d3.select(this).node();
      const textBox = textElement.getBBox();
      let x = barBox.x + barBox.width / 2 - textBox.width / 2;
      if (d.id === STATS_PASSED && x < 5) x = 5;
      if (d.id === NOT_PASSED_STATISTICS_KEY && x + textBox.width > barBox.x + barBox.width)
        x = barBox.x + barBox.width - textBox.width - 5;
      textElement.setAttribute('x', `${x}`);
    });
  };

  render() {
    const { widget } = this.props;
    const viewMode = widget.contentParameters.widgetOptions.viewMode;
    const legendConfig = {
      showLegend: true,
      legendProps: {
        items: [STATS_PASSED, NOT_PASSED_STATISTICS_KEY],
        clickable: false,
        customBlock: this.getCustomBlock(),
      },
    };

    return (
      <ChartContainer
        {...getChartDefaultProps(this.props)}
        className={`${cx('passing-rate-chart')} ${viewMode}`}
        legendConfig={legendConfig}
        configData={this.getConfigData()}
        chartCreatedCallback={this.onChartCreated}
      />
    );
  }
}
