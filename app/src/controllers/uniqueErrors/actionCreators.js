/*
 * Copyright 2021 EPAM Systems
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

import { FETCH_CLUSTERS, RELOAD_CLUSTERS, SET_PAGE_LOADING } from './constants';

export const fetchClustersAction = (payload) => ({
  type: FETCH_CLUSTERS,
  payload,
});

export const reloadClusterAction = () => ({
  type: RELOAD_CLUSTERS,
});

export const setPageLoadingAction = (isLoading) => ({
  type: SET_PAGE_LOADING,
  payload: isLoading,
});
