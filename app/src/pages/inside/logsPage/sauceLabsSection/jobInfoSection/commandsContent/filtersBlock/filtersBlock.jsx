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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import SearchIcon from 'common/img/search-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputSearch } from 'components/inputs/inputSearch';
import { messages } from '../../messages';
import styles from './filtersBlock.scss';

const cx = classNames.bind(styles);

@injectIntl
export class FiltersBlock extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    hasScreenshot: PropTypes.bool.isRequired,
    searchValue: PropTypes.string.isRequired,
    onToggleHasScreenshot: PropTypes.func.isRequired,
    onChangeSearch: PropTypes.func.isRequired,
  };

  state = {
    isSearchOpen: false,
  };

  toggleSearch = () => {
    const { isSearchOpen } = this.state;
    this.setState({
      isSearchOpen: !isSearchOpen,
    });
    if (isSearchOpen) {
      this.props.onChangeSearch({ target: { value: '' } });
    }
  };

  render() {
    const {
      intl: { formatMessage },
      hasScreenshot,
      searchValue,
      onToggleHasScreenshot,
      onChangeSearch,
    } = this.props;

    return (
      <div className={cx('filters-block')}>
        {this.state.isSearchOpen ? (
          <Fragment>
            <div className={cx('input-search-wrapper')}>
              <InputSearch
                className={cx('input-search')}
                value={searchValue}
                onChange={onChangeSearch}
                placeholder={formatMessage(COMMON_LOCALE_KEYS.SEARCH)}
              />
            </div>
            <span className={cx('search-toggler')} onClick={this.toggleSearch}>
              {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
            </span>
          </Fragment>
        ) : (
          <Fragment>
            <InputCheckbox value={hasScreenshot} onChange={onToggleHasScreenshot}>
              {formatMessage(messages.hasScreenshot)}
            </InputCheckbox>
            <span className={cx('search-toggler', 'icon')} onClick={this.toggleSearch}>
              {Parser(SearchIcon)}
            </span>
          </Fragment>
        )}
      </div>
    );
  }
}
