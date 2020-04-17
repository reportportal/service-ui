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

import React from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FilterItem } from 'pages/inside/common/launchFiltersToolbar/filterList/filterItem';
import Parser from 'html-react-parser';
import InfoIcon from 'common/img/info-inline.svg';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { SEARCH_MODES } from './../../../constants';
import { messages } from './messages';
import styles from './itemsListHeader.scss';

const cx = classNames.bind(styles);

const InfoTooltipIcon = withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    noArrow: false,
  },
})(() => <div className={cx('info', 'icon')}>{Parser(InfoIcon)}</div>);

@injectIntl
export class ItemsListHeader extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    allSelected: PropTypes.bool,
    searchMode: PropTypes.string,
    currentLaunch: PropTypes.object,
    currentFilter: PropTypes.object,
    onSelectAllToggle: PropTypes.func,
    onChangeSearchMode: PropTypes.func,
  };

  static defaultProps = {
    onSelectAllToggle: () => {},
    allSelected: false,
    searchMode: SEARCH_MODES.CURRENT_LAUNCH,
    currentLaunch: {},
    currentFilter: null,
    onChangeSearchMode: () => {},
  };

  getSearchModeOptions = () => {
    const {
      intl: { formatMessage },
      currentFilter,
    } = this.props;
    return [
      { value: SEARCH_MODES.CURRENT_LAUNCH, label: formatMessage(messages.currentLaunchMode) },
      { value: SEARCH_MODES.LAUNCH_NAME, label: formatMessage(messages.sameLaunchNameMode) },
      {
        value: SEARCH_MODES.FILTER,
        label: formatMessage(messages.filterMode),
        disabled: !currentFilter || currentFilter.id < 1,
      },
    ];
  };

  getTooltipContent = () => {
    const {
      intl: { formatMessage },
      searchMode,
      currentFilter,
      currentLaunch,
    } = this.props;
    switch (searchMode) {
      case SEARCH_MODES.FILTER:
        return formatMessage(messages[`${searchMode}Tooltip`], { filter: currentFilter.name });
      case SEARCH_MODES.CURRENT_LAUNCH:
        return formatMessage(messages[`${searchMode}Tooltip`], {
          launch: `${currentLaunch.name} #${currentLaunch.number}`,
        });
      case SEARCH_MODES.LAUNCH_NAME:
        return formatMessage(messages[`${searchMode}Tooltip`], { launch: currentLaunch.name });
      default:
        return '';
    }
  };

  toggleSelectAll = () => {
    this.props.onSelectAllToggle(!this.props.allSelected);
  };

  render() {
    const {
      intl,
      allSelected,
      searchMode,
      currentLaunch,
      currentFilter,
      onChangeSearchMode,
    } = this.props;
    const launchTitle =
      searchMode === SEARCH_MODES.CURRENT_LAUNCH
        ? `${currentLaunch.name} #${currentLaunch.number}`
        : currentLaunch.name;
    return (
      <div className={cx('list-header')}>
        <div className={cx('select-all')}>
          <InputCheckbox value={allSelected} onChange={this.toggleSelectAll} />
        </div>
        <span className={cx('search-mode-label')}>
          {intl.formatMessage(messages.changeSimilarItems)}
        </span>
        <div className={cx('search-mode')}>
          <InputDropdown
            options={this.getSearchModeOptions()}
            value={searchMode}
            onChange={onChangeSearchMode}
          />
        </div>
        <div className={cx('info-tooltip')}>
          <InfoTooltipIcon tooltipContent={this.getTooltipContent()} />
        </div>
        {searchMode !== SEARCH_MODES.FILTER && (
          <div className={cx('launch')} title={launchTitle}>
            <span className={cx('launch-name')}>{currentLaunch.name}</span>
            {searchMode === SEARCH_MODES.CURRENT_LAUNCH && (
              <span className={cx('launch-number')}>{`#${currentLaunch.number}`}</span>
            )}
          </div>
        )}
        {searchMode === SEARCH_MODES.FILTER && (
          <div className={cx('filter')}>
            <FilterItem
              isDisabled
              id={currentFilter.id}
              name={currentFilter.name}
              description={currentFilter.description}
              owner={currentFilter.owner}
              intl={intl}
              share={currentFilter.share}
              className={cx('filter-item')}
            />
          </div>
        )}
      </div>
    );
  }
}
