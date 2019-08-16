import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import * as d3 from 'd3-selection';
import isEqual from 'fast-deep-equal';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { defectTypesSelector } from 'controllers/project';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { getDefectTypeLocators, getItemNameConfig } from '../../../common/utils';
import { C3Chart } from '../../../common/c3chart';
import { Legend } from '../../../common/legend';
import { getConfig } from './config/getConfig';
import styles from './launchesComparisonChart.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
    getDefectLink: defectLinkSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class LaunchesComparisonChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navigate: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    project: PropTypes.string.isRequired,
    defectTypes: PropTypes.object.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    !this.props.isPreview && this.props.observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
    }
  }

  componentWillUnmount() {
    if (!this.props.isPreview) {
      this.node.removeEventListener('mousemove', this.setupCoords);
      this.props.observer.unsubscribe('widgetResized', this.resizeChart);
    }
    this.chart = null;
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;

    if (!this.props.widget.content.result || this.props.isPreview) {
      return;
    }

    this.props.uncheckedLegendItems.forEach((id) => {
      this.chart.toggle(id);
    });

    this.node.addEventListener('mousemove', this.setupCoords);

    // eslint-disable-next-line func-names
    d3.selectAll(document.querySelectorAll('.c3-chart-bar path')).each(function() {
      const elem = d3.select(this);
      if (elem.datum().value === 0) {
        elem.style('stroke-width', '3px');
      }
    });
  };

  onMouseOut = () => {
    this.chart.revert();
  };

  onMouseOver = (id) => {
    this.chart.focus(id);
  };

  onClickLegendItem = (id) => {
    this.props.onChangeLegend(id);
    this.chart.toggle(id);
  };

  onChartClick = (data) => {
    const { widget, getDefectLink, getStatisticsLink, defectTypes } = this.props;

    const nameConfig = getItemNameConfig(data.id);
    const id = widget.content.result[data.index].id;
    const defaultParams = this.getDefaultLinkParams(id);
    const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);

    const link = defectLocators
      ? getDefectLink({ defects: defectLocators, itemId: id })
      : getStatisticsLink({ statuses: [nameConfig.defectType.toUpperCase()] });
    this.props.navigate(Object.assign(link, defaultParams));
  };

  getDefaultLinkParams = (testItemIds) => ({
    payload: {
      projectId: this.props.project,
      filterId: 'all',
      testItemIds,
    },
    type: TEST_ITEM_PAGE,
  });

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
      intl: { formatMessage },
      widget: { content, contentParameters },
      isPreview,
      container,
      defectTypes,
    } = this.props;

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    const params = {
      content,
      contentParameters,
      isPreview,
      formatMessage,
      positionCallback: this.getPosition,
      size: {
        height: this.height,
      },
      defectTypes,
    };

    const configurationData = getConfig(params);

    this.config = configurationData.config;
    this.itemNames = configurationData.itemNames;

    if (!isPreview) {
      this.config.data.onclick = this.onChartClick;
    }

    this.setState({
      isConfigReady: true,
    });
  };

  setupCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  resizeChart = () => {
    const newHeight = this.props.container.offsetHeight;
    const newWidth = this.props.container.offsetWidth;

    if (this.height !== newHeight) {
      this.chart.resize({
        height: newHeight,
      });
      this.height = newHeight;
      this.config.size.height = newHeight;
    } else if (this.width !== newWidth) {
      this.chart.flush();
    }
    this.width = newWidth;
  };

  render() {
    return (
      this.state.isConfigReady && (
        <div className={cx('launches-comparison-chart')}>
          <C3Chart config={this.config} onChartCreated={this.onChartCreated}>
            {!this.props.isPreview && (
              <Legend
                items={this.itemNames}
                uncheckedLegendItems={this.props.uncheckedLegendItems}
                noTotal
                onClick={this.onClickLegendItem}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
              />
            )}
          </C3Chart>
        </div>
      )
    );
  }
}
