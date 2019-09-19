import React from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FilterItem } from 'pages/inside/common/launchFiltersToolbar/filterList/filterItem';
import Parser from 'html-react-parser';
import { isEmptyObject } from 'common/utils';
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
    intl: intlShape.isRequired,
    allSelected: PropTypes.bool,
    searchMode: PropTypes.string,
    currentLaunch: PropTypes.object,
    currentFilter: PropTypes.object,
    itemLaunch: PropTypes.object,
    onSelectAllToggle: PropTypes.func,
    onChangeSearchMode: PropTypes.func,
  };

  static defaultProps = {
    onSelectAllToggle: () => {},
    allSelected: false,
    searchMode: SEARCH_MODES.CURRENT_LAUNCH,
    currentLaunch: {},
    currentFilter: null,
    itemLaunch: {},
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
    } = this.props;
    const actualLaunch = this.getActualLaunch();
    switch (searchMode) {
      case SEARCH_MODES.FILTER:
        return formatMessage(messages[`${searchMode}Tooltip`], { filter: currentFilter.name });
      case SEARCH_MODES.CURRENT_LAUNCH:
        return formatMessage(messages[`${searchMode}Tooltip`], {
          launch: `${actualLaunch.name} #${actualLaunch.number}`,
        });
      case SEARCH_MODES.LAUNCH_NAME:
        return formatMessage(messages[`${searchMode}Tooltip`], { launch: actualLaunch.name });
      default:
        return '';
    }
  };

  getActualLaunch = () => {
    const { currentLaunch, itemLaunch } = this.props;

    return isEmptyObject(currentLaunch) ? itemLaunch : currentLaunch;
  };

  toggleSelectAll = () => {
    this.props.onSelectAllToggle(!this.props.allSelected);
  };

  render() {
    const { intl, allSelected, searchMode, currentFilter, onChangeSearchMode } = this.props;
    const actualLaunch = this.getActualLaunch();
    const launchTitle =
      searchMode === SEARCH_MODES.CURRENT_LAUNCH
        ? `${actualLaunch.name} #${actualLaunch.number}`
        : actualLaunch.name;
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
            <span className={cx('launch-name')}>{actualLaunch.name}</span>
            {searchMode === SEARCH_MODES.CURRENT_LAUNCH && (
              <span className={cx('launch-number')}>{`#${actualLaunch.number}`}</span>
            )}
          </div>
        )}
        {searchMode === SEARCH_MODES.FILTER && (
          <div className={cx('filter')}>
            <FilterItem
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
