import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { validateLdapAttributes } from '../../../common/validate';
import { FormController } from '../../../common/formController';
import { messages, ENABLED_KEY, LDAP_ATTRIBUTES_KEY } from '../../../common/constants';
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
  validate: ({ domain, ldapAttributes }) => ({
    domain: !domain && 'requiredFieldHint',
    ldapAttributes: validateLdapAttributes(ldapAttributes),
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

  getSubmitUrl = (id) => this.commonUrl(this.props.enabled ? AD_AUTH_TYPE : id);

  commonUrl = (authTypeOrId) => URLS.authSettings(authTypeOrId);

  prepareDataBeforeSubmit = (data) => ({
    ...data,
    [LDAP_ATTRIBUTES_KEY]: {
      ...data[LDAP_ATTRIBUTES_KEY],
      [ENABLED_KEY]: data[ENABLED_KEY],
    },
  });

  prepareDataBeforeInitialize = (data) => ({
    ...data,
    [ENABLED_KEY]: (data[LDAP_ATTRIBUTES_KEY] || {})[ENABLED_KEY],
  });

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
      initialConfigUrl: this.commonUrl(AD_AUTH_TYPE),
      getSubmitUrl: this.getSubmitUrl,
      withErrorBlock: false,
      defaultFormConfig: DEFAULT_FORM_CONFIG,
    };

    return (
      <div className={cx('active-directory-auth-form')}>
        <FormController
          enabled={enabled}
          prepareDataBeforeSubmit={this.prepareDataBeforeSubmit}
          prepareDataBeforeInitialize={this.prepareDataBeforeInitialize}
          successMessage={messages.updateAuthSuccess}
          initialize={initialize}
          formOptions={formOptions}
          handleSubmit={handleSubmit}
        />
      </div>
    );
  }
}
