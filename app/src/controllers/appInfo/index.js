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

export { appInfoReducer } from './reducer';
export {
  fetchAppInfoAction,
  updateServerSettingsAction,
  updateServerSettingsSuccessAction,
  updateExpirationSessionAction,
  updateServerFooterLinksAction,
} from './actionCreators';
export {
  appInfoSelector,
  apiBuildVersionSelector,
  uiBuildVersionSelector,
  authExtensionsSelector,
  instanceIdSelector,
  analyticsEnabledSelector,
  analyzerExtensionsSelector,
  isOldHistorySelector,
  flushDataInSelector,
  isDemoInstanceSelector,
  instanceTypeSelector,
  areUserSuggestionsAllowedSelector,
  baseEventParametersSelector,
  ssoUsersOnlySelector,
  sessionExpirationTimeSelector,
  serverFooterLinksSelector,
} from './selectors';
export { serverSettingsSagas } from './sagas';
export {
  ANALYTICS_ALL_KEY,
  SERVER_SESSION_EXPIRATION_KEY,
  SERVER_FOOTER_LINKS_KEY,
  UPDATE_SERVER_SETTINGS_SUCCESS,
} from './constants';
