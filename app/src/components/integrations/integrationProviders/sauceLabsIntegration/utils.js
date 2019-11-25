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

import { SAUCE_LABS_DATA_CENTER_ATTRIBUTE_KEY, SAUCE_LABS_ID_ATTRIBUTE_KEY } from './constants';

const getDefaultDataCenter = ({ dataCenters = [''] } = {}) => dataCenters[0];

const getIntegrationDataCenter = (integrations = []) => {
  const integration = integrations[0];
  let dataCenter = '';
  if (integration) {
    dataCenter =
      integration.integrationParameters.dataCenter ||
      getDefaultDataCenter(integration.integrationType.details);
  }

  return dataCenter;
};

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
