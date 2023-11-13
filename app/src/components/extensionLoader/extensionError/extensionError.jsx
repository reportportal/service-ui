/*
 * Copyright 2023 EPAM Systems
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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { defineMessages, injectIntl } from 'react-intl';
import PluginErrorImage from 'common/img/plugins/plugin-error.svg';
import styles from './extensionError.scss';

const messages = defineMessages({
  message: {
    id: 'ExtensionError.message',
    defaultMessage:
      'The plugin has encountered a crash. <br />Await the reestablishment of the connection <br />or contact the administrator for assistance.',
  },
});

const cx = classNames.bind(styles);

export const ExtensionError = injectIntl(({ intl: { formatMessage } }) => (
  <div className={cx('extension-error')}>
    <img src={PluginErrorImage} alt="Plugin error" />
    <p className={cx('message')}>{Parser(formatMessage(messages.message))}</p>
  </div>
));
ExtensionError.propTypes = {
  intl: PropTypes.object.isRequired,
};
