/*
 * Copyright 2026 EPAM Systems
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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { langSelector } from 'controllers/lang';
import { mergedMessagesSelector } from 'controllers/plugins/uiExtensions/localization';
import { polyfillLocales } from 'common/polyfills';

const localesReadyPromise = polyfillLocales();

@connect((state) => ({
  lang: langSelector(state),
  messages: mergedMessagesSelector(state),
}))
export class LocalizationContainer extends React.Component {
  static propTypes = {
    lang: PropTypes.string,
    messages: PropTypes.object,
    children: PropTypes.node,
  };

  static defaultProps = {
    lang: 'be',
    messages: {},
    children: null,
  };

  state = {
    ready: false,
  };

  componentDidMount() {
    localesReadyPromise.then(() => {
      this.setState({ ready: true });
    });
  }

  render() {
    if (!this.state.ready) {
      return <div />;
    }
    return (
      <IntlProvider
        defaultLocale={this.props.lang === 'be' ? 'be' : 'en'}
        locale={this.props.lang}
        messages={this.props.messages}
      >
        {React.cloneElement(this.props.children, { key: this.props.lang })}
      </IntlProvider>
    );
  }
}
