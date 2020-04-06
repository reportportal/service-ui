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

import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { ModalContainer } from 'components/main/modal';
import { pageNames } from 'controllers/pages/constants';
import { pageSelector, isInitialDispatchDoneSelector } from 'controllers/pages';
import { LocalizationSwitcher } from 'components/main/localizationSwitcher';
import { ScreenLock } from 'components/main/screenLock';
import { NotificationContainer } from 'components/main/notification';
import { PageErrorBoundary } from 'components/containers/pageErrorBoundary';

import { pageRendering } from './constants';

import styles from './pageSwitcher.scss';

Object.keys(pageNames).forEach((page) => {
  if (!pageRendering[page]) {
    throw new Error(`Rendering for ${page} was not defined.`);
  }
});

@connect((state) => ({
  page: pageSelector(state),
  isInitialDispatchDone: isInitialDispatchDoneSelector(state),
}))
export default class PageSwitcher extends React.Component {
  static propTypes = {
    page: PropTypes.string,
    isInitialDispatchDone: PropTypes.bool,
  };
  static defaultProps = {
    page: undefined,
    isInitialDispatchDone: false,
  };

  render() {
    const { page, isInitialDispatchDone } = this.props;

    if (!page || !isInitialDispatchDone) return null;

    const { component: PageComponent, layout: Layout } = pageRendering[page];

    if (!PageComponent) throw new Error(`Page ${page} does not exist`);
    if (!Layout) throw new Error(`Page ${page} is missing layout`);

    const mode = process.env.NODE_ENV;

    return (
      <div className={styles.pageSwitcher}>
        <Layout>
          {mode === 'development' && <LocalizationSwitcher />}
          <PageErrorBoundary key={page}>
            <PageComponent />
          </PageErrorBoundary>
        </Layout>
        <ModalContainer />
        <NotificationContainer />
        <ScreenLock />
      </div>
    );
  }
}
