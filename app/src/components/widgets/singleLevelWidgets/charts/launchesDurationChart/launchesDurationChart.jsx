import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { ALL } from 'common/constants/reservedFilterIds';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { getConfig } from './config/getConfig';
import styles from './launchesDurationChart.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class LaunchesDurationChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navigate: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
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

  onChartClick = (data) => {
    const {
      widget: { content },
      projectId,
    } = this.props;

    this.props.navigate({
      type: TEST_ITEM_PAGE,
      payload: {
        projectId,
        filterId: ALL,
        testItemIds: `${content.result[data.index].id}`,
      },
    });
  };

  configData = {
    getConfig,
    formatMessage: this.props.intl.formatMessage,
    onChartClick: this.onChartClick,
  };

  render() {
    return (
      <div className={cx('launches-duration-chart')}>
        <ChartContainer
          {...getChartDefaultProps(this.props)}
          className={cx('widget-wrapper')}
          configData={this.configData}
          legendConfig={{
            showLegend: false,
          }}
        />
      </div>
    );
  }
}
