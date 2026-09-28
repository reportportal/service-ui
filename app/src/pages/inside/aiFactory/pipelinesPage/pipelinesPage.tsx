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

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';

import { PipelinesPageContent } from './pipelinesPageContent';

/**
 * Toggle OFF must leave the product unchanged (03-frontend-architecture.md §3): a direct link to
 * this route redirects to the project dashboard instead of rendering, the same way
 * `productVersionsPage.jsx` redirects for `getTmsOverride()`.
 */
export const PipelinesPage = () => {
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const isEnabled = useAiFactoryEnabled();

  useEffect(() => {
    if (!isEnabled) {
      dispatch({ type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } });
    }
  }, [dispatch, isEnabled, organizationSlug, projectSlug]);

  if (!isEnabled) {
    return null;
  }

  return <PipelinesPageContent />;
};
