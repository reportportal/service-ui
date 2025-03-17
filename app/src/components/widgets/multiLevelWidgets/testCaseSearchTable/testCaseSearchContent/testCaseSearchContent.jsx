/*
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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { WIDGETS_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { activeDashboardIdSelector } from 'controllers/pages';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';
import { StepGrid } from 'pages/inside/stepPage/stepGrid';
import { Button } from '@reportportal/ui-kit';
import React from 'react';
import styles from './testCaseSearchContent.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);
export const TestCaseSearchContent = ({
  isEmptyState,
  data,
  listView,
  loading,
  sortingDirection,
  onChangeSorting,
  onLoadMore,
}) => {
  const { formatMessage } = useIntl();
  const dashboardId = useSelector(activeDashboardIdSelector);
  const targetEvents = {
    CLICK_ITEM_NAME: WIDGETS_EVENTS.clickOnSearchedItemName(dashboardId),
    onClickIssueTicketEvent: WIDGETS_EVENTS.clickOnIssueTicket(dashboardId),
    clickOnExpandAccordion: WIDGETS_EVENTS.clickOnExpandDescription(dashboardId),
  };
  return (
    <ScrollWrapper>
      {isEmptyState ? (
        <div className={cx('content')}>
          <p className={cx('title')}>{formatMessage(messages.letsSearch)}</p>
          <p className={cx('description')}>{formatMessage(messages.provideParameters)}</p>
        </div>
      ) : (
        <div className={cx('test-case-grid-wrapper')}>
          <StepGrid
            data={data}
            listView={listView}
            isTestSearchView
            onChangeSorting={onChangeSorting}
            sortingDirection={sortingDirection}
            sortingColumn={ENTITY_START_TIME}
            loading={loading}
            events={targetEvents}
          />
          {onLoadMore && (
            <Button className={cx('load-more')} variant={'ghost'} onClick={onLoadMore}>
              {formatMessage(messages.loadMore)}
            </Button>
          )}
        </div>
      )}
    </ScrollWrapper>
  );
};

TestCaseSearchContent.propTypes = {
  isEmptyState: PropTypes.bool,
  data: PropTypes.array,
  listView: PropTypes.bool,
  loading: PropTypes.bool,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  onLoadMore: PropTypes.func,
};
