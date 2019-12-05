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
import { injectIntl } from 'react-intl';
import { ALL } from 'common/constants/reservedFilterIds';
import { TEST_ITEM_PAGE, PROJECT_LOG_PAGE } from 'controllers/pages/constants';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { getConfig } from './config/getConfig';
import styles from './mostTimeConsumingTestCasesChart.scss';

const cx = classNames.bind(styles);

@injectIntl
export class MostTimeConsumingTestCasesChart extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    projectId: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
  };

  testCaseClickHandler = (id) => {
    const {
      projectId,
      widget: {
        content: { result, latestLaunch = {} },
      },
      navigate,
    } = this.props;
    const targetElement = result.find((el) => el.id === id) || {};
    const { path } = targetElement;
    let itemLink;
    let pageType;

    if (path) {
      itemLink = `${latestLaunch.id}/${path.replace(/[.]/g, '/')}`;
      pageType = PROJECT_LOG_PAGE;
    } else {
      itemLink = `${latestLaunch.id}`;
      pageType = TEST_ITEM_PAGE;
    }

    const navigationParams = {
      payload: {
        projectId,
        filterId: ALL,
        testItemIds: itemLink,
      },
      type: pageType,
    };

    navigate(navigationParams);
  };

  configData = {
    formatMessage: this.props.intl.formatMessage,
    getConfig,
    onChartClick: this.testCaseClickHandler,
  };

  render() {
    return (
      <div className={cx('most-time-consuming-chart')}>
        <ChartContainer
          {...getChartDefaultProps(this.props)}
          legendConfig={{
            showLegend: false,
          }}
          configData={this.configData}
          className={cx('widget-wrapper')}
        />
      </div>
    );
  }
}
