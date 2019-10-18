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

import {
  SAUCE_LABS_DATA_CENTER_ATTRIBUTE_KEY,
  SAUCE_LABS_ID_ATTRIBUTE_KEY,
  DEFAULT_DATA_CENTER,
} from './constants';

const getIntegrationDataCenter = (
  integrations = [{ integrationParameters: { dataCenter: DEFAULT_DATA_CENTER } }],
) => (integrations[0] && integrations[0].integrationParameters.dataCenter) || DEFAULT_DATA_CENTER;

export const getSauceLabsConfig = (attributes = [], integrations) => {
  const slidItem =
    attributes && attributes.find((item) => item.key === SAUCE_LABS_ID_ATTRIBUTE_KEY);
  if (slidItem) {
    const sldcItem = attributes.find((item) => item.key === SAUCE_LABS_DATA_CENTER_ATTRIBUTE_KEY);
    const dataCenter = sldcItem ? sldcItem.value : getIntegrationDataCenter(integrations);

    return {
      jobId: slidItem.value,
      dataCenter,
    };
  }
  return null;
};
