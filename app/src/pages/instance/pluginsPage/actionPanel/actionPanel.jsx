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
import { Button } from '@reportportal/ui-kit';
import Parser from 'html-react-parser';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import ImportIcon from 'common/img/import-inline.svg';
import styles from './actionPanel.scss';

export const UPLOAD = 'upload';

const cx = classNames.bind(styles);

const messages = defineMessages({
  uploadPluginDescription: {
    id: 'PluginsPage.uploadPluginDescription',
    defaultMessage: "Don't see the plugin you need? Upload your own.",
  },
  [UPLOAD]: {
    id: 'PluginsPage.upload',
    defaultMessage: 'Upload plugin',
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
  };

  openUploadModal = () => {
    const { tracking } = this.props;
    tracking.trackEvent(PLUGINS_PAGE_EVENTS.CLICK_UPLOAD_BTN);

    this.props.showModalAction({
      id: 'uploadPluginModal',
      data: {
        onImport: this.props.fetchPluginsAction,
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
      /* The control lives in the page header now, so the sidebar's heading and explanatory
         line went with the sidebar; the explanation survives as the button's tooltip. */
      <div className={cx('action-panel')} title={formatMessage(messages.uploadPluginDescription)}>
        {ACTION_BUTTONS.map(({ key, icon, onClick }) => (
          <div className={cx('action-button')} key={key}>
            {/* adjustWidthOn="content": the kit's default width made "Upload plugin" wrap onto
                two lines in the page header, where the sidebar it came from had room */}
            <Button variant="ghost" adjustWidthOn="content" icon={Parser(icon)} onClick={onClick}>
              {formatMessage(messages[key])}
            </Button>
          </div>
        ))}
      </div>
    );
  }
}
