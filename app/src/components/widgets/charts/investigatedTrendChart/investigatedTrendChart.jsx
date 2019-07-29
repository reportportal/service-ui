/*
 * Copyright 2019 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import isEqual from 'fast-deep-equal';
import { Component } from 'react';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import {
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  NO_DEFECT,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';
import { Legend } from 'components/widgets/charts/common/legend';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { createFilterAction } from 'controllers/filter';
import { defectTypesSelector } from 'controllers/project';
import { ALL } from 'common/constants/reservedFilterIds';
import * as STATUSES from 'common/constants/testStatuses';
import styles from './investigatedTrendChart.scss';
import { C3Chart } from '../common/c3chart';
import { getTimelineConfig } from './timelineConfig';
import { getLaunchModeConfig } from './launchModeConfig';
import { getConfig as getStatusPageModeConfig } from '../common/XYChartStatusPageConfig';
import { MESSAGES } from '../common/constants';
import { getUpdatedFilterWithTime } from '../common/utils';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
    getDefectLink: defectLinkSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
    createFilterAction,
  },
)
export class InvestigatedTrendChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navigate: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    widget: PropTypes.object.isRequired,
    defectTypes: PropTypes.object.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    isPreview: PropTypes.bool,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object,
    height: PropTypes.number,
    onStatusPageMode: PropTypes.bool,
    interval: PropTypes.string,
    createFilterAction: PropTypes.func,
    integerValueType: PropTypes.bool,
  };

  static defaultProps = {
    navigate: () => {},
    getDefectLink: () => {},
    createFilterAction: () => {},
    isPreview: false,
    height: 0,
    observer: {},
    onStatusPageMode: false,
    interval: null,
    integerValueType: false,
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    this.props.observer.subscribe &&
      this.props.observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
    }
  }

  componentWillUnmount() {
    this.node && this.node.removeEventListener('mousemove', this.getCoords);
    this.props.observer.unsubscribe &&
      this.props.observer.unsubscribe('widgetResized', this.resizeChart);
    this.chart = null;
  }

  onChartClick = (data) =>
    this.isTimeline ? this.timeLineModeClickHandler(data) : this.launchModeClickHandler(data);

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;

    if (this.props.isPreview) {
      return;
    }

    this.node.addEventListener('mousemove', this.getCoords);
  };

  onLegendMouseOut = () => {
    this.chart.revert();
  };

  onLegendMouseOver = (id) => {
    this.chart.focus(id);
  };

  onLegendClick = (id) => {
    this.chart.toggle(id);
  };

  getDefectTypeLocators = (id) => {
    const { defectTypes } = this.props;
    const investigatedDefectType = [PRODUCT_BUG, AUTOMATION_BUG, SYSTEM_ISSUE, NO_DEFECT];
    const toInvestigateDefectType = [TO_INVESTIGATE];
    const defectType = id === 'toInvestigate' ? toInvestigateDefectType : investigatedDefectType;

    return defectType
      .reduce(
        (accumulator, currentValue) => accumulator.concat(defectTypes[currentValue.toUpperCase()]),
        [],
      )
      .map((item) => item.locator);
  };

  getDefaultLinkParams = (testItemIds) => ({
    payload: {
      projectId: this.props.projectId,
      filterId: ALL,
      testItemIds,
    },
    type: TEST_ITEM_PAGE,
  });

  getCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  getPosition = (d, width, height) => {
    const rect = this.node.getBoundingClientRect();
    const left = this.x - rect.left - width / 2;
    const top = this.y - rect.top - height;

    return {
      top: top - 8,
      left,
    };
  };

  getConfig = () => {
    const {
      widget,
      intl,
      isPreview,
      container,
      interval,
      onStatusPageMode,
      integerValueType,
    } = this.props;

    const params = {
      content: widget.content,
      isPreview,
      intl,
      positionCallback: this.getPosition,
      size: {
        height: container.offsetHeight,
        width: container.offsetWidth,
      },
      integerValueType,
    };

    this.size = params.size;

    // using property 'timeline' instead of 'viewMode' for API call
    this.isTimeline =
      widget.contentParameters &&
      widget.contentParameters.widgetOptions.timeline === MODES_VALUES[CHART_MODES.TIMELINE_MODE];

    if (onStatusPageMode) {
      this.config = getStatusPageModeConfig({
        ...params,
        interval,
        chartType: MODES_VALUES[CHART_MODES.BAR_VIEW],
        messages: MESSAGES,
      });
    } else if (this.isTimeline) {
      this.config = getTimelineConfig(params);
    } else {
      this.config = getLaunchModeConfig(params);
    }

    if (!onStatusPageMode) {
      this.config.data.onclick = this.onChartClick;
    }

    this.setState({
      isConfigReady: true,
    });
  };

  timeLineModeClickHandler = (data) => {
    const chartFilter = this.props.widget.appliedFilters[0];
    const arrResult = Object.keys(this.props.widget.content.result).map((item) => item);
    const itemDate = arrResult[data.index];
    const newFilter = getUpdatedFilterWithTime(chartFilter, itemDate);

    this.props.createFilterAction(newFilter);
  };

  launchModeClickHandler = (data) => {
    const { widget, getDefectLink, getStatisticsLink } = this.props;
    const id = widget.content.result[data.index].id;
    const defaultParams = this.getDefaultLinkParams(id);
    const defectTypeLocators = this.getDefectTypeLocators(data.id);

    const link = defectTypeLocators
      ? getDefectLink({ defects: defectTypeLocators, itemId: id })
      : getStatisticsLink({
          statuses: [STATUSES.PASSED, STATUSES.FAILED, STATUSES.SKIPPED, STATUSES.INTERRUPTED],
        });
    this.props.navigate(Object.assign(link, defaultParams));
  };

  resizeChart = () => {
    const newHeight = this.props.container.offsetHeight;
    const newWidth = this.props.container.offsetWidth;

    if (this.height !== newHeight || this.width !== newWidth) {
      this.chart.resize({
        height: newHeight,
        width: newWidth,
      });
      this.height = newHeight;
      this.width = newWidth;
      this.config.size.height = newHeight;
      this.config.size.width = newWidth;
    }
  };

  render() {
    return (
      this.state.isConfigReady && (
        <div className={cx('investigated-trend-chart', { 'timeline-mode': this.isTimeline })}>
          <C3Chart
            config={this.config}
            onChartCreated={this.onChartCreated}
            className={cx('widget-wrapper')}
          >
            {!this.props.isPreview &&
              !this.props.onStatusPageMode && (
                <Legend
                  items={this.config.data.groups[0]}
                  colors={this.config.data.colors}
                  messages={MESSAGES}
                  onClick={this.onLegendClick}
                  onMouseOver={this.onLegendMouseOver}
                  onMouseOut={this.onLegendMouseOut}
                />
              )}
          </C3Chart>
        </div>
      )
    );
  }
}
