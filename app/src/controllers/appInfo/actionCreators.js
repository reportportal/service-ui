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

import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import {
  APP_INFO_NAMESPACE,
  UPDATE_EXPIRATION_SESSION,
  UPDATE_SERVER_FOOTER_LINKS,
  UPDATE_SERVER_SETTINGS,
  UPDATE_SERVER_SETTINGS_SUCCESS,
} from './constants';

export const fetchAppInfoAction = () =>
  fetchDataAction(APP_INFO_NAMESPACE, true)(URLS.appInfo(), {
    headers: { Authorization: undefined },
  });

export const updateServerSettingsAction = (settings) => ({
  type: UPDATE_SERVER_SETTINGS,
  payload: settings,
});

export const updateServerSettingsSuccessAction = (settings) => ({
  type: UPDATE_SERVER_SETTINGS_SUCCESS,
  payload: settings,
});

export const updateExpirationSessionAction = ({ expiration, onSuccess = () => {} }) => ({
  type: UPDATE_EXPIRATION_SESSION,
  payload: { expiration, onSuccess },
});

export const updateServerFooterLinksAction = (footerLinks, onSuccess = () => {}) => ({
  type: UPDATE_SERVER_FOOTER_LINKS,
  payload: { footerLinks, onSuccess },
});
