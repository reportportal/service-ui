import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptyPageState } from 'pages/common';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { loadingSelector, allUsersSelector } from 'controllers/instance/allUsers';
import classNames from 'classnames/bind';
import { AllUsersHeader } from './allUsersHeader';
import { AllUsersListTable } from './allUsersListTable';
import styles from './allUsersPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noResultsDescription: {
    id: 'AllUsersPage.noResultsDescription',
    defaultMessage: 'No users found for your search',
  },
});

export const AllUsersPage = () => {
  const { formatMessage } = useIntl();
  const users = useSelector(allUsersSelector);
  const isLoading = useSelector(loadingSelector);
  const [searchValue, setSearchValue] = useState(null);

  return (
    <ScrollWrapper>
      <div className={cx('all-users-page')}>
        <AllUsersHeader
          isLoading={isLoading}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        {users.length === 0 && !isLoading ? (
          <EmptyPageState
            label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
            description={formatMessage(messages.noResultsDescription)}
            emptyIcon={NoResultsIcon}
          />
        ) : (
          <AllUsersListTable users={users} />
        )}
      </div>
    </ScrollWrapper>
  );
};
