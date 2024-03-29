/*
 * Copyright 2020 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
  EXTENSION_LOAD_FINISH,
  EXTENSION_LOAD_START,
  FETCH_EXTENSIONS_METADATA_SUCCESS,
  UPDATE_EXTENSION_METADATA,
} from './constants';

export const extensionLoadStartAction = () => ({
  type: EXTENSION_LOAD_START,
});
export const extensionLoadFinishAction = () => ({
  type: EXTENSION_LOAD_FINISH,
});

export const fetchExtensionsMetadataSuccessAction = (extensionsMetadata) => ({
  type: FETCH_EXTENSIONS_METADATA_SUCCESS,
  payload: extensionsMetadata,
});
export const updateExtensionMetadataAction = (extensionMetadata) => ({
  type: UPDATE_EXTENSION_METADATA,
  payload: extensionMetadata,
});
