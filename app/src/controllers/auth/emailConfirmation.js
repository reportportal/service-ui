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

export const CONFIRM_EMAIL_QUERY_PARAM = 'confirmEmail';

/**
 * Extracts the email confirmation uuid from a query object (or from a router action).
 * Returns an empty string when the parameter is absent or is not a non-empty string.
 */
export const getConfirmEmailUuid = (queryOrAction) => {
  const source = queryOrAction || {};
  const query = source.query || source.meta?.query || source.payload?.query || source;
  const value = query[CONFIRM_EMAIL_QUERY_PARAM];

  return typeof value === 'string' ? value.trim() : '';
};
