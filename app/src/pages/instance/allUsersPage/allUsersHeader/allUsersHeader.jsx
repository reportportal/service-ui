import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { MeatballMenuIcon, FilterOutlineIcon, Button } from '@reportportal/ui-kit';
import { SearchField } from 'components/fields/searchField';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import ExportIcon from 'common/img/export-inline.svg';
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
  export: {
    id: 'AllUsersPage.export',
    defaultMessage: 'Export',
  },
  invite: {
    id: 'AllUsersPage.invite',
    defaultMessage: 'Invite user',
  },
});

export const AllUsersHeader = ({ isLoading, searchValue, setSearchValue, onExport, onInvite }) => {
  const { formatMessage } = useIntl();
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);

  return (
    <div className={cx('all-users-header-container')}>
      <div className={cx('header')}>
        <span className={cx('title')}>{formatMessage(messages.allUsersTitle)}</span>
        <div className={cx('actions')}>
          <div className={cx('icons')}>
            <SearchField
              isLoading={isLoading}
              value={searchValue}
              onChange={setSearchValue}
              placeholder={formatMessage(messages.searchPlaceholder)}
            />
            <i className={cx('filter-icon')}>
              <FilterOutlineIcon />
            </i>
            <GhostButton icon={ExportIcon} onClick={onExport}>
              {formatMessage(messages.export)}
            </GhostButton>
            {!ssoUsersOnly && (
              <Button variant="ghost" onClick={onInvite}>
                {formatMessage(messages.invite)}
              </Button>
            )}
            <Button variant="ghost" onClick={() => {}} className={cx('meatball-button')}>
              <MeatballMenuIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

AllUsersHeader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string,
  setSearchValue: PropTypes.func.isRequired,
  onExport: PropTypes.func,
  onInvite: PropTypes.func,
};

AllUsersHeader.defaultProps = {
  searchValue: '',
  onExport: () => {},
  onInvite: () => {},
};
