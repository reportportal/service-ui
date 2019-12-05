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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { activeProjectSelector } from 'controllers/user';
import { ChartContainer } from 'components/widgets/common/c3chart';
import {
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
} from 'components/widgets/common/utils';
import { ALL } from 'common/constants/reservedFilterIds';
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
    intl: PropTypes.object.isRequired,
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
    const link = getDefaultTestItemLinkParams(projectId, ALL, `${content.result[data.index].id}`);

    this.props.navigate(link);
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
