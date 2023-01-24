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

import PropTypes from 'prop-types';
import { IntegrationSettings } from 'components/integrations/elements';
import { EmailFormFields } from '../emailFormFields';

export const EmailSettings = ({ data, goToPreviousPage, goToInitialPage, onUpdate, isGlobal }) => (
  <IntegrationSettings
    data={data}
    onUpdate={onUpdate}
    goToPreviousPage={goToPreviousPage}
    goToInitialPage={goToInitialPage}
    isGlobal={isGlobal}
    formFieldsComponent={EmailFormFields}
  />
);

EmailSettings.propTypes = {
  data: PropTypes.object.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  goToInitialPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isGlobal: PropTypes.bool,
};
EmailSettings.defaultProps = {
  isGlobal: false,
};
