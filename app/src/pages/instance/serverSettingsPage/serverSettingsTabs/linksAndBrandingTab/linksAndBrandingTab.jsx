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

import { useState } from 'react';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { SectionHeader } from 'components/main/sectionHeader';
import { useDispatch, useSelector } from 'react-redux';
import { serverSidebarLinksSelector, updateServerSettingsAction } from 'controllers/appInfo';
import { Button } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import DOMPurify from 'dompurify';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { useTracking } from 'react-tracking';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { DraggableLink } from './draggableLink';
import { AddLinkForm } from './addLinkForm';
import { prepareSidebarLinksData } from './utils';
import styles from './linksAndBrandingTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  formHeader: {
    id: 'LinksAndBrandingTab.formHeader',
    defaultMessage: 'Sidebar links',
  },
  previewDescription: {
    id: 'LinksAndBrandingTab.previewDescription',
    defaultMessage: `You can configure the necessary links in the sidebar 'Help and Service versions' block of the application.`,
  },
  deleteLinkHeader: {
    id: 'DeleteLinkDialog.deleteLinkHeader',
    defaultMessage: 'Delete link',
  },
  deleteLinkText: {
    id: 'DeleteLinkDialog.deleteLink',
    defaultMessage: "Are you sure you want to delete the link ''<b>{name}</b>'' ?",
  },
  addLink: {
    id: 'LinksAndBrandingTab.addLink',
    defaultMessage: '+ Add new',
  },
  titleForDisabledButton: {
    id: 'LinksAndBrandingTab.titleForDisabledButton',
    defaultMessage: 'You have added the maximum allowed number of links.',
  },
  deleteFooterLinkSuccess: {
    id: 'LinksAndBrandingTab.deleteFooterLinkSuccess',
    defaultMessage: 'The link has been deleted successfully',
  },
  orderChangedSuccessfully: {
    id: 'LinksAndBrandingTab.orderChangedSuccessfully',
    defaultMessage: 'The links order has been changed successfully',
  },
  disabledOrderChange: {
    id: 'LinksAndBrandingTab.disabledOrderChange',
    defaultMessage: 'Add at least one more link to change the order',
  },
});

const MAX_LINKS_COUNT = 5;
const DEFAULT_SIDEBAR_LINKS = [
  {
    name: 'Fork us on GitHub',
    url: referenceDictionary.rpGitHub,
  },
  {
    name: 'Documentation',
    url: referenceDictionary.rpDoc,
  },
];

export const LinksAndBrandingTab = () => {
  const { formatMessage } = useIntl();
  const customLinks = useSelector(serverSidebarLinksSelector);
  const [isAddLinkFormVisible, setIsAddLinkFormVisible] = useState(false);
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const handleDeleteLink = (linkName) => {
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.onDeleteFooterLink(linkName));
    const updatedLinks = customLinks.filter((link) => link.name !== linkName);
    dispatch(
      updateServerSettingsAction({
        data: prepareSidebarLinksData(updatedLinks),
        onSuccess: () => {
          dispatch(
            showNotification({
              message: formatMessage(messages.deleteFooterLinkSuccess),
              type: NOTIFICATION_TYPES.SUCCESS,
            }),
          );
        },
      }),
    );
  };
  const handleDeleteIconClick = (linkName) => {
    dispatch(
      showModalAction({
        id: 'confirmationModal',
        data: {
          message: formatMessage(messages.deleteLinkText, {
            name: linkName,
            b: (chunks) => DOMPurify.sanitize(`<b>${chunks}</b>`),
          }),
          onConfirm: () => handleDeleteLink(linkName),
          title: formatMessage(messages.deleteLinkHeader),
          dangerConfirm: true,
          confirmText: formatMessage(COMMON_LOCALE_KEYS.DELETE),
          cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        },
      }),
    );
  };

  const handleAddLinkButtonClick = () => {
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.ADD_NEW_FOOTER_LINK);
    setIsAddLinkFormVisible(!isAddLinkFormVisible);
  };
  const handleAddLinkFormClose = () => {
    setIsAddLinkFormVisible(false);
  };

  const handleLinkDrop = (fromIndex, toIndex) => {
    const updatedLinks = [...customLinks];
    updatedLinks.splice(fromIndex, 1);
    updatedLinks.splice(toIndex, 0, customLinks[fromIndex]);
    dispatch(
      updateServerSettingsAction({
        data: prepareSidebarLinksData(updatedLinks),
        onSuccess: () => {
          dispatch(
            showNotification({
              message: formatMessage(messages.orderChangedSuccessfully),
              type: NOTIFICATION_TYPES.SUCCESS,
            }),
          );
        },
      }),
    );
  };

  return (
    <div className={cx('links-and-branding-tab')}>
      <div className={cx('heading-wrapper')}>
        <SectionHeader text={formatMessage(messages.formHeader)} />
      </div>
      <div className={cx('preview')}>
        <div className={cx('preview-description')}>
          {formatMessage(messages.previewDescription)}
        </div>
      </div>
      <div className={cx('links-panel')}>
        <div className={cx('links-summary')}>
          <div className={cx('default-links')}>
            {DEFAULT_SIDEBAR_LINKS.map((link) => (
              <div key={link.name} className={cx('link-item')}>
                <div className={cx('link-item-name')}>{link.name}</div>
                <div className={cx('link-item-url')}>{link.url}</div>
              </div>
            ))}
          </div>
          <div className={cx('custom-links')}>
            {customLinks.slice(0, MAX_LINKS_COUNT).map((link, index) => (
              <DraggableLink
                key={link.name}
                item={{ ...link, index }}
                onDrop={handleLinkDrop}
                onDelete={handleDeleteIconClick}
                disabled={customLinks.length === 1}
                disabledTitle={formatMessage(messages.disabledOrderChange)}
              />
            ))}
          </div>
        </div>
        <div className={cx('links-control')}>
          {isAddLinkFormVisible ? (
            <AddLinkForm
              defaultLinks={DEFAULT_SIDEBAR_LINKS}
              customLinks={customLinks}
              onClose={handleAddLinkFormClose}
            />
          ) : (
            <Button
              variant={'text'}
              onClick={handleAddLinkButtonClick}
              className={cx('add-new-button')}
              disabled={customLinks.length >= MAX_LINKS_COUNT}
              title={
                customLinks.length >= MAX_LINKS_COUNT &&
                formatMessage(messages.titleForDisabledButton)
              }
            >
              <span>{formatMessage(messages.addLink)}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
