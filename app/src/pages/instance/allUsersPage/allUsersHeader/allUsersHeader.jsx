import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { SearchField } from 'components/fields/searchField';
import { MembersPageHeader } from 'pages/organization/common/membersPage/membersPageHeader';
import styles from './allUsersHeader.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  allUsersTitle: {
    id: 'AllUsersPage.title',
    defaultMessage: 'All users',
  },
  searchPlaceholder: {
    id: 'AllUsersPage.searchPlaceholder',
    defaultMessage: 'Search by name',
  },
});

export const AllUsersHeader = ({ isLoading, searchValue, setSearchValue }) => {
  const { formatMessage } = useIntl();

  return (
    <MembersPageHeader title={formatMessage(messages.allUsersTitle)}>
      <div className={cx('actions')}>
        <div className={cx('icons')}>
          <SearchField
            isLoading={isLoading}
            value={searchValue}
            onChange={setSearchValue}
            placeholder={formatMessage(messages.searchPlaceholder)}
          />
        </div>
      </div>
    </MembersPageHeader>
  );
};

AllUsersHeader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string,
  setSearchValue: PropTypes.func,
};

AllUsersHeader.defaultProps = {
  searchValue: null,
  setSearchValue: () => {},
};
