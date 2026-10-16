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

import { useEffect, useRef, useState } from 'react';
import { noop } from 'es-toolkit';
import Parser from 'html-react-parser';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { useEllipsisTitle } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { getDashboardItemPageLinkSelector } from 'controllers/dashboard/selectors';
import { NavLink } from 'components/main/navLink';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';
import OwnerIcon from 'pages/inside/dashboardPage/img/owner-inline.svg';

import { DashboardActionHandlers, DashboardItem } from '../../../types';
import { DashboardActions } from '../../dashboardActions';
import { DashboardLockedIcon } from '../../dashboardLockedIcon';

import styles from './dashboardGridItem.scss';

const cx = createClassnames(styles);

// same idea as the ui-kit useEllipsisTitle, but for a text cut by -webkit-line-clamp (the overflow is vertical)
const useLineClampTitle = (content?: string) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [title, setTitle] = useState<string | undefined>();

  useEffect(() => {
    const element = ref.current;

    if (!element || !content) {
      return undefined;
    }

    const checkOverflow = () =>
      setTitle(element.scrollHeight > element.clientHeight ? content : undefined);

    checkOverflow();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(checkOverflow);

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [content]);

  return { ref, title: content ? title : undefined };
};

interface DashboardGridItemProps extends DashboardActionHandlers {
  item: DashboardItem;
}

export const DashboardGridItem = ({
  item,
  onEdit = noop,
  onDelete = noop,
  onDuplicate = noop,
}: DashboardGridItemProps) => {
  const { trackEvent } = useTracking();
  const getDashboardItemPageLink = useSelector(getDashboardItemPageLinkSelector);
  const { id, name, description, owner, locked } = item;
  const { ref: nameRef, title: nameTitle } = useEllipsisTitle<HTMLSpanElement>(name);
  const { ref: descriptionRef, title: descriptionTitle } = useLineClampTitle(description);
  const { ref: ownerRef, title: ownerTitle } = useEllipsisTitle<HTMLSpanElement>(owner);

  const dashboardLink = getDashboardItemPageLink(id);

  return (
    <div className={cx('dashboard-card')}>
      <div className={cx('dashboard-card__header')}>
        <div className={cx('dashboard-card__name-cell')}>
          <NavLink
            to={dashboardLink}
            className={cx('dashboard-card__name')}
            onClick={() => trackEvent(DASHBOARD_EVENTS.clickOnDashboardName(id))}
          >
            <span ref={nameRef} title={nameTitle} className={cx('dashboard-card__name-text')}>
              {name}
            </span>
          </NavLink>
          {locked && (
            <LockedDashboardTooltip locked={locked}>
              <DashboardLockedIcon className={cx('dashboard-card__locked')} />
            </LockedDashboardTooltip>
          )}
        </div>
        <DashboardActions
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      </div>
      {/* description and owner are links above the card overlay link, so they can show their own tooltip */}
      <NavLink to={dashboardLink} tabIndex={-1} className={cx('dashboard-card__text-link')}>
        <p
          ref={descriptionRef}
          title={descriptionTitle}
          className={cx('dashboard-card__description')}
        >
          {description}
        </p>
      </NavLink>
      <div className={cx('dashboard-card__owner')}>
        <i className={cx('dashboard-card__owner-icon')}>{Parser(String(OwnerIcon))}</i>
        <NavLink to={dashboardLink} tabIndex={-1} className={cx('dashboard-card__text-link')}>
          <span ref={ownerRef} title={ownerTitle} className={cx('dashboard-card__owner-name')}>
            {owner}
          </span>
        </NavLink>
      </div>
    </div>
  );
};
