import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { commonValidators } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { Input } from 'components/inputs/input';
import { IntegrationFormField } from 'components/integrations/elements';
import { COMMON_BTS_MESSAGES } from 'components/integrations/elements/bts';
import { DEFAULT_FORM_CONFIG } from '../constants';
import { messages } from '../messages';

@injectIntl
export class RallyConnectionFormFields extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
    editAuthMode: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    authEnabled: false,
    lineAlign: false,
    initialData: DEFAULT_FORM_CONFIG,
    editAuthMode: false,
  };

  constructor(props) {
    super(props);
    this.systemAuthTypes = [{ value: 'OAUTH', label: 'ApiKey' }];
  }

  componentDidMount() {
    this.props.initialize(this.props.initialData);
  }

  render() {
    const {
      intl: { formatMessage },
      disabled,
      lineAlign,
      editAuthMode,
    } = this.props;

    return (
      <Fragment>
        <IntegrationFormField
          name="integrationName"
          label={formatMessage(COMMON_BTS_MESSAGES.integrationNameLabel)}
          required
          disabled={disabled}
          lineAlign={lineAlign}
          maxLength="55"
          validate={commonValidators.requiredField}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="url"
          label={formatMessage(COMMON_BTS_MESSAGES.linkToBtsLabel)}
          required
          disabled={disabled || editAuthMode}
          lineAlign={lineAlign}
          validate={commonValidators.btsUrl}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="project"
          label={formatMessage(messages.projectIdLabel)}
          required
          disabled={disabled || editAuthMode}
          lineAlign={lineAlign}
          maxLength="55"
          validate={commonValidators.btsProject}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="authType"
          label={formatMessage(COMMON_BTS_MESSAGES.authTypeLabel)}
          disabled={disabled}
          lineAlign={lineAlign}
        >
          <FieldErrorHint>
            <InputDropdown mobileDisabled options={this.systemAuthTypes} />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="oauthAccessKey"
          label={formatMessage(messages.accessKeyLabel)}
          required
          disabled={disabled}
          lineAlign={lineAlign}
          validate={commonValidators.requiredField}
        >
          <FieldErrorHint>
            <InputTextArea type="text" mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
      </Fragment>
    );
  }
}
