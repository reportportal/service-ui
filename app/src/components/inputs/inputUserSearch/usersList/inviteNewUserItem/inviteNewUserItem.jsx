/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './inviteNewUserItem.scss';

const cx = classNames.bind(styles);

export const InviteNewUserItem = ({ option, onClick }) => (
  <div className={cx('select-menu-outer')}>
    <div className={cx('select-menu')} role="listbox">
      <div onClick={onClick}>
        <div className={cx('invite-new-user')}>
          <div className={cx('msg-icon')} />
          <div className={cx('invite-info')}>
            <p className={cx('user-info')}>
              <FormattedMessage
                id={'InputUserSearch.inviteNewUser'}
                defaultMessage={'Invite {userEmail}'}
                values={{ userEmail: option.label }}
              />
            </p>
            <p className={cx('action-info')}>
              <FormattedMessage
                id={'InputUserSearch.inviteNewUserInfo'}
                defaultMessage={'Send invite via e-mail'}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

InviteNewUserItem.propTypes = {
  option: PropTypes.object,
  onClick: PropTypes.func,
};
InviteNewUserItem.defaultProps = {
  option: {},
  onClick: () => {},
};
