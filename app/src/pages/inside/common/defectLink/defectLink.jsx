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

import { connect } from 'react-redux';
import track from 'react-tracking';
import Link from 'redux-first-router-link';
import { defectLinkSelector, setPageLoadingAction } from 'controllers/testItem';

export const DefectLink = track()(
  connect(
    (state) => ({
      getDefectLink: defectLinkSelector(state),
    }),
    {
      refreshTestItemPage: () => setPageLoadingAction(true),
    },
  )((props) => {
    const {
      itemId,
      getDefectLink,
      children,
      defects,
      eventInfo,
      listViewLinkParams,
      target,
      tracking,
      ownLinkParams,
      keepFilterParams,
      refreshTestItemPage,
      ...rest
    } = props;
    const params = { ...listViewLinkParams, ...props };

    return (
      <Link
        to={getDefectLink(params)}
        target={target}
        {...rest}
        onClick={() => {
          eventInfo && tracking.trackEvent(eventInfo);
          refreshTestItemPage();
        }}
      >
        {children}
      </Link>
    );
  }),
);
