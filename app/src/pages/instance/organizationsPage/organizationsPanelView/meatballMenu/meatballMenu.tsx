/*!
 * Copyright 2025 EPAM Systems
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

import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { useIntl } from 'react-intl';
import { Button, MeatballMenuIcon, Popover } from '@reportportal/ui-kit';
import { messages } from '../../messages';
import styles from './meatballMenu.scss';

const cx = classNames.bind(styles);

export const MeatballMenu = ({ organizationSlug }) => {
  const { formatMessage } = useIntl();

  return (
    <Popover
      placement={'bottom-end'}
      content={
        <div className={cx('meatball-menu')}>
          <Link
            to={{
              type: 'ORGANIZATIONS_ACTIVITY_PAGE',
              payload: { organizationSlug },
            }}
            className={cx('option-link')}
          >
            <span>{formatMessage(messages.activity)}</span>
          </Link>
        </div>
      }
    >
      <i className={cx('menu-icon')}>
        <MeatballMenuIcon />
      </i>
    </Popover>
  );
};
