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
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defectColorsSelector } from 'controllers/project';
import { DefectTypeTooltip } from 'pages/inside/common/defectTypeTooltip';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { TO_INVESTIGATE } from 'common/constants/defectTypes';
import { DefectLink } from 'pages/inside/common/defectLink';
import styles from './donutChart.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: DefectTypeTooltip,
  data: {
    width: 235,
    placement: 'bottom-end',
    noArrow: true,
    desktopOnly: true,
    modifiers: {
      flip: { enabled: true },
      preventOverflow: { enabled: false },
      hide: { enabled: false },
    },
  },
})
@connect((state) => ({
  defectColors: defectColorsSelector(state),
}))
export class DonutChart extends Component {
  static propTypes = {
    type: PropTypes.string,
    defects: PropTypes.array,
    data: PropTypes.object.isRequired,
    viewBox: PropTypes.number.isRequired,
    strokeWidth: PropTypes.number.isRequired,
    defectColors: PropTypes.object.isRequired,
    itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    eventInfo: PropTypes.object,
    target: PropTypes.string,
    listViewLinkParams: PropTypes.shape({
      launchesLimit: PropTypes.number,
      compositeAttribute: PropTypes.string,
      isLatest: PropTypes.bool,
      filterType: PropTypes.bool,
    }),
    ownLinkParams: PropTypes.shape({
      isOtherPage: PropTypes.bool,
      payload: PropTypes.object,
      page: PropTypes.string,
    }),
  };
  static defaultProps = {
    itemId: null,
    type: '',
    defects: [],
    target: '',
    listViewLinkParams: {},
    eventInfo: {},
    ownLinkParams: {},
  };

  getChartData = () => {
    const defects = this.props.data;
    const chartData = [];
    let offset = 75;

    Object.keys(this.props.data).forEach((defect) => {
      if (defect !== 'total') {
        const val = defects[defect];
        const percents = (val / defects.total) * 100;

        chartData.push({
          id: defect,
          value: percents,
          color: this.props.defectColors[defect],
          offset: 100 - offset,
        });
        offset += percents;
      }
    });
    return chartData;
  };

  chartData = [];

  render() {
    const {
      data,
      type,
      defects,
      viewBox,
      strokeWidth,
      itemId,
      defectColors,
      eventInfo,
      target,
      listViewLinkParams,
      ownLinkParams,
    } = this.props;
    const diameter = viewBox / 2;
    const r = 100 / (2 * Math.PI);

    if (defectColors) {
      this.chartData = this.getChartData();
    }

    return (
      <DefectLink
        defects={defects}
        itemId={itemId}
        eventInfo={eventInfo}
        target={target}
        listViewLinkParams={listViewLinkParams}
        ownLinkParams={ownLinkParams}
      >
        <div className={cx('chart-container')}>
          <svg width="100%" height="100%" viewBox={`0 0 ${viewBox} ${viewBox}`} className="donut">
            <circle cx={diameter} cy={diameter} r={r} fill="transparent" />
            <circle
              cx={diameter}
              cy={diameter}
              r={r}
              fill="transparent"
              stroke="#d2d3d4"
              strokeWidth={strokeWidth}
            />
            {this.chartData.map((item) => (
              <circle
                key={item.id}
                cx={diameter}
                cy={diameter}
                r={r}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${item.value} ${100 - item.value}`}
                strokeDashoffset={item.offset}
              />
            ))}
          </svg>
        </div>
        <div
          className={cx('total', { 'total-to-investigate': type === TO_INVESTIGATE })}
          style={{ borderColor: this.props.defectColors[type] }}
        >
          {data.total}
        </div>
      </DefectLink>
    );
  }
}
