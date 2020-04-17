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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { fetchPluginsAction } from 'controllers/plugins';
import { GhostButton } from 'components/buttons/ghostButton';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import ImportIcon from 'common/img/import-inline.svg';
import { URLS } from 'common/urls';
import { MODAL_TYPE_UPLOAD_PLUGIN } from 'pages/common/modals/importModal/constants';
import styles from './actionPanel.scss';

export const UPLOAD = 'upload';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [UPLOAD]: {
    id: 'PluginsPage.upload',
    defaultMessage: 'Upload',
  },
  modalTitle: {
    id: 'PluginsPage.modalTitle',
    defaultMessage: 'Upload plugin',
  },
  uploadButton: {
    id: 'PluginsPage.uploadButton',
    defaultMessage: 'Upload',
  },
  uploadTip: {
    id: 'PluginsPage.tip',
    defaultMessage:
      'Drop only <b>.jar</b> file under 128 MB to upload or <span>click</span> to add it',
  },
  incorrectFileSize: {
    id: 'PluginsPage.incorrectFileSize',
    defaultMessage: 'File size is more than 128 Mb',
  },
  incorrectFileVersion: {
    id: 'PluginsPage.incorrectFileVersion',
    defaultMessage: 'Plugin version should be specified',
  },
  incorrectFileManifest: {
    id: 'PluginsPage.incorrectFileManifest',
    defaultMessage: 'Cannot find the manifest path',
  },
});

@connect(null, {
  showModalAction,
  fetchPluginsAction,
})
@injectIntl
@track()
export class ActionPanel extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    fetchPluginsAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    initialParamsValues: PropTypes.array,
  };
  static defaultProps = {
    initialParamsValues: [],
  };

  prepareInitialParamsValue = (initialParamsValues) =>
    JSON.stringify(
      initialParamsValues.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}),
    );

  openUploadModal = () => {
    const {
      intl: { formatMessage },
      tracking,
    } = this.props;
    tracking.trackEvent(PLUGINS_PAGE_EVENTS.CLICK_UPLOAD_BTN);

    this.props.showModalAction({
      id: 'importModal',
      data: {
        type: MODAL_TYPE_UPLOAD_PLUGIN,
        onImport: this.props.fetchPluginsAction,
        title: formatMessage(messages.modalTitle),
        importButton: formatMessage(messages.uploadButton),
        tip: formatMessage(messages.uploadTip),
        incorrectFileSize: formatMessage(messages.incorrectFileSize),
        url: URLS.plugin(),
        singleImport: true,
        eventsInfo: {
          okBtn: PLUGINS_PAGE_EVENTS.OK_BTN_UPLOAD_MODAL,
          cancelBtn: PLUGINS_PAGE_EVENTS.CANCEL_BTN_UPLOAD_MODAL,
          closeIcon: PLUGINS_PAGE_EVENTS.CLOSE_ICON_UPLOAD_MODAL,
        },
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const ACTION_BUTTONS = [
      {
        key: UPLOAD,
        icon: ImportIcon,
        onClick: this.openUploadModal,
      },
    ];
    return (
      <div className={cx('action-buttons')}>
        {ACTION_BUTTONS.map(({ key, icon, onClick }) => (
          <div className={cx('action-button')} key={key}>
            <GhostButton icon={icon} onClick={onClick}>
              {formatMessage(messages[key])}
            </GhostButton>
          </div>
        ))}
      </div>
    );
  }
}
