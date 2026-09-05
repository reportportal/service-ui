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
import { isAdminSelector } from 'controllers/user';
import {
  fetchMarketplaceLicenceAction,
  setMarketplaceLicenceAction,
  deleteMarketplaceLicenceAction,
  isMarketplaceLicenceConfiguredSelector,
  marketplaceLicenceCustomerIdSelector,
  marketplaceLicenceLoadingSelector,
} from 'controllers/plugins';
import { MarketplaceLicence } from './marketplaceLicence';

export const MarketplaceTab = () => {
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const configured = useSelector(isMarketplaceLicenceConfiguredSelector);
  const customerId = useSelector(marketplaceLicenceCustomerIdSelector);
  const loading = useSelector(marketplaceLicenceLoadingSelector);

  useEffect(() => {
    // the endpoint is admin-only, so only an admin asks
    if (isAdmin) {
      dispatch(fetchMarketplaceLicenceAction());
    }
  }, [dispatch, isAdmin]);

  return (
    <MarketplaceLicence
      isAdmin={isAdmin}
      configured={configured}
      customerId={customerId}
      loading={loading}
      onSubmit={(credentials) => dispatch(setMarketplaceLicenceAction(credentials))}
      onRemove={() => dispatch(deleteMarketplaceLicenceAction())}
    />
  );
};
