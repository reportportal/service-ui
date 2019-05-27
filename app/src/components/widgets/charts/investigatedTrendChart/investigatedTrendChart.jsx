/*
 * Copyright 2017 EPAM Systems
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
import moment from 'moment/moment';
import { Component } from 'react';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { Legend } from 'components/widgets/charts/common/legend/legend';
import { statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { createFilterAction } from 'controllers/filter';
import { ALL } from 'common/constants/reservedFilterIds';
import * as STATUSES from 'common/constants/testStatuses';
import { ENTITY_START_TIME, CONDITION_BETWEEN } from 'components/filterEntities/constants';
import styles from './investigatedTrendChart.scss';
import { C3Chart } from '../common/c3chart';
import { getTimelineConfig } from './timelineConfig';
import { getLaunchModeConfig } from './launchModeConfig';
import { getStatusPageModeConfig } from './statusPageModeConfig';
import { MESSAGES } from './common/constants';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    statisticsLink: statisticsLinkSelector(state, {
      statuses: [STATUSES.PASSED, STATUSES.FAILED, STATUSES.SKIPPED, STATUSES.INTERRUPTED],
    }),
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
    statisticsLink: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object,
    height: PropTypes.number,
    onStatusPageMode: PropTypes.bool,
    interval: PropTypes.string,
    createFilterAction: PropTypes.func,
  };

  static defaultProps = {
    navigate: () => {},
    createFilterAction: () => {},
    isPreview: false,
    height: 0,
    observer: {},
    onStatusPageMode: false,
    interval: null,
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    this.props.observer.subscribe &&
      this.props.observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentWillUnmount() {
    this.node && this.node.removeEventListener('mousemove', this.getCoords);
    this.props.observer.unsubscribe &&
      this.props.observer.unsubscribe('widgetResized', this.resizeChart);
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
    const { widget, intl, isPreview, container, interval } = this.props;
    const params = {
      content: widget.content,
      isPreview,
      intl,
      positionCallback: this.getPosition,
      size: {
        height: container.offsetHeight,
        width: container.offsetWidth,
      },
    };

    this.size = params.size;

    // using property 'timeline' instead of 'viewMode' for API call
    this.isTimeline =
      widget.contentParameters &&
      widget.contentParameters.widgetOptions.timeline === MODES_VALUES[CHART_MODES.TIMELINE_MODE];

    if (this.props.onStatusPageMode) {
      this.config = getStatusPageModeConfig({ ...params, interval });
    } else if (this.isTimeline) {
      this.config = getTimelineConfig(params);
    } else {
      this.config = getLaunchModeConfig(params);
    }
    this.config.data.onclick = this.onChartClick;

    this.setState({
      isConfigReady: true,
    });
  };

  timeLineModeClickHandler = (data) => {
    const { widget } = this.props;

    const arrResult = Object.keys(widget.content.result).map((item) => item);
    const itemDate = arrResult[data.index];
    const range = 86400000;
    const time = moment(itemDate).valueOf();
    const filterEntityValue = `${time},${time + range}`;
    const chartFilter = this.props.widget.appliedFilters[0];
    const newCondition = {
      filteringField: ENTITY_START_TIME,
      value: filterEntityValue,
      condition: CONDITION_BETWEEN,
    };
    const newFilter = {
      orders: chartFilter.orders,
      type: chartFilter.type,
      conditions: chartFilter.conditions.concat(newCondition),
    };
    this.props.createFilterAction(newFilter);
  };

  launchModeClickHandler = (data) => {
    const { widget, statisticsLink } = this.props;
    const id = widget.content.result[data.index].id;
    const defaultParams = this.getDefaultLinkParams(id);

    this.props.navigate(Object.assign(statisticsLink, defaultParams));
  };

  resizeChart = () => {
    const newHeight = this.props.container.offsetHeight;
    const newWidth = this.props.container.offsetWidth;

    if (this.height !== newHeight) {
      this.chart.resize({
        height: newHeight,
        width: newWidth,
      });
      this.height = newHeight;
    } else if (this.width !== newWidth) {
      this.chart.flush();
      this.width = newWidth;
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
