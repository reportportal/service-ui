/*
 * Copyright 2026 EPAM Systems
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

import { ReactElement } from 'react';
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { NavLink } from 'components/main/navLink';
import { urlOrganizationSlugSelector, urlProjectSlugSelector } from 'controllers/pages';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { createClassnames } from 'common/utils/createClassnames';
import ExploreCloudIcon from 'common/img/sidebar/explore-cloud-icon-inline.svg';
import { getExploreCloudPageLink } from '../getExploreCloudPageLink';
import { messages } from '../messages';
import styles from './exploreCloudVersionControl.scss';

const cx = createClassnames(styles);

interface ExploreCloudVersionControlProps {
  getIsSidebarCollapsed: () => boolean;
}

export const ExploreCloudVersionControl = ({
  getIsSidebarCollapsed,
}: ExploreCloudVersionControlProps): ReactElement => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const link = getExploreCloudPageLink(organizationSlug, projectSlug);

  return (
    <NavLink
      to={link}
      className={cx('explore-cloud-control')}
      activeClassName={cx('active')}
      onClick={() => {
        trackEvent(
          SIDEBAR_EVENTS.CLICK_EXPLORE_CLOUD_VERSION({
            isSidebarCollapsed: getIsSidebarCollapsed(),
          }),
        );
      }}
      data-automation-id="exploreCloudVersionSidebarLink"
    >
      <span className={cx('icon-block')}>
        <i>{Parser(ExploreCloudIcon)}</i>
      </span>
      <span className={cx('preview')}>
        <span className={cx('title')}>{formatMessage(messages.exploreCloudVersion)}</span>
      </span>
    </NavLink>
  );
};
