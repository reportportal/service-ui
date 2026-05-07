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

import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { getTmsOverride } from 'controllers/appInfo/utils';
import { PROJECT_DASHBOARD_PAGE } from 'controllers/pages/constants';
import { payloadSelector, urlOrganizationAndProjectSelector } from 'controllers/pages';

import { ProductVersionPage } from 'pages/inside/productVersionPage';
import { ProductVersionsPageContent } from './productVersionsPageContent';

export const ProductVersionsPage = () => {
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const { productVersionId } = useSelector(payloadSelector);
  const isShowInProgressTmsFeatures = Boolean(getTmsOverride());

  useEffect(() => {
    if (!isShowInProgressTmsFeatures) {
      dispatch({
        type: PROJECT_DASHBOARD_PAGE,
        payload: { organizationSlug, projectSlug },
      });
    }
  }, [dispatch, isShowInProgressTmsFeatures, organizationSlug, projectSlug]);

  if (!isShowInProgressTmsFeatures) {
    return null;
  }

  if (productVersionId) {
    return <ProductVersionPage productVersionId={productVersionId} />;
  }

  return <ProductVersionsPageContent />;
};
