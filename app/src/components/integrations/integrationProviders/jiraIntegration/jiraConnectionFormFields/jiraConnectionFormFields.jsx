import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { validate } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { Input } from 'components/inputs/input';
import { IntegrationFormField } from 'components/integrations/elements';
import { DEFAULT_FORM_CONFIG } from '../constants';

const messages = defineMessages({
  linkToBtsLabel: {
    id: 'JiraConnectionFormFields.linkToBtsLabel',
    defaultMessage: 'Link to BTS',
  },
  projectNameLabel: {
    id: 'JiraConnectionFormFields.projectNameLabel',
    defaultMessage: 'Project name in Jira',
  },
  authTypeLabel: {
    id: 'JiraConnectionFormFields.authTypeLabel',
    defaultMessage: 'Authorization type',
  },
  usernameLabel: {
    id: 'JiraConnectionFormFields.usernameLabel',
    defaultMessage: 'BTS username',
  },
  passwordLabel: {
    id: 'JiraConnectionFormFields.passwordLabel',
    defaultMessage: 'BTS password',
  },
  integrationNameLabel: {
    id: 'JiraConnectionFormFields.integrationNameLabel',
    defaultMessage: 'Integration Name',
  },
});

const validators = {
  url: (value) => (!value || !validate.url(value)) && 'btsUrlHint',
  project: (value) => (!value || !validate.btsProject(value)) && 'btsProjectHint',
  requiredField: (value) => !value && 'requiredFieldHint',
};

@injectIntl
export class JiraConnectionFormFields extends Component {
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
    this.systemAuthTypes = [{ value: 'BASIC', label: 'Basic' }];
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
          label={formatMessage(messages.integrationNameLabel)}
          required
          disabled={disabled}
          lineAlign={lineAlign}
          validate={validators.requiredField}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="url"
          label={formatMessage(messages.linkToBtsLabel)}
          required
          disabled={disabled || editAuthMode}
          lineAlign={lineAlign}
          validate={validators.url}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="project"
          label={formatMessage(messages.projectNameLabel)}
          required
          disabled={disabled || editAuthMode}
          lineAlign={lineAlign}
          validate={validators.project}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="authType"
          label={formatMessage(messages.authTypeLabel)}
          disabled={disabled}
          lineAlign={lineAlign}
        >
          <FieldErrorHint>
            <InputDropdown mobileDisabled options={this.systemAuthTypes} />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="username"
          label={formatMessage(messages.usernameLabel)}
          required
          disabled={disabled}
          lineAlign={lineAlign}
          validate={validators.requiredField}
        >
          <FieldErrorHint>
            <Input type="text" mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="password"
          label={formatMessage(messages.passwordLabel)}
          required
          disabled={disabled}
          lineAlign={lineAlign}
          validate={validators.requiredField}
        >
          <FieldErrorHint>
            <Input type="password" mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
      </Fragment>
    );
  }
}
