import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import {
  allUsersSelector,
  allUsersPaginationSelector,
  loadingSelector,
} from 'controllers/administrate/allUsers';
import { EXPORT, INVITE_USER, ADD_USER } from 'common/constants/allUsersActions';
import { GhostButton } from 'components/buttons/ghostButton';
import ExportIcon from 'common/img/export-inline.svg';
import InviteUserIcon from 'common/img/ic-invite-inline.svg';
import AddUserIcon from 'common/img/ic-add-user-inline.svg';
import styles from './allUsersPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [EXPORT]: {
    id: 'AllUsersPage.export',
    defaultMessage: 'Export',
  },
  [INVITE_USER]: {
    id: 'AllUsersPage.inviteUser',
    defaultMessage: 'Invite user',
  },
  [ADD_USER]: {
    id: 'AllUsersPage.AddUser',
    defaultMessage: 'Add user',
  },
});

const titleMessage = defineMessages({
  pageTitle: {
    id: 'AdminSidebar.allUsers',
    defaultMessage: 'All users',
  },
});

const HEADER_BUTTONS = [
  {
    key: EXPORT,
    icon: ExportIcon,
  },
  {
    key: INVITE_USER,
    icon: InviteUserIcon,
  },
  {
    key: ADD_USER,
    icon: AddUserIcon,
  },
];

@connect((state) => ({
  url: URLS.allUsers(state),
  allUsers: allUsersSelector(state),
  loading: loadingSelector(state),
}))
@withPagination({
  paginationSelector: allUsersPaginationSelector,
})
@injectIntl
export class AllUsersPage extends Component {
  static propTypes = {
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    showModalAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    loading: PropTypes.bool,
    allUsers: PropTypes.arrayOf(PropTypes.object),
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    sortingColumn: null,
    sortingDirection: null,
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    loading: false,
    allUsers: [],
  };

  getBreadcrumbs = () => [
    {
      title: this.props.intl.formatMessage(titleMessage.pageTitle),
    },
  ];

  renderHeaderButtons = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <div className={cx('header-buttons')}>
        {HEADER_BUTTONS.map(({ key, icon }) => (
          <GhostButton color={key === EXPORT ? 'gray-91' : 'topaz'} key={key} icon={icon}>
            {formatMessage(messages[key])}
          </GhostButton>
        ))}
      </div>
    );
  };

  render() {
    const {
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
    } = this.props;
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          {this.renderHeaderButtons()}
          {!!pageCount &&
            !loading && (
              <PaginationToolbar
                activePage={activePage}
                itemCount={itemCount}
                pageCount={pageCount}
                pageSize={pageSize}
                onChangePage={onChangePage}
                onChangePageSize={onChangePageSize}
              />
            )}
        </PageSection>
      </PageLayout>
    );
  }
}
