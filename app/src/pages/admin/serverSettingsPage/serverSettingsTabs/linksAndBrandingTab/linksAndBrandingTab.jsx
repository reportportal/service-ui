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

import { SectionHeader } from 'components/main/sectionHeader';
import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { Footer, DEFAULT_FOOTER_LINKS, PRIVACY_POLICY_LINK } from 'layouts/common/footer';
import { useDispatch, useSelector } from 'react-redux';
import {
  serverFooterLinksSelector,
  updateServerFooterLinksAction,
  instanceTypeSelector,
} from 'controllers/appInfo';
import { DragControl } from 'pages/inside/projectSettingsPageContainer/content/elements/ruleList/ruleItem/draggable/dragControl';
import { Icon } from 'components/main/icon';
import { Button } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import DOMPurify from 'dompurify';
import { EPAM, SAAS } from 'controllers/appInfo/constants';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { AddLinkForm } from './addLinkForm';
import styles from './linksAndBrandingTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  formHeader: {
    id: 'LinksAndBrandingTab.formHeader',
    defaultMessage: 'Footer Links',
  },
  previewDescription: {
    id: 'LinksAndBrandingTab.previewDescription',
    defaultMessage: 'You can configure the necessary links in the footer of the application.',
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
});

const MAX_LINKS_COUNT = 5;

export const LinksAndBrandingTab = () => {
  const { formatMessage } = useIntl();
  const customLinks = useSelector(serverFooterLinksSelector);
  const instanceType = useSelector(instanceTypeSelector);
  const [isAddLinkFormVisible, setIsAddLinkFormVisible] = useState(false);
  const dispatch = useDispatch();
  const handleDeleteLink = (linkName) => {
    const updatedLinks = customLinks.filter((link) => link.name !== linkName);
    dispatch(
      updateServerFooterLinksAction(updatedLinks, () => {
        dispatch(
          showNotification({
            message: formatMessage(messages.deleteFooterLinkSuccess),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );
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
    setIsAddLinkFormVisible(!isAddLinkFormVisible);
  };
  const handleAddLinkFormClose = () => {
    setIsAddLinkFormVisible(false);
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
        <div className={cx('preview-block')}>
          <Footer className={cx('preview-footer')} />
        </div>
      </div>
      <div className={cx('links-panel')}>
        <div className={cx('links-summary')}>
          <div className={cx('default-links')}>
            {DEFAULT_FOOTER_LINKS.map((link) => (
              <div key={link.name} className={cx('link-item')}>
                <div className={cx('link-item-name')}>{link.name}</div>
                <div className={cx('link-item-url')}>{link.url}</div>
              </div>
            ))}
            {(instanceType === EPAM || instanceType === SAAS) && (
              <div className={cx('link-item')}>
                <div className={cx('link-item-name')}>{PRIVACY_POLICY_LINK.name}</div>
                <div className={cx('link-item-url')}>{PRIVACY_POLICY_LINK.url}</div>
              </div>
            )}
          </div>
          <div className={cx('custom-links')}>
            {customLinks.slice(0, MAX_LINKS_COUNT).map((link) => (
              <div key={link.name} className={cx('link-item')}>
                <div className={cx('link-item-name')}>{link.name}</div>
                <div className={cx('link-item-url')}>
                  {link.url.startsWith('mailto:') ? link.url.slice(7) : link.url}
                </div>
                <Icon
                  type="icon-delete"
                  className={cx('icon-delete')}
                  onClick={() => handleDeleteIconClick(link.name)}
                />
                <DragControl />
              </div>
            ))}
          </div>
        </div>
        <div className={cx('links-control')}>
          {isAddLinkFormVisible ? (
            <AddLinkForm
              defaultLinks={DEFAULT_FOOTER_LINKS}
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
