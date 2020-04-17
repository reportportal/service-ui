/*
 * Copyright 2020 EPAM Systems
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

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  uiExtensionAdminPagesSelector,
  extensionsLoadedSelector,
} from 'controllers/plugins/uiExtensions';
import { pluginPageSelector } from 'controllers/pages';
import { UiExtensionPage } from 'pages/common/uiExtensionPage';

@connect((state) => ({
  extensions: uiExtensionAdminPagesSelector(state),
  activePluginPage: pluginPageSelector(state),
  isExtensionsLoaded: extensionsLoadedSelector(state),
}))
export class AdminUiExtensionPage extends Component {
  render() {
    return (
      <UiExtensionPage
        extensions={this.props.extensions}
        activePluginPage={this.props.activePluginPage}
        isExtensionsLoaded={this.props.isExtensionsLoaded}
      />
    );
  }
}
AdminUiExtensionPage.propTypes = {
  extensions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      title: PropTypes.string,
      component: PropTypes.element,
    }),
  ),
  activePluginPage: PropTypes.string,
  isExtensionsLoaded: PropTypes.bool,
};
AdminUiExtensionPage.defaultProps = {
  extensions: [],
  activePluginPage: null,
  isExtensionsLoaded: false,
};
