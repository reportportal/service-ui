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

import {
  ADD_EXPORT,
  CANCEL_EXPORTS,
  REMOVE_EXPORT,
  RESET_EXPORTS,
  SET_EXPORTS_BANNER_VARIANT,
  RESET_EXPORTS_BANNER_VARIANT,
} from './constants';

export const addExportAction = ({ id, cancelRequest, eventsInfo = {} }) => ({
  type: ADD_EXPORT,
  payload: { id, cancelRequest, eventsInfo },
});

export const removeExportAction = (id) => ({
  type: REMOVE_EXPORT,
  payload: id,
});

export const resetExportsAction = () => ({
  type: RESET_EXPORTS,
});

export const setExportsBannerVariantAction = (variant) => ({
  type: SET_EXPORTS_BANNER_VARIANT,
  payload: variant,
});

export const resetExportsBannerVariantAction = () => ({
  type: RESET_EXPORTS_BANNER_VARIANT,
});

export const cancelExportsAction = () => ({
  type: CANCEL_EXPORTS,
});
