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

import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { MeatballMenuIcon, Popover } from '@reportportal/ui-kit';
import { setActiveOrganizationAction } from 'controllers/organization/actionCreators';
import { canSeeActivityOption } from 'common/utils/permissions';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { ORGANIZATIONS_ACTIVITY_PAGE, userRolesSelector } from 'controllers/pages';
import { messages } from '../../messages';
import styles from './meatballMenu.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface Organization {
  slug: string;
}

interface MeatballMenuProps {
  organization: Organization;
}

export const MeatballMenu = ({ organization }: MeatballMenuProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const userRoles = useSelector(userRolesSelector);

  const handleClick = (elementName: string) => {
    dispatch(setActiveOrganizationAction(organization));
    trackEvent(ORGANIZATION_PAGE_EVENTS.meatballMenu(elementName));
  };

  return (
    <Popover
      placement={'bottom-end'}
      content={
        <div className={cx('meatball-menu')}>
          {canSeeActivityOption(userRoles) && (
            <Link
              to={{
                type: ORGANIZATIONS_ACTIVITY_PAGE,
                payload: { organizationSlug: organization?.slug },
              }}
              className={cx('option-link')}
              onClick={() => handleClick('activity_menu')}
            >
              <span>{formatMessage(messages.activity)}</span>
            </Link>
          )}
        </div>
      }
    >
      <i className={cx('menu-icon')}>
        <MeatballMenuIcon />
      </i>
    </Popover>
  );
};
