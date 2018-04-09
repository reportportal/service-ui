import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputSearch } from 'components/inputs/inputSearch';
import PermissionMapIcon from './img/ic_premission-inline.svg';
import InviteUserIcon from './img/ic_invite-inline.svg';
import styles from './membersPageToolbar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  permissionMap: {
    id: 'MembersPageToolbar.permissionMap',
    defaultMessage: 'Permission map',
  },
  inviteUser: {
    id: 'MembersPageToolbar.inviteUser',
    defaultMessage: 'Invite user',
  },
  searchInputPlaceholder: {
    id: 'MembersPageToolbar.searchByName',
    defaultMessage: 'Search by name',
  },
});
@connect(null, {
  showModalAction,
})
@reduxForm({
  form: 'filterSearch',
  onChange: (vals, dispatch, props) => {
    props.onFilterChange(vals.filter || undefined);
  },
})
@injectIntl
export class MembersPageToolbar extends React.Component {
  static propTypes = {
    change: PropTypes.func,
    intl: intlShape,
    filter: PropTypes.string,
    showModalAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    intl: {},
    filter: PropTypes.string,
    change: () => {},
    showModalAction: () => {},
  };

  componentDidMount() {
    this.props.change('filter', this.props.filter);
  }

  componentWillReceiveProps({ filter }) {
    if (filter !== this.props.filter) {
      this.props.change('filter', filter);
    }
  }

  render() {
    return (
      <div className={cx('members-page-toolbar')}>
        <div className={cx('search-input')}>
          <FieldProvider name="filter">
            <InputSearch
              maxLength="128"
              placeholder={this.props.intl.formatMessage(messages.searchInputPlaceholder)}
            />
          </FieldProvider>
        </div>
        <div className={cx('members-page-controls')}>
          <GhostButton icon={PermissionMapIcon}>
            {this.props.intl.formatMessage(messages.permissionMap)}
          </GhostButton>
          <GhostButton icon={InviteUserIcon}>
            {this.props.intl.formatMessage(messages.inviteUser)}
          </GhostButton>
        </div>
      </div>
    );
  }
}
