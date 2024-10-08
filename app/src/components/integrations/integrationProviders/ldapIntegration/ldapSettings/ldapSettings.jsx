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
import { useDispatch } from 'react-redux';
import { IntegrationSettings } from 'components/integrations/elements';
import { showModalAction } from 'controllers/modal';
import { LdapFormFields } from '../ldapFormFields';

export const LdapSettings = ({ data, goToPreviousPage, onUpdate, isGlobal }) => {
  const dispatch = useDispatch();

  const openEditModal = () => {
    dispatch(
      showModalAction({
        id: 'addLdapIntegrationModal',
        data: {
          onConfirm: onUpdate,
          instanceType: data.name,
          isGlobal,
          initialData: data.integrationParameters,
          customProps: {
            isEdit: true,
          },
        },
      }),
    );
  };

  return (
    <IntegrationSettings
      data={data}
      onUpdate={onUpdate}
      goToPreviousPage={goToPreviousPage}
      isGlobal={isGlobal}
      formFieldsComponent={LdapFormFields}
      preventTestConnection
      isEditable
      editAuthConfig={{ onClick: openEditModal }}
    />
  );
};
LdapSettings.propTypes = {
  data: PropTypes.object.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isGlobal: PropTypes.bool,
};
LdapSettings.defaultProps = {
  isGlobal: false,
};
