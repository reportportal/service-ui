import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { showModalAction, hideModalAction } from 'controllers/modal';
import {
  BtsAuthFieldsInfo,
  BtsPropertiesForIssueForm,
  BTS_FIELDS_FORM,
  COMMON_BTS_MESSAGES,
  getDefectFormFields,
} from 'components/integrations/elements/bts';
import { IntegrationSettings } from 'components/integrations/elements';
import { messages } from '../messages';

@connect(null, {
  showModalAction,
  hideModalAction,
})
@injectIntl
export class RallySettings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
    pluginPageType: PropTypes.bool,
  };

  static defaultProps = {
    pluginPageType: false,
  };

  onSubmit = (data, callback, metaData) => {
    const { fields, checkedFieldsIds = {} } = metaData;
    const defectFormFields = getDefectFormFields(fields, checkedFieldsIds, data);

    this.props.onUpdate({ defectFormFields }, callback);
  };

  getEditAuthConfig = () => ({
    content: <BtsAuthFieldsInfo fieldsConfig={this.authFieldsConfig} />,
    onClick: this.editAuthorizationClickHandler,
  });

  authFieldsConfig = [
    {
      value: this.props.data.integrationParameters.url,
      message: this.props.intl.formatMessage(COMMON_BTS_MESSAGES.linkToBtsLabel),
    },
    {
      value: this.props.data.integrationParameters.project,
      message: this.props.intl.formatMessage(messages.projectIdLabel),
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
    const { data, goToPreviousPage, pluginPageType } = this.props;

    return (
      <IntegrationSettings
        data={data}
        onUpdate={this.onSubmit}
        goToPreviousPage={goToPreviousPage}
        formFieldsComponent={BtsPropertiesForIssueForm}
        formKey={BTS_FIELDS_FORM}
        editAuthConfig={this.getEditAuthConfig()}
        pluginPageType={pluginPageType}
        isEmptyConfiguration={
          !data.integrationParameters.defectFormFields ||
          !data.integrationParameters.defectFormFields.length
        }
      />
    );
  }
}
