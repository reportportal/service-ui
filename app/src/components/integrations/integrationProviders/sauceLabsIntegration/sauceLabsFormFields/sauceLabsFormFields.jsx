import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
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
});

const validators = {
  requiredField: (value) => (!value && 'requiredFieldHint') || undefined,
};

@injectIntl
export class SauceLabsFormFields extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
  };

  static defaultProps = {
    disabled: false,
    lineAlign: false,
    initialData: {},
  };

  componentDidMount() {
    this.props.initialize(this.props.initialData);
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
          validate={validators.requiredField}
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
          validate={validators.requiredField}
          lineAlign={lineAlign}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
      </Fragment>
    );
  }
}
