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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { InputSearch } from 'components/inputs/inputSearch';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { ActionPanel } from './actionPanel';

import styles from './pluginsToolbar.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  searchInputPlaceholder: { id: 'PluginsPage.search', defaultMessage: 'Search' },
});

@injectIntl
export class PluginsToolbar extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className={cx('plugins-toolbar')}>
        <div className={cx('plugins-search')}>
          <FieldErrorHint>
            <InputSearch
              customClassName={cx('plugins-input-search')}
              maxLength="128"
              placeholder={this.props.intl.formatMessage(messages.searchInputPlaceholder)}
            />
          </FieldErrorHint>
        </div>
        <ActionPanel />
      </div>
    );
  }
}
