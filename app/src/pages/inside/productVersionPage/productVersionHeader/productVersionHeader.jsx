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

export const ProductVersionHeader = ({ tabsConfig }) => {
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
};

ProductVersionHeader.propTypes = {
  tabsConfig: TabsConfigShape.isRequired,
};
