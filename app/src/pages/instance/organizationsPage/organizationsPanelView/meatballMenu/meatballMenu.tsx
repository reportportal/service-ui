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
import { MeatballMenuIcon, Popover } from '@reportportal/ui-kit';
import { setActiveOrganizationAction } from 'controllers/organization/actionCreators';
import { ORGANIZATIONS_ACTIVITY_PAGE } from 'controllers/pages';
import { messages } from '../../messages';
import styles from './meatballMenu.scss';
import { useDispatch } from 'react-redux';

const cx = classNames.bind(styles) as typeof classNames;

interface Organization {
  slug: string;
}

interface MeatballMenuProps {
  organization: Organization;
}

export const MeatballMenu = ({ organization }: MeatballMenuProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  return (
    <Popover
      placement={'bottom-end'}
      content={
        <div className={cx('meatball-menu')}>
          <Link
            to={{
              type: ORGANIZATIONS_ACTIVITY_PAGE,
              payload: { organizationSlug: organization?.slug },
            }}
            className={cx('option-link')}
            onClick={() => dispatch(setActiveOrganizationAction(organization))}
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
