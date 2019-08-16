import React from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NoItemMessage } from 'components/main/noItemMessage';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { injectIntl, intlShape } from 'react-intl';
import { ItemsListHeader } from './itemsListHeader';
import { ItemsListRow } from './itemsListRow';
import styles from './itemsList.scss';
import { SEARCH_MODES } from '../../constants';
import { messages } from '../../messages';

const cx = classNames.bind(styles);

const ItemsListBody = ({ testItems, selectedItems, ...rest }) => (
  <ScrollWrapper autoHeight autoHeightMax={360} hideTracksWhenNotNeeded>
    {testItems.map((item) => {
      const selected = selectedItems.some((selectedItem) => selectedItem.itemId === item.itemId);
      return <ItemsListRow key={item.itemId} testItem={item} selected={selected} {...rest} />;
    })}
  </ScrollWrapper>
);

ItemsListBody.propTypes = {
  testItems: PropTypes.array,
  selectedItems: PropTypes.array,
};

ItemsListBody.defaultProps = {
  testItems: [],
  selectedItems: [],
};

export const ItemsList = injectIntl(
  ({
    intl,
    loading,
    testItems,
    selectedItems,
    searchMode,
    currentLaunch,
    currentFilter,
    onSelectAllToggle,
    onToggleItemSelect,
    onChangeSearchMode,
  }) => {
    const isAllSelected = testItems.length && testItems.length === selectedItems.length;
    return (
      <div className={cx('list-container')}>
        <ItemsListHeader
          searchMode={searchMode}
          allSelected={isAllSelected}
          currentLaunch={currentLaunch}
          currentFilter={currentFilter}
          onSelectAllToggle={onSelectAllToggle}
          onChangeSearchMode={onChangeSearchMode}
        />
        {testItems.length ? (
          <ItemsListBody
            testItems={testItems}
            selectedItems={selectedItems}
            onToggleItemSelect={onToggleItemSelect}
          />
        ) : (
          <div className={cx('no-items')}>
            {loading && <SpinningPreloader />}
            {!loading && <NoItemMessage message={intl.formatMessage(messages.noItems)} />}
          </div>
        )}
      </div>
    );
  },
);

ItemsList.propTypes = {
  intl: intlShape.isRequired,
  loading: PropTypes.bool,
  testItems: PropTypes.array,
  selectedItems: PropTypes.array,
  searchMode: PropTypes.string,
  currentLaunch: PropTypes.object,
  currentFilter: PropTypes.object,
  onToggleItemSelect: PropTypes.func,
  onSelectAllToggle: PropTypes.func,
  onChangeSearchMode: PropTypes.func,
};
ItemsList.defaultProps = {
  testItems: [],
  selectedItems: [],
  searchMode: SEARCH_MODES.CURRENT_LAUNCH,
  currentLaunch: {},
  currentFilter: null,
  onToggleItemSelect: () => {},
  onSelectAllToggle: () => {},
  onChangeSearchMode: () => {},
};
