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
import Parser from 'html-react-parser';
import isEmpty from 'lodash.isempty';
import { Button } from '@reportportal/ui-kit';

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
import { hideModalAction, showModalAction } from 'controllers/modal';
import { CREATE_PRODUCT_VERSION_MODAL_KEY } from 'pages/inside/productVersionsPage/listOfVersions/createProductVersionModal';
import PlusIcon from 'common/img/plus-button-inline.svg';

import styles from './productVersionsPage.scss';
import { messages } from './messages';
import { LIST_OF_VERSIONS, GENERAL_DOCUMENTATION } from './constants';
import { ListOfVersions } from './listOfVersions';

const cx = classNames.bind(styles);

export function ProductVersionsPageContent() {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const [versions, setVersions] = useState([]);
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

  const handleModalSubmit = (data) => {
    setVersions((prevState) => [...prevState, { ...data, timestamp: new Date() }]);
    dispatch(hideModalAction());
  };

  const openCreateProductVersionModal = () => {
    dispatch(
      showModalAction({
        id: CREATE_PRODUCT_VERSION_MODAL_KEY,
        data: {
          onSubmit: handleModalSubmit,
        },
      }),
    );
  };

  const tabsConfig = useMemo(
    () => ({
      [LIST_OF_VERSIONS]: {
        name: formatMessage(messages.listOfVersions),
        link: createTabLink(LIST_OF_VERSIONS),
        component: (
          <ListOfVersions
            versions={versions}
            openCreateProductVersionModal={openCreateProductVersionModal}
          />
        ),
      },
      [GENERAL_DOCUMENTATION]: {
        name: formatMessage(messages.generalDocumentation),
        link: createTabLink(GENERAL_DOCUMENTATION),
        component: <MarkdownEditor placeholder="Simple example" />,
      },
    }),
    [createTabLink, versions],
  );

  useEffect(() => {
    if (!activeSubPage || !tabsConfig[activeSubPage]) {
      const firstTabConfigKey = Object.keys(tabsConfig)[0];
      dispatch(tabsConfig[firstTabConfigKey].link);
    }
  }, [activeSubPage, versions]);

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('product-versions-page')}>
          {!subPage && (
            <div className={cx('product-versions-page__header')}>
              <Header title={formatMessage(messages.productVersions)}>
                <div className={cx('product-versions-page__navigation-panel')}>
                  <div className={cx('product-versions-page__tabs')}>
                    <Tabs config={tabsConfig} activeTab={activeSubPage} withContent={false} />
                  </div>
                  {!isEmpty(versions) && (
                    <Button
                      adjustWidthOn="wide-content"
                      onClick={openCreateProductVersionModal}
                      data-automation-id="addProductVersionButton"
                      icon={Parser(PlusIcon)}
                      className={cx('product-versions-page__button')}
                    >
                      {formatMessage(messages.addProductVersionButtonText)}
                    </Button>
                  )}
                </div>
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
}
