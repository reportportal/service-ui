import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { IntegrationFormField } from 'components/integrations/elements';
import { commonValidators } from 'common/utils';
import { DATA_CENTER_US, DATA_CENTER_EU, DEFAULT_DATA_CENTER } from '../constants';

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
  dataCenterUS: {
    id: 'SauceLabsFormFields.dataCenterUS',
    defaultMessage: 'United States (US)',
  },
  dataCenterEU: {
    id: 'SauceLabsFormFields.dataCenterEU',
    defaultMessage: 'Europe (EU)',
  },
});

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
    initialData: {
      dataCenter: DEFAULT_DATA_CENTER,
    },
  };

  constructor(props) {
    super(props);
    const {
      intl: { formatMessage },
    } = props;
    this.dataCenterOptions = [
      { value: DATA_CENTER_US, label: formatMessage(messages.dataCenterUS) },
      { value: DATA_CENTER_EU, label: formatMessage(messages.dataCenterEU) },
    ];
  }

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
