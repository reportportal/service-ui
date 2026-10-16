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

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector } from 'controllers/user';
import {
  fetchMarketplaceLicenceAction,
  setMarketplaceLicenceAction,
  deleteMarketplaceLicenceAction,
  isMarketplaceLicenceConfiguredSelector,
  marketplaceLicenceCustomerIdSelector,
  marketplaceLicenceLoadingSelector,
  marketplaceLicenceErrorSelector,
} from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import { useMarketplaceEnabled } from 'hooks/useMarketplaceEnabled';
import { PremiumFeatures } from './premiumFeatures';

export const PremiumFeaturesContainer = () => {
  const dispatch = useDispatch();
  // The licence exists to install premium plugins from the marketplace, so with the marketplace
  // off there is nothing it could unlock. The gate used to sit on the Marketplace tab; it follows
  // the section rather than disappearing with the tab.
  const isMarketplaceEnabled = useMarketplaceEnabled();
  const isAdmin = useSelector(isAdminSelector);
  const configured = useSelector(isMarketplaceLicenceConfiguredSelector);
  const customerId = useSelector(marketplaceLicenceCustomerIdSelector);
  const loading = useSelector(marketplaceLicenceLoadingSelector);
  const error = useSelector(marketplaceLicenceErrorSelector);

  // Whether the *operator* just stored a licence, which is a narrower thing than the store having
  // one. The slice cannot tell the two apart: it is equally "configured" after a save and after
  // the GET on mount, and the success alert must only answer the first.
  const [submitted, setSubmitted] = useState(false);
  const [wasLoading, setWasLoading] = useState(loading);

  useEffect(() => {
    // the endpoint is admin-only, so only an admin asks, and only where the licence can matter
    if (isAdmin && isMarketplaceEnabled) {
      dispatch(fetchMarketplaceLicenceAction());
    }
  }, [dispatch, isAdmin, isMarketplaceEnabled]);

  // loading dropping back is the request answering, and the store writes the answer in the same
  // action — so an error and a stored licence can never both be claimed for one save.
  if (loading !== wasLoading) {
    setWasLoading(loading);
  }

  const saved = submitted && !loading && !error && configured;

  if (!isMarketplaceEnabled) {
    return null;
  }

  return (
    <PremiumFeatures
      isAdmin={isAdmin}
      configured={configured}
      customerId={customerId}
      loading={loading}
      error={error}
      saved={saved}
      onSubmit={(credentials) => {
        setSubmitted(true);
        dispatch(setMarketplaceLicenceAction(credentials));
      }}
      onRemove={() => {
        setSubmitted(false);
        dispatch(deleteMarketplaceLicenceAction());
      }}
      showModal={(modal) => dispatch(showModalAction(modal))}
    />
  );
};
