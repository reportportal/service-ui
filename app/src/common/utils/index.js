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
export { isEmptyObject } from './isEmptyObject';
export { referenceDictionary } from './referenceDictionary';
export { fetch, ERROR_CANCELED, ERROR_UNAUTHORIZED } from './fetch';
export {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  updateStorageItem,
  getSessionItem,
  setSessionItem,
  updateSessionItem,
} from './storageUtils';
export {
  getTimeUnits,
  getDuration,
  approximateTimeFormat,
  dateFormat,
  fromNowFormat,
  daysFromNow,
  daysBetween,
  utcOffset,
  getTimestampFromMinutes,
  getMinutesFromTimestamp,
  formatDuration,
} from './timeDateUtils';
export { connectRouter } from './connectRouter';
export { uniqueId } from './uniqueId';
export { fileSizeConverter } from './fileSizeConverter';
export { debounce } from './debounce';
export { arrayRemoveDoubles } from './arrayRemoveDoubles';
export { parseDateTimeRange } from './parseDateTimeRange';
export { getTicketUrlId } from './getTicketUrlId';
export { range } from './range';
export { arrayDiffer } from './arrayDiffer';
export { queueReducers } from './queueReducers';
export { waitForSelector } from './waitForSelector';
export { isEmptyValue } from './isEmptyValue';
export { formatAttribute } from './attributeUtils';
export { createNamespacedActionPredicate } from './createNamespacedActionPredicate';
export { omit } from './omit';
export { calculateFontColor } from './calculateFontColor';
