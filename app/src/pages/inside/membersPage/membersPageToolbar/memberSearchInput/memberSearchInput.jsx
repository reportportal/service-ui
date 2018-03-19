import { Fragment } from 'react';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { Input } from 'components/inputs/input';
import SearchIcon from './img/ic-search-inline.svg';
import styles from './memberSearchInput.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  searchInputPlaceholder: { id: 'MembersPage.searchByName', defaultMessage: 'Search by name' },
});

export const MemberSearchInput = injectIntl(({ intl, ...rest }) => (
  <div className={cx('search-input')}>
    <SearchInputWithIcon
      {...rest}
      placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
      hasRightIcon
    />
  </div>
));

const SearchInputWithIcon = props => (
  <Fragment>
    <Input
      {...props}
    />
    <div className={cx('search-icon')}>
      {Parser(SearchIcon)}
    </div>
  </Fragment>
);
