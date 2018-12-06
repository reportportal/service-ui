import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { validate } from 'common/utils';
import { FormController } from '../../../common/formController';
import { messages, ENABLED_KEY } from '../../../common/constants';
import { AD_AUTH_FORM, DEFAULT_FORM_CONFIG, AD_AUTH_TYPE } from './constants';
import { ActiveDirectoryAuthFormFields } from './activeDirectoryAuthFormFields';
import styles from './activeDirectoryAuthForm.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  switcherLabel: {
    id: 'ActiveDirectoryAuthForm.switcherLabel',
    defaultMessage: 'Active directory authorization',
  },
  formHeader: {
    id: 'ActiveDirectoryAuthForm.formHeader',
    defaultMessage: 'Active directory',
  },
});

@reduxForm({
  form: AD_AUTH_FORM,
  validate: ({ domain, url, baseDn, synchronizationAttributes }) => ({
    domain: !domain && 'requiredFieldHint',
    url: (!url || !validate.urlPart(url)) && 'requiredFieldHint',
    baseDn: !baseDn && 'requiredFieldHint',
    synchronizationAttributes: {
      email:
        (!synchronizationAttributes || !synchronizationAttributes.email) && 'requiredFieldHint',
    },
  }),
  initialValues: DEFAULT_FORM_CONFIG,
})
@connect((state) => ({
  enabled: formValueSelector(AD_AUTH_FORM)(state, ENABLED_KEY),
}))
@injectIntl
export class ActiveDirectoryAuthForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabled: PropTypes.bool,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  static defaultProps = {
    enabled: false,
    initialize: () => {},
    handleSubmit: () => {},
  };

  commonUrl = URLS.authSettings(AD_AUTH_TYPE);

  render() {
    const {
      intl: { formatMessage },
      enabled,
      initialize,
      handleSubmit,
    } = this.props;

    const formOptions = {
      formHeader: formatMessage(localMessages.formHeader),
      switcherLabel: localMessages.switcherLabel,
      FieldsComponent: ActiveDirectoryAuthFormFields,
      initialConfigUrl: this.commonUrl,
      submitFormUrl: this.commonUrl,
      withErrorBlock: false,
      defaultFormConfig: DEFAULT_FORM_CONFIG,
    };

    return (
      <div className={cx('active-directory-auth-form')}>
        <FormController
          enabled={enabled}
          successMessage={messages.updateAuthSuccess}
          initialize={initialize}
          formOptions={formOptions}
          handleSubmit={handleSubmit}
        />
      </div>
    );
  }
}
