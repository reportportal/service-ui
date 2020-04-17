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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { commonValidators } from 'common/utils/validation';
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { IntegrationFormField } from 'components/integrations/elements';

const messages = defineMessages({
  userNameTitle: {
    id: 'SauceLabsFormFields.userNameTitle',
    defaultMessage: 'User name',
  },
  accessTokenTitle: {
    id: 'SauceLabsFormFields.accessTokenTitle',
    defaultMessage: 'Access token',
  },
  dataCenter: {
    id: 'SauceLabsFormFields.dataCenter',
    defaultMessage: 'Data center',
  },
});

@injectIntl
export class SauceLabsFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
    pluginDetails: PropTypes.object,
    updateMetaData: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    lineAlign: false,
    initialData: {},
    pluginDetails: {
      dataCenters: [],
    },
    updateMetaData: () => {},
  };

  constructor(props) {
    super(props);
    const {
      pluginDetails: { dataCenters = [] },
    } = props;
    this.dataCenterOptions = dataCenters.map((value) => ({ value, label: value }));
  }

  componentDidMount() {
    const {
      initialize,
      initialData,
      pluginDetails: { dataCenters = [] },
    } = this.props;
    const data = {
      dataCenter: dataCenters[0],
      ...initialData,
    };

    initialize(data);
    this.props.updateMetaData({
      [SECRET_FIELDS_KEY]: ['accessToken'],
    });
  }

  render() {
    const {
      intl: { formatMessage },
      disabled,
      lineAlign,
    } = this.props;

    return (
      <Fragment>
        <IntegrationFormField
          name="username"
          disabled={disabled}
          label={formatMessage(messages.userNameTitle)}
          validate={commonValidators.requiredField}
          lineAlign={lineAlign}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="accessToken"
          disabled={disabled}
          label={formatMessage(messages.accessTokenTitle)}
          validate={commonValidators.requiredField}
          lineAlign={lineAlign}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="dataCenter"
          disabled={disabled}
          label={formatMessage(messages.dataCenter)}
          lineAlign={lineAlign}
        >
          <InputDropdown options={this.dataCenterOptions} mobileDisabled />
        </IntegrationFormField>
      </Fragment>
    );
  }
}
