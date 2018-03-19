import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MemberSearchInput } from './memberSearchInput';
import styles from './membersPageToolbar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  permissionMap: {
    id: 'MembersPage.permissionMap',
    defaultMessage: 'Permission map',
  },
  inviteUser: {
    id: 'MembersPage.inviteUser',
    defaultMessage: 'Invite user',
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
        <FieldProvider name="filter">
          <MemberSearchInput />
        </FieldProvider>
        <div className={cx('members-page-controls')}>
          <GhostButton >
            {this.props.intl.formatMessage(messages.permissionMap)}
          </GhostButton>
          <GhostButton >
            {this.props.intl.formatMessage(messages.inviteUser)}
          </GhostButton>
        </div>
      </div>
    );
  }
}
