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
import { defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { testCaseNameLinkSelector } from 'controllers/testItem';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './flakyTestsCfg';

const titleMessages = defineMessages({
  flakyTestsMatrixTooltip: {
    id: 'flakyTests.flakyTestsMatrixTooltip',
    defaultMessage: '{statusNumber} {statusChange} from {possibleNumber} {possibleTimes}',
  },
  change: {
    id: 'flakyTests.flakyTestsMatrixTooltipChange',
    defaultMessage: 'status change',
  },
  changes: {
    id: 'flakyTests.flakyTestsMatrixTooltipChanges',
    defaultMessage: 'status changes',
  },
  possible: {
    id: 'flakyTests.flakyTestsMatrixTooltipPossible',
    defaultMessage: 'possible',
  },
  possibleTimes: {
    id: 'flakyTests.flakyTestsMatrixTooltipPossibleTimes',
    defaultMessage: 'possible times',
  },
});

@connect(
  (state) => ({
    getTestCaseNameLink: testCaseNameLinkSelector(state),
  }),
  { navigate: (linkAction) => linkAction },
)
export class FlakyTests extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    getTestCaseNameLink: PropTypes.func.isRequired,
  };

  prepareWidgetData = ({ flaky }) =>
    flaky.map((item) => ({ ...item, statuses: [...item.statuses].reverse() }));

  getMaxtrixTooltip = (count, total, formatMessage) => {
    return formatMessage(titleMessages.flakyTestsMatrixTooltip, {
      statusNumber: count,
      statusChange: formatMessage(count === 1 ? titleMessages.change : titleMessages.changes),
      possibleTimes: formatMessage(
        total === 1 ? titleMessages.possible : titleMessages.possibleTimes,
      ),
      possibleNumber: total,
    });
  };

  itemClickHandler = (uniqueId) => {
    const {
      widget: {
        content: { latestLaunch },
      },
      getTestCaseNameLink,
      navigate,
    } = this.props;
    const link = getTestCaseNameLink({ uniqueId, testItemIds: latestLaunch.id });

    navigate(link);
  };

  render() {
    const {
      widget: { content },
    } = this.props;

    return (
      <TestsTableWidget
        tests={this.prepareWidgetData(content)}
        launch={content.latestLaunch}
        columns={cfg.columns}
        getMaxtrixTooltip={this.getMaxtrixTooltip}
        onItemClick={this.itemClickHandler}
      />
    );
  }
}
