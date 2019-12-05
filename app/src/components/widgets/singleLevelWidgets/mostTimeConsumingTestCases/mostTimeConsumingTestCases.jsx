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
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages/constants';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { ALL } from 'common/constants/reservedFilterIds';
import { MostTimeConsumingTestCasesChart } from './mostTimeConsumingTestCasesChart';
import { MostTimeConsumingTestCasesTable } from './mostTimeConsumingTestCasesTable';
import styles from './mostTimeConsumingTestCases.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  launchNameText: {
    id: 'TimeConsuming.launchNameText',
    defaultMessage: 'Launch name:',
  },
});

@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class MostTimeConsumingTestCases extends Component {
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

  launchNameClickHandler = () => {
    const {
      projectId,
      widget: { content: { latestLaunch = {} } = {} },
      navigate,
    } = this.props;

    const navigationParams = {
      payload: {
        projectId,
        filterId: ALL,
        testItemIds: latestLaunch.id,
      },
      type: TEST_ITEM_PAGE,
    };

    navigate(navigationParams);
  };

  render() {
    const {
      widget: {
        contentParameters: { widgetOptions: { viewMode } = {} } = {},
        content: { latestLaunch: { name, number } = {} },
      },
      widget = {},
      intl: { formatMessage },
      height,
      isPreview,
      navigate,
      projectId,
      observer,
      container,
    } = this.props;

    const launchName = number ? `${name} #${number}` : name;

    return (
      <div className={cx('most-time-consuming')}>
        <div className={cx('launch-name-block')} onClick={this.launchNameClickHandler}>
          <span className={cx('launch-name-text')}>
            {`${formatMessage(localMessages.launchNameText)} `}
          </span>
          <span className={cx('launch-name')}>{`${launchName}`}</span>
        </div>
        {viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW] ? (
          <MostTimeConsumingTestCasesChart
            widget={widget}
            height={height}
            isPreview={isPreview}
            projectId={projectId}
            navigate={navigate}
            observer={observer}
            container={container}
          />
        ) : (
          <MostTimeConsumingTestCasesTable widget={widget} />
        )}
      </div>
    );
  }
}
