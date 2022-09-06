/*
 * Copyright 2022 EPAM Systems
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

import PropTypes from 'prop-types';
import { ConnectionSection } from 'components/integrations/elements/integrationSettings/connectionSection';
import { IntegrationForm } from 'components/integrations/elements/integrationSettings/integrationForm';

export const IntegrationSetting = ({
  blocked,
  data,
  onRemoveIntegration,
  connected,
  editAuthConfig,
  pluginName,
  form,
  onSubmit,
  formFieldsComponent,
  isEmptyConfiguration,
}) => {
  return (
    <>
      <ConnectionSection
        blocked={blocked}
        data={data}
        onRemoveIntegration={onRemoveIntegration}
        connected={connected}
        editAuthConfig={editAuthConfig}
        pluginName={pluginName}
      />
      {pluginName && (
        <IntegrationForm
          form={form}
          data={data}
          connected={connected}
          pluginName={pluginName}
          onSubmit={onSubmit}
          formFieldsComponent={formFieldsComponent}
          isEmptyConfiguration={isEmptyConfiguration}
        />
      )}
    </>
  );
};

IntegrationSetting.propTypes = {
  blocked: PropTypes.bool,
  data: PropTypes.object.isRequired,
  onRemoveIntegration: PropTypes.func,
  connected: PropTypes.bool,
  editAuthConfig: PropTypes.object,
  pluginName: PropTypes.string,
  form: PropTypes.string,
  onSubmit: PropTypes.func,
  formFieldsComponent: PropTypes.object,
  isEmptyConfiguration: PropTypes.bool,
};

IntegrationSetting.defaultProps = {
  blocked: false,
  onRemoveIntegration: () => {},
  connected: true,
  editAuthConfig: {},
  pluginName: '',
  form: '',
  onSubmit: () => {},
  formFieldsComponent: {},
  isEmptyConfiguration: false,
};
