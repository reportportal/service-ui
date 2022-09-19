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
import { connect } from 'react-redux';
import { defineMessages, injectIntl, useIntl } from 'react-intl';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import { projectIdSelector } from 'controllers/pages';
import { projectInfoSelector } from 'controllers/project';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import {
  COMMAND_GET_ISSUE_TYPES,
  COMMAND_GET_ISSUE_FIELDS,
} from 'controllers/plugins/uiExtensions/constants';
import { URLS } from 'common/urls';
import { withTooltip } from 'components/main/tooltips/tooltip';
import Parser from 'html-react-parser';
import InfoIcon from 'common/img/newIcons/icon-about-inline.svg';
import { Dropdown } from 'componentLibrary/dropdown';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { InputWithEye } from 'components/inputs/inputWithEye';
import { DynamicFieldsSection } from 'components/fields/dynamicFieldsSection';
import {
  normalizeFieldsWithOptions,
  mapFieldsToValues,
  mergeFields,
} from 'components/fields/dynamicFieldsSection/utils';
import { PLUGINS_PAGE_EVENTS, SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { getDefaultOptionValueKey } from 'pages/inside/stepPage/modals/postIssueModal/utils';
import { IntegrationFormField } from '../../integrationFormField';
import { ISSUE_TYPE_FIELD_KEY } from '../constants';
import styles from './btsPropertiesForIssueForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  availableIssueTypesHeader: {
    id: 'DefaultPropertiesForIssueForm.availableIssueTypesHeader',
    defaultMessage: 'Issue types available on server',
  },
  defaultIssueFormPropsHeader: {
    id: 'DefaultPropertiesForIssueForm.defaultIssueFormPropsHeader',
    defaultMessage: 'Default properties for issue form',
  },
  defaultValueHeader: {
    id: 'DefaultPropertiesForIssueForm.defaultValueHeader',
    defaultMessage: 'Default value',
  },
  showFieldsHeader: {
    id: 'DefaultPropertiesForIssueForm.showFieldsHeader',
    defaultMessage: 'Show',
  },
  tooltip: {
    id: 'DefaultPropertiesForIssueForm.tooltip',
    defaultMessage: 'Fields for posting issues to your BTS',
  },
});

const Tooltip = () => {
  const { formatMessage } = useIntl();
  return <div>{formatMessage(messages.tooltip)}</div>;
};

const IconShow = () => {
  return <>{Parser(InfoIcon)}</>;
};

const ShowWithTooltip = withTooltip({
  TooltipComponent: Tooltip,
  data: {
    dynamicWidth: true,
    align: 'bottom',
    noArrow: false,
    dark: true,
  },
})(IconShow);

