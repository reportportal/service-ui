import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { showModalAction, hideModalAction } from 'controllers/modal';
import {
  BtsAuthFieldsInfo,
  BtsPropertiesForIssueForm,
  BTS_FIELDS_FORM,
} from 'components/integrations/elements/bts';
import { IntegrationSettings } from 'components/integrations/elements';

const messages = defineMessages({
  linkToBts: {
    id: 'BtsAuthFieldsInfo.linkToBts',
    defaultMessage: 'Link to BTS',
  },
  btsProjectName: {
    id: 'BtsAuthFieldsInfo.btsProjectName',
    defaultMessage: 'Project name in Jira',
  },
  usernameTitle: {
    id: 'BtsAuthFieldsInfo.usernameTitle',
    defaultMessage: 'Authorized by username',
  },
});

@connect(null, {
  showModalAction,
  hideModalAction,
})
@injectIntl
export class JiraSettings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
  };

  onSubmit = (data, callback, metaData) => {
    const { fields, checkedFieldsIds = {} } = metaData;
    const defectFormFields = fields
      .filter((item) => item.required || checkedFieldsIds[item.id])
      .map((item) => ({ ...item, value: data[item.id] }));

    this.props.onUpdate({ ...data.integrationParameters, defectFormFields }, callback);
  };

  getEditAuthConfig = () => ({
    content: <BtsAuthFieldsInfo fieldsConfig={this.authFieldsConfig} />,
    onClick: this.editAuthorizationClickHandler,
  });

  authFieldsConfig = [
    {
      value: this.props.data.integrationParameters.url,
      message: this.props.intl.formatMessage(messages.linkToBts),
    },
    {
      value: this.props.data.integrationParameters.project,
      message: this.props.intl.formatMessage(messages.btsProjectName),
    },
    {
      value: this.props.data.integrationParameters.username,
      message: this.props.intl.formatMessage(messages.usernameTitle),
    },
  ];

  editAuthorizationClickHandler = () => {
    const {
      data: { name, integrationParameters, integrationType },
      onUpdate,
    } = this.props;

    this.props.showModalAction({
      id: 'addProjectIntegrationModal',
      data: {
        onConfirm: (data) => onUpdate(data, this.props.hideModalAction),
        instanceType: integrationType.name,
        customProps: {
          initialData: {
            ...integrationParameters,
            integrationName: name,
          },
          editAuthMode: true,
        },
      },
    });
  };

  render() {
    const { data, goToPreviousPage } = this.props;

    return (
      <IntegrationSettings
        data={data}
        onUpdate={this.onSubmit}
        goToPreviousPage={goToPreviousPage}
        formFieldsComponent={BtsPropertiesForIssueForm}
        formKey={BTS_FIELDS_FORM}
        editAuthConfig={this.getEditAuthConfig()}
        isEmptyConfiguration={
          !data.integrationParameters.defectFormFields ||
          !data.integrationParameters.defectFormFields.length
        }
      />
    );
  }
}
