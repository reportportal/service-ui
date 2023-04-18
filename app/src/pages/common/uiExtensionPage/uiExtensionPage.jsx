/*
 * Copyright 2020 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PageHeader, PageLayout, PageSection } from 'layouts/pageLayout';
import { ExtensionLoader, extensionType } from 'components/extensionLoader';
import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import classNames from 'classnames/bind';
import styles from './uiExtensionPage.scss';

const cx = classNames.bind(styles);

export const UiExtensionPage = ({ extensions, activePluginPage }) => {
  const extension = React.useMemo(() => extensions.find((ex) => ex.name === activePluginPage), [
    extensions,
    activePluginPage,
  ]);

  const [headerNodes, setHeaderNodes] = useState({});

  const pageLayout =
    extension && extension.newLayout ? (
      <>
        <div className={cx('header')}>
          <Header titleNode={headerNodes.titleNode} title={extension.title || extension.name}>
            {headerNodes.children}
          </Header>
        </div>
        <PageSection>
          <ExtensionLoader extension={extension} withPreloader setHeaderNodes={setHeaderNodes} />
        </PageSection>
      </>
    ) : (
      <PageLayout>
        {extension && <PageHeader breadcrumbs={[{ title: extension.title || extension.name }]} />}
        <PageSection>
          <ExtensionLoader extension={extension} withPreloader />
        </PageSection>
      </PageLayout>
    );

  return pageLayout;
};
UiExtensionPage.propTypes = {
  extensions: PropTypes.arrayOf(extensionType),
  activePluginPage: PropTypes.string,
};
UiExtensionPage.defaultProps = {
  extensions: [],
  activePluginPage: null,
};