@connect(
  (state) => ({
    projectName: projectIdSelector(state),
    projectInfo: projectInfoSelector(state),
  }),
  {
    showNotification,
  },
)
@injectIntl
@track()
export class BtsPropertiesForIssueForm extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    integrationId: PropTypes.number.isRequired,
    projectName: PropTypes.string,
    projectInfo: PropTypes.object,
    pluginName: PropTypes.string,
    initialData: PropTypes.object,
    showNotification: PropTypes.func,
    initialize: PropTypes.func,
    change: PropTypes.func,
    disabled: PropTypes.bool.isRequired,
    updateMetaData: PropTypes.func,
    isGlobal: PropTypes.bool,
    pluginDetails: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    projectName: '',
    projectInfo: {},
    pluginName: '',
    initialData: {
      defectFormFields: [],
    },
    isGlobal: false,
    pluginDetails: {},
    updateMetaData: () => {},
    showNotification: () => {},
    initialize: () => {},
    change: () => {},
  };

  constructor(props) {
    super(props);
    this.defaultOptionValueKey = getDefaultOptionValueKey(props.pluginName);
    const fieldsConfig = this.setupInitialFieldsConfig();

    this.state = {
      loading: false,
      ...fieldsConfig,
      issueType: '',
    };
  }

  componentDidMount() {
    if (!this.state.fields.length && !this.state.loading) {
      this.getFields();
    }
  }

  componentDidUpdate(prevProps) {
    const isFieldsInUpdateMode =
      this.state.fields.length && prevProps.disabled && !this.props.disabled && !this.state.loading;
    if (isFieldsInUpdateMode) {
      this.getFieldsForUpdate();
      return;
    }

    const isUpdateModeClosed = !prevProps.disabled && this.props.disabled && !this.state.loading;
    if (isUpdateModeClosed) {
      this.resetFields();
    }
  }

  onChangeFieldCheckbox = (fieldId, fieldName) => {
    this.props.tracking.trackEvent(
      (this.props.isGlobal
        ? PLUGINS_PAGE_EVENTS
        : SETTINGS_PAGE_EVENTS
      ).pluginChoosePropertiesCheckboxClick(this.props.pluginName, fieldName),
    );
    const fieldsIds = {
      ...this.state.checkedFieldsIds,
      [fieldId]: !this.state.checkedFieldsIds[fieldId],
    };
    this.props.updateMetaData({
      checkedFieldsIds: fieldsIds,
      fields: this.state.fields,
    });
    this.setState({
      checkedFieldsIds: fieldsIds,
    });
  };

  getFields = () => {
    this.setState({
      loading: true,
    });
    this.fetchIssueTypes()
      .then((issueTypes) => {
        this.changeIssueTypeConfig(issueTypes, issueTypes[0]);
        return this.updateFields(issueTypes[0]);
      })
      .catch(this.catchError);
  };

  getFieldsForUpdate = () => {
    this.setState({
      loading: true,
    });
    this.fetchIssueTypes()
      .then((issueTypes) => {
        const { defectFormFields } = this.props.initialData;
        let selectedIssueTypeValue = [];
        if (defectFormFields && defectFormFields.length) {
          selectedIssueTypeValue =
            (defectFormFields.find((item) => item.id === ISSUE_TYPE_FIELD_KEY) || {}).value || [];
        }
        selectedIssueTypeValue = selectedIssueTypeValue[0] || issueTypes[0];
        this.changeIssueTypeConfig(issueTypes, selectedIssueTypeValue);
        return this.updateFields(selectedIssueTypeValue);
      })
      .catch(this.catchError);
  };

  getCustomBLockConfig = (field) => {
    const customBlock = (
      <InputWithEye
        onChange={() => this.onChangeFieldCheckbox(field.id, field.fieldName)}
        value={field.checked}
        disabled={field.required || this.props.disabled}
      />
    );
    return {
      node: customBlock,
      wrapperClassName: cx('checkbox-wrapper'),
    };
  };

  setupInitialFieldsConfig = () => {
    const { initialData, initialize, updateMetaData } = this.props;
    const fields = initialData.defectFormFields || [];
    let normalizedFields = [];
    let checkedFieldsIds = {};
    if (fields.length) {
      normalizedFields = normalizeFieldsWithOptions(fields, this.defaultOptionValueKey);
      const fieldsValues = mapFieldsToValues(normalizedFields);
      initialize(fieldsValues);
      checkedFieldsIds = Object.keys(fieldsValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {},
      );
    }

    const fieldsConfig = {
      checkedFieldsIds,
      fields: normalizedFields,
    };
    updateMetaData(fieldsConfig);

    return fieldsConfig;
  };

  resetFields = () => {
    const fieldsConfig = this.setupInitialFieldsConfig();

    this.setState({
      ...fieldsConfig,
    });
  };

  handleIssueTypeChange = (value) => {
    if (value === this.state.issueType) {
      return;
    }
    this.setState({
      issueType: value,
      loading: true,
    });
    this.updateFields(value).catch(this.catchError);
  };

  prepareFieldsToRender = () => {
    const { disabled } = this.props;
    const { checkedFieldsIds, fields } = this.state;
    const updatedFields = [...fields];

    updatedFields.forEach((field, index) => {
      updatedFields[index] = {
        ...updatedFields[index],
        checked: checkedFieldsIds[field.id] || field.required,
        disabled: field.id === ISSUE_TYPE_FIELD_KEY ? true : disabled,
      };
    });

    return updatedFields;
  };

  updateFields = (issueTypeValue) =>
    this.fetchFieldsSet(issueTypeValue).then((fetchedFields) => {
      const { defectFormFields } = this.props.initialData;
      let fields = normalizeFieldsWithOptions(fetchedFields, this.defaultOptionValueKey);
      let checkedFieldsIds = {};

      if (defectFormFields && defectFormFields.length) {
        const savedIssueType = defectFormFields.find((item) => item.id === ISSUE_TYPE_FIELD_KEY);
        if (
          !savedIssueType ||
          (savedIssueType.value && savedIssueType.value[0] === issueTypeValue)
        ) {
          fields = mergeFields(defectFormFields, fields);
          checkedFieldsIds = this.state.checkedFieldsIds;
        }
      }

      this.props.initialize(mapFieldsToValues(fields, issueTypeValue, ISSUE_TYPE_FIELD_KEY));
      this.props.updateMetaData({
        fields,
        checkedFieldsIds,
      });
      this.setState({
        loading: false,
        fields,
        checkedFieldsIds,
      });
    });

  fetchFieldsSet = (issueTypeValue) => {
    const {
      pluginDetails: details,
      isGlobal,
      integrationId,
      projectName,
      projectInfo,
    } = this.props;
    const project = projectName || projectInfo.projectName;
    const isCommandAvailable =
      details &&
      details.allowedCommands &&
      details.allowedCommands.indexOf(COMMAND_GET_ISSUE_FIELDS) !== -1;
    const requestParams = {};
    let url;

    if (isCommandAvailable) {
      url = URLS.projectIntegrationByIdCommand(project, integrationId, COMMAND_GET_ISSUE_FIELDS);
      requestParams.method = 'PUT';
      requestParams.data = {
        projectId: projectInfo.projectId,
        issueType: issueTypeValue,
      };
    } else {
      url = isGlobal
        ? URLS.btsGlobalIntegrationFieldsSet(integrationId, issueTypeValue)
        : URLS.btsIntegrationFieldsSet(project, integrationId, issueTypeValue);
    }

    return fetch(url, requestParams);
  };

  catchError = (error) => {
    this.props.showNotification({
      message: error.message,
      type: NOTIFICATION_TYPES.ERROR,
    });
    this.setState({
      loading: false,
    });
  };

  fetchIssueTypes = () => {
    const {
      pluginDetails: details,
      isGlobal,
      integrationId,
      projectName,
      projectInfo,
    } = this.props;
    const project = projectName || projectInfo.projectName;
    const isCommandAvailable =
      details &&
      details.allowedCommands &&
      details.allowedCommands.indexOf(COMMAND_GET_ISSUE_TYPES) !== -1;
    const requestParams = {};
    let url;

    if (isCommandAvailable) {
      url = URLS.projectIntegrationByIdCommand(project, integrationId, COMMAND_GET_ISSUE_TYPES);
      requestParams.method = 'PUT';
      requestParams.data = {
        projectId: projectInfo.projectId,
      };
    } else {
      url = isGlobal
        ? URLS.btsGlobalIntegrationIssueTypes(integrationId)
        : URLS.btsIntegrationIssueTypes(project, integrationId);
    }

    return fetch(url, requestParams);
  };

  changeIssueTypeConfig = (issueTypes, selectedIssueType) => {
    this.issueTypeDropdownOptions = issueTypes.map((item) => ({ value: item, label: item }));
    this.setState({
      issueType: selectedIssueType,
    });
  };

  render() {
    const { intl, disabled } = this.props;
    const { loading } = this.state;
    const preparedFields = this.prepareFieldsToRender();

    return (
      <div className={cx('bts-properties-for-issue-form')}>
        {loading && !this.state.issueType ? (
          <BubblesPreloader customClassName={cx('center')} />
        ) : (
          <Fragment>
            {!disabled && (
              <Fragment>
                <FieldElement
                  label="Issue Type"
                  disabled={loading}
                  withoutProvider
                  description={intl.formatMessage(messages.availableIssueTypesHeader)}
                >
                  <FieldErrorHint provideHint={false}>
                    <Dropdown
                      value={this.state.issueType}
                      onChange={this.handleIssueTypeChange}
                      options={this.issueTypeDropdownOptions}
                      defaultWidth={false}
                    />
                  </FieldErrorHint>
                </FieldElement>
                <div className={cx('default-property-block')}>
                  <h4 className={cx('default-properties-title')}>
                    {intl.formatMessage(messages.defaultIssueFormPropsHeader)}
                  </h4>
                  <div className={cx('show-hint-wrapper')}>
                    <span className={cx('show-hint-text')}>
                      {intl.formatMessage(messages.showFieldsHeader)}
                    </span>
                    <ShowWithTooltip />
                  </div>
                </div>
              </Fragment>
            )}
            {loading ? (
              <BubblesPreloader customClassName={cx('center')} />
            ) : (
              <Fragment>
                <DynamicFieldsSection
                  fields={preparedFields}
                  customBlockCreator={this.getCustomBLockConfig}
                  customFieldWrapper={IntegrationFormField}
                  defaultOptionValueKey={this.defaultOptionValueKey}
                >
                  {disabled && (
                    <div className={cx('show-hint-wrapper')}>
                      <span className={cx('show-hint-text')}>
                        {intl.formatMessage(messages.showFieldsHeader)}
                      </span>
                      <ShowWithTooltip />
                    </div>
                  )}
                </DynamicFieldsSection>
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    );
  }
}
