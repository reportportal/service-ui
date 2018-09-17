import React, { Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';

import { InputSearch } from 'components/inputs/inputSearch';
import { GhostButton } from 'components/buttons/ghostButton';

import styles from './filtersHeader.scss';
import AddFilterIcon from './img/ic-add-filter-inline.svg';

const cx = classNames.bind(styles);
const messages = defineMessages({
    addFilter: {
    id: 'FiltersPage.addFilter',
    defaultMessage: 'Add filter',
  },
  searchInputPlaceholder: {
    id: 'FiltersPage.searchByName',
    defaultMessage: 'Search filter by name',
  },
});

@injectIntl
export class FiltersHeader extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('filters-header')}>
        <div className={cx('filters-input')}>
          <InputSearch placeholder={intl.formatMessage(messages.searchInputPlaceholder)} />
        </div>
        <GhostButton icon={AddFilterIcon} title={intl.formatMessage(messages.addFilter)}>
          {intl.formatMessage(messages.addFilter)}
        </GhostButton>
      </div>
    );
  }
}
