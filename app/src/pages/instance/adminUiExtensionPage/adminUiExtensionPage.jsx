/*
 * Copyright 2024 EPAM Systems
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
import classNames from 'classnames/bind';
import { uiExtensionAdminPagesSelector } from 'controllers/plugins/uiExtensions';
import { useActivePluginPageExtension } from 'controllers/plugins/uiExtensions/hooks';
import { Header } from 'pages/inside/common/header';
import { PageHeader, PageLayout, PageSection } from 'layouts/pageLayout';
import { ExtensionLoader } from 'components/extensionLoader';
import styles from './adminUiExtensionPage.scss';

const cx = classNames.bind(styles);

export const AdminUiExtensionPage = () => {
  const extension = useActivePluginPageExtension(uiExtensionAdminPagesSelector);
  const [headerNodes, setHeaderNodes] = useState({});

  let pageLayout = null;

  if (extension) {
    if (extension.newLayout) {
      pageLayout = (
        <>
          <div className={cx('header')}>
            <Header titleNode={headerNodes.titleNode} title={extension.title || extension.name}>
              {headerNodes.children}
            </Header>
          </div>
          <PageSection>
            <ExtensionLoader
              extension={extension}
              setHeaderNodes={setHeaderNodes}
              withPreloader
              silentOnError={false}
            />
          </PageSection>
        </>
      );
    } else {
      pageLayout = (
        <PageLayout>
          <PageHeader breadcrumbs={[{ title: extension.title || extension.name }]} />
          <PageSection>
            <ExtensionLoader extension={extension} silentOnError={false} withPreloader />
          </PageSection>
        </PageLayout>
      );
    }
  }

  return pageLayout;
};
