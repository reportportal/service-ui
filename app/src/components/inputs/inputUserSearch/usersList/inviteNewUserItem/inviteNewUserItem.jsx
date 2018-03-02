import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './inviteNewUserItem.scss';

const cx = classNames.bind(styles);

export const InviteNewUserItem = ({ option, selectValue }) => (
  <div className={'select-menu-outer'}>
    <div className={'select-menu'} role="listbox">
      <div
        onClick={() => selectValue(option)}
      >
        <div className={cx('invite-new-user')}>
          <div className={cx('msg-icon')} />
          <div className={cx('invite-info')}>
            <p className={cx('user-info')} >
              <FormattedMessage id={'InputUserSearch.inviteNewUser'} defaultMessage={'Invite {userEmail}'} values={{ userEmail: option.label }} />
            </p>
            <p className={cx('action-info')}>
              <FormattedMessage id={'InputUserSearch.inviteNewUserInfo'} defaultMessage={'Send invite via e-mail'} />
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
    );

InviteNewUserItem.propTypes = {
  option: PropTypes.object,
  selectValue: PropTypes.func,
};
InviteNewUserItem.defaultProps = {
  option: {},
  selectValue: () => {},
};
