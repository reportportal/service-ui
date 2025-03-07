/*
 * Copyright 2025 EPAM Systems
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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import {
  payloadSelector,
  PRODUCT_VERSIONS_TAB_PAGE,
  querySelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { Tabs } from 'components/main/tabs';
import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { MarkdownEditor } from 'components/main/markdown';
import { ListOfVersions } from './listOfVersions';
import { LIST_OF_VERSIONS, GENERAL_DOCUMENTATION } from './constants';
import { messages } from './messages';
import styles from './productVersionsPage.scss';

const cx = classNames.bind(styles);

export const ProductVersionsPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const [headerNodes, setHeaderNodes] = useState({});
  const { subPage: activeSubPage } = useSelector(payloadSelector);
  const { subPage } = useSelector(querySelector);

  const createTabLink = useCallback(
    (subTabName) => ({
      type: PRODUCT_VERSIONS_TAB_PAGE,
      payload: {
        projectSlug,
        subPage: subTabName,
        organizationSlug,
      },
    }),
    [organizationSlug, projectSlug],
  );

  const tabsConfig = useMemo(
    () => ({
      [LIST_OF_VERSIONS]: {
        name: formatMessage(messages.listOfVersions),
        link: createTabLink(LIST_OF_VERSIONS),
        component: <ListOfVersions />,
      },
      [GENERAL_DOCUMENTATION]: {
        name: formatMessage(messages.generalDocumentation),
        link: createTabLink(GENERAL_DOCUMENTATION),
        component: <MarkdownEditor placeholder="Simple example" />,
      },
    }),
    [createTabLink],
  );

  useEffect(() => {
    setHeaderNodes({
      children: (
        <div className={cx('product-versions-page__tabs')}>
          <Tabs config={tabsConfig} activeTab={activeSubPage} withContent={false} />
        </div>
      ),
    });

    if (!activeSubPage || !tabsConfig[activeSubPage]) {
      const firstTabConfigKey = Object.keys(tabsConfig)[0];
      dispatch(tabsConfig[firstTabConfigKey].link);
    }

    return () => setHeaderNodes(null);
  }, [activeSubPage]);

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('product-versions-page')}>
          {!subPage && (
            <div className={cx('product-versions-page__header')}>
              <Header
                title={formatMessage(messages.productVersions)}
                titleNode={headerNodes.titleNode}
              >
                {headerNodes.children}
              </Header>
            </div>
          )}
          <div className={cx('product-versions-page__content')}>
            {activeSubPage && tabsConfig[activeSubPage].component}
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
