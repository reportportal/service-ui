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

import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { redirect } from 'redux-first-router';
import classNames from 'classnames/bind';
import { Popover, MeatballMenuIcon, Button } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { hideModalAction, showModalAction } from 'controllers/modal';
import {
  payloadSelector,
  PRODUCT_VERSION_TAB_PAGE,
  PRODUCT_VERSIONS_TAB_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { LIST_OF_VERSIONS } from 'pages/inside/productVersionsPage/constants';
import { DELETE_PRODUCT_VERSION_MODAL } from '../deleteProductVersionModal';
import { RENAME_PRODUCT_VERSION_MODAL } from '../renameProductVersionModal';

import styles from './popoverTools.scss';

const cx = classNames.bind(styles);

export const PopoverTools = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { productVersionId, productVersionTab } = useSelector(payloadSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);

  const handleRenameModalSubmit = (data) => {
    dispatch(hideModalAction());
    dispatch(
      redirect({
        type: PRODUCT_VERSION_TAB_PAGE,
        payload: {
          productVersionId: data.productVersionName,
          projectSlug,
          productVersionTab,
          organizationSlug,
        },
      }),
    );
  };

  const handleDeleteModalSubmit = () => {
    dispatch(hideModalAction());
    dispatch(
      redirect({
        type: PRODUCT_VERSIONS_TAB_PAGE,
        payload: {
          subPage: LIST_OF_VERSIONS,
          projectSlug,
          organizationSlug,
        },
      }),
    );
  };

  const openRenameModal = () => {
    dispatch(
      showModalAction({
        id: RENAME_PRODUCT_VERSION_MODAL,
        data: {
          productVersionName: productVersionId,
          onSubmit: handleRenameModalSubmit,
        },
      }),
    );
  };

  const openDeleteModal = () => {
    dispatch(
      showModalAction({
        id: DELETE_PRODUCT_VERSION_MODAL,
        data: {
          productVersionName: productVersionId,
          onSubmit: handleDeleteModalSubmit,
        },
      }),
    );
  };

  return (
    <Popover
      className={cx('popover-tools')}
      content={
        <ul>
          <li>
            <button className={cx('popover-tools__item-button')} onClick={openRenameModal}>
              {formatMessage(COMMON_LOCALE_KEYS.RENAME)}
            </button>
          </li>
          <li>
            <button
              className={cx('popover-tools__item-button', 'popover-tools__item-button-red')}
              onClick={openDeleteModal}
            >
              {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
            </button>
          </li>
        </ul>
      }
      placement="bottom-end"
    >
      <Button variant="ghost" className={cx('popover-tools__meatball-button')}>
        <MeatballMenuIcon />
      </Button>
    </Popover>
  );
};
