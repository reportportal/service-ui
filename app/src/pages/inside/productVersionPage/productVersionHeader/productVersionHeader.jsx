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

import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { BreadcrumbsTreeIcon, ChevronRightBreadcrumbsIcon } from '@reportportal/ui-kit';

import { Tabs } from 'components/main/tabs';
import { payloadSelector } from 'controllers/pages';
import { messages } from 'pages/inside/productVersionsPage/messages';
import { TabsConfigShape } from 'components/main/tabs/tabs';
import { PopoverTools } from './popoverTools';

import styles from './productVersionHeader.scss';

const cx = classNames.bind(styles);

export function ProductVersionHeader({ tabsConfig }) {
  const { formatMessage } = useIntl();
  const { productVersionTab: currentTab, productVersionId } = useSelector(payloadSelector);

  return (
    <div className={cx('product-version-header')}>
      <div className={cx('product-version-header__breadcrumb')}>
        <div className={cx('product-version-header__tree-icon')}>
          <BreadcrumbsTreeIcon />
        </div>
        <div className={cx('product-version-header__breadcrumb-name')}>
          {formatMessage(messages.productVersions)}
          <ChevronRightBreadcrumbsIcon />
          {productVersionId}
        </div>
      </div>
      <div className={cx('product-version-header__title')}>{productVersionId}</div>
      <div className={cx('product-version-header__tab-wrapper')}>
        <Tabs config={tabsConfig} activeTab={currentTab} withContent={false} />
        <div className={cx('product-version-header__popover')}>
          <PopoverTools />
        </div>
      </div>
    </div>
  );
}

ProductVersionHeader.propTypes = {
  tabsConfig: TabsConfigShape.isRequired,
};
