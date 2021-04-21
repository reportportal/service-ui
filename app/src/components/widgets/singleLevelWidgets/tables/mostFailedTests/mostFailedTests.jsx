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
import { connect } from 'react-redux';
import { testCaseNameLinkSelector } from 'controllers/testItem';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './mostFailedTestsCfg';

@connect(
  (state) => ({
    getTestCaseNameLink: testCaseNameLinkSelector(state),
  }),
  { navigate: (linkAction) => linkAction },
)
export class MostFailedTests extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    getTestCaseNameLink: PropTypes.func.isRequired,
  };

  getIssueTypeMessage = (issueType) => {
    const type = issueType.split('$')[2];
    return cfg.issueTypes[type];
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
      widget: {
        content,
        contentParameters: { contentFields },
      },
    } = this.props;

    const issueType = contentFields[0];

    return (
      <TestsTableWidget
        tests={content.result}
        launch={content.latestLaunch}
        issueType={this.getIssueTypeMessage(issueType)}
        columns={cfg.columns}
        onItemClick={this.itemClickHandler}
      />
    );
  }
}
