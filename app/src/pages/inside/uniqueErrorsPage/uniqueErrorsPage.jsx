/*
 * Copyright 2021 EPAM Systems
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

import { PageLayout, PageSection } from 'layouts/pageLayout';
import { connect } from 'react-redux';
import { launchSelector, parentItemSelector } from 'controllers/testItem';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { UniqueErrorsView } from './uniqueErrorsView';
import { UniqueErrorsToolbar } from './uniqueErrorsToolbar';

@connect((state) => ({
  parentLaunch: launchSelector(state),
  parentItem: parentItemSelector(state),
}))
export class UniqueErrorsPage extends Component {
  static propTypes = {
    parentLaunch: PropTypes.object,
    parentItem: PropTypes.object,
  };
  static defaultProps = {
    parentLaunch: {},
    parentItem: {},
  };

  render() {
    const { parentLaunch, parentItem } = this.props;
    return (
      <PageLayout>
        <PageSection>
          <UniqueErrorsToolbar parentItem={parentItem} />
          <UniqueErrorsView parentLaunch={parentLaunch} />
        </PageSection>
      </PageLayout>
    );
  }
}
