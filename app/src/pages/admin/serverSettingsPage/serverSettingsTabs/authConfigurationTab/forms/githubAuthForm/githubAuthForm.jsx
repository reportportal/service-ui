import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { FormController } from 'pages/admin/serverSettingsPage/common/formController';
import { ENABLED_KEY, messages } from 'pages/admin/serverSettingsPage/common/constants';
import { joinOrganizations, splitOrganizations } from './utils';
import { GITHUB_AUTH_FORM, DEFAULT_FORM_CONFIG } from './constants';
import { GithubAuthFormFields } from './githubAuthFormFields';
import styles from './githubAuthForm.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  switcherLabel: {
    id: 'GithubAuthForm.switcherLabel',
    defaultMessage: 'GitHub authorization',
  },
  formHeader: {
    id: 'GithubAuthForm.formHeader',
    defaultMessage: 'Github',
  },
});

@reduxForm({
  form: GITHUB_AUTH_FORM,
  validate: ({ clientId, clientSecret }) => ({
    clientId: !clientId && 'requiredFieldHint',
    clientSecret: !clientSecret && 'requiredFieldHint',
  }),
  initialValues: DEFAULT_FORM_CONFIG,
})
@connect((state) => ({
  enabled: formValueSelector(GITHUB_AUTH_FORM)(state, ENABLED_KEY),
}))
@injectIntl
export class GithubAuthForm extends Component {
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

  prepareDataBeforeSubmit = (data) => {
    const organizations = joinOrganizations(data.restrictions.organizations);
    return { ...data, restrictions: { organizations } };
  };

  prepareDataBeforeInitialize = (data) => ({
    ...data,
    restrictions: {
      organizations: splitOrganizations(data.restrictions.organizations),
    },
    [ENABLED_KEY]: true,
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
      FieldsComponent: GithubAuthFormFields,
      initialConfigUrl: URLS.githubAuthSettings(),
      getSubmitUrl: URLS.githubAuthSettings,
      withErrorBlock: false,
      defaultFormConfig: DEFAULT_FORM_CONFIG,
    };

    return (
      <div className={cx('github-auth-form')}>
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
