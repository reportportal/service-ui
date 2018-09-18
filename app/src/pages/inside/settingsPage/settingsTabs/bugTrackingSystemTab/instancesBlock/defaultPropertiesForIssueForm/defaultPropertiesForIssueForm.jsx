import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { URLS } from 'common/urls';
import { normalizeFieldsWithOptions } from 'components/fields/dynamicFieldsSection/utils';
import { FormField } from 'components/fields/formField';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { BigButton } from 'components/buttons/bigButton';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { DynamicFieldsSection } from 'components/fields/dynamicFieldsSection';
import styles from './defaultPropertiesForIssueForm.scss';

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
    defaultMessage: 'Show fields',
  },
});

@reduxForm({
  form: 'defaultPropertiesForIssueForm',
})
@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
@injectIntl
export class DefaultPropertiesForIssueForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentProject: PropTypes.string,
    instanceData: PropTypes.object,
    showNotification: PropTypes.func,
    fetchEditExternalSystem: PropTypes.func,
    initialize: PropTypes.func,
    reset: PropTypes.func,
    change: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  static defaultProps = {
    currentProject: '',
    instanceData: {
      fields: [],
    },
    showNotification: () => {},
    fetchEditExternalSystem: () => {},
    initialize: () => {},
    reset: () => {},
    change: () => {},
    handleSubmit: () => {},
  };

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(state.instanceData, props.instanceData)) {
      const normalizedFields = normalizeFieldsWithOptions(props.instanceData.fields || []);
      return {
        editMode: false,
        fieldsPrepared: false,
        issueType: '',
        instanceData: props.instanceData,
        fields: normalizedFields,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const normalizedFields = normalizeFieldsWithOptions(props.instanceData.fields || []);
    props.initialize(this.mapFieldsToValues(normalizedFields));
    this.state = {
      loading: false,
      failed: false,
      instanceData: props.instanceData,
      fields: normalizedFields,
      issueType: '',
      fieldsPrepared: false,
      editMode: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.instanceData, this.state.instanceData)) {
      this.props.initialize(this.mapFieldsToValues(this.state.fields));
    }
    if (!this.state.fields.length && !this.state.loading && !this.state.failed) {
      this.getFields();
    }
    this.state.fields.length && !this.state.fieldsPrepared && this.prepareFieldsToRender();
  }

  onChangeFieldCheckbox = (fieldId) => {
    const fieldIndex = this.state.fields.findIndex((item) => item.id === fieldId);
    const newFields = [...this.state.fields];
    newFields.splice(fieldIndex, 1, {
      ...this.state.fields[fieldIndex],
      checked: !this.state.fields[fieldIndex].checked,
    });
    this.setState({
      fields: newFields,
    });
  };

  getFields = () => {
    this.updateStateBeforeRequest();
    this.fetchIssueType()
      .then((issueTypes) => {
        this.changeIssueTypeConfig(issueTypes, issueTypes[0]);
        return this.updateFields(issueTypes[0]);
      })
      .catch(this.catchError);
  };

  getFieldsForUpdate = () => {
    this.updateStateBeforeRequest();
    this.fetchIssueType()
      .then((issueTypes) => {
        let selectedIssueType = this.props.instanceData.fields.find(
          (item) => item.id === 'issuetype',
        );
        selectedIssueType = (selectedIssueType && selectedIssueType.value[0]) || issueTypes[0];
        this.changeIssueTypeConfig(issueTypes, selectedIssueType);
        return this.updateFields(selectedIssueType);
      })
      .catch(this.catchError);
  };

  setDefaultMode = (fields) => {
    this.setState({
      editMode: false,
      fieldsPrepared: false,
      fields,
    });
    this.props.reset();
  };

  getCustomBLockConfig = (field) => {
    const customBlock = (
      <InputCheckbox
        onChange={() => this.onChangeFieldCheckbox(field.id)}
        value={field.checked}
        disabled={field.required}
      />
    );
    return {
      node: customBlock,
      wrapperClassName: cx('checkbox-wrapper'),
    };
  };

  mapFieldsToValues = (fields, issueTypeValue) => {
    const valuesMap = {};
    fields.forEach((field) => {
      valuesMap[field.id] = field.value;
      if (field.fieldType === 'issuetype' && issueTypeValue) {
        valuesMap[field.id] = [issueTypeValue];
      }
    });
    return valuesMap;
  };

  handleInputChange = (value) => {
    if (value === this.state.issueType) {
      return;
    }
    this.setState({
      issueType: value,
      loading: true,
    });
    this.updateFields(value).catch(this.catchError);
  };

  checkIfTheSystemHasFields = () =>
    this.props.instanceData.fields && !!this.props.instanceData.fields.length;

  prepareFieldsToRender = () => {
    const {
      instanceData: { fields },
      initialize,
    } = this.props;
    const updatedFields = [...this.state.fields];
    updatedFields.forEach((field, index) => {
      updatedFields[index].checked =
        (this.checkIfTheSystemHasFields() && !this.state.editMode) || field.required;
    });
    if (this.checkIfTheSystemHasFields() && this.state.editMode) {
      fields.forEach((field) => {
        const currentFieldIndexFromProps = updatedFields.findIndex((item) => item.id === field.id);
        if (currentFieldIndexFromProps !== undefined) {
          updatedFields[currentFieldIndexFromProps] = {
            ...field,
          };
        }
      });
      initialize(this.mapFieldsToValues(updatedFields, this.state.issueType));
    }
    this.setState({
      fieldsPrepared: true,
      fields: updatedFields,
    });
  };

  cancelUpdateHandler = () =>
    this.state.editMode
      ? this.setDefaultMode(this.props.instanceData.fields)
      : this.getFieldsForUpdate();

  updateFields = (issueTypeValue) =>
    this.fetchFieldsSet(issueTypeValue).then((fields) => {
      const normalizedFields = normalizeFieldsWithOptions(fields);
      this.props.initialize(this.mapFieldsToValues(normalizedFields, issueTypeValue));
      this.setState({
        loading: false,
        fieldsPrepared: false,
        fields: normalizedFields,
      });
    });

  fetchFieldsSet = (issueTypeValue) =>
    fetch(
      URLS.externalSystemFieldsSet(
        this.props.currentProject,
        this.props.instanceData.id,
        issueTypeValue,
      ),
    );

  catchError = (error) => {
    this.props.showNotification({
      message: error.message,
      type: NOTIFICATION_TYPES.ERROR,
    });
    this.setState({
      failed: true,
      fieldsPrepared: false,
      loading: false,
    });
  };

  fetchIssueType = () =>
    fetch(URLS.externalSystemIssueType(this.props.currentProject, this.props.instanceData.id));

  changeIssueTypeConfig = (issueTypes, selectedIssueType) => {
    this.issueTypeDropdownOptions = issueTypes.map((item) => ({ value: item, label: item }));
    this.setState({
      issueType: selectedIssueType,
    });
  };

  updateStateBeforeRequest = () =>
    this.setState({
      editMode: true,
      failed: false,
      loading: true,
    });

  submitHandler = (formData) => {
    const { instanceData, currentProject } = this.props;
    const fieldsToSend = this.state.fields.filter((item) => item.checked).map((field) => {
      const value = formData[field.id];
      const newItem = {
        ...field,
        value,
      };
      delete newItem.checked;
      return newItem;
    });
    const data = {
      accessKey: instanceData.accessKey || null,
      project: instanceData.project,
      systemAuth: instanceData.systemAuth,
      systemType: instanceData.systemType,
      url: instanceData.url,
      fields: fieldsToSend,
    };
    this.setState({
      editMode: false,
      issueType: '',
      loading: true,
    });
    this.props
      .fetchEditExternalSystem(currentProject, instanceData.id, data)
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(this.catchError);
  };

  render() {
    const { intl, handleSubmit } = this.props;
    const { fields, loading, editMode, failed } = this.state;

    return (
      <div className={cx('default-properties-for-issue-form')}>
        {loading && !this.state.issueType ? (
          <SpinningPreloader />
        ) : (
          <Fragment>
            <h4 className={cx('default-properties-title')}>
              {editMode
                ? intl.formatMessage(messages.availableIssueTypesHeader)
                : intl.formatMessage(messages.defaultIssueFormPropsHeader)}
            </h4>
            <div className={cx('fields-caption-block')}>
              <span>{intl.formatMessage(messages.defaultValueHeader)}</span>
              <span className={cx('fields-caption')}>
                {intl.formatMessage(messages.showFieldsHeader)}
              </span>
            </div>
            {editMode &&
              !failed && (
                <Fragment>
                  <FormField
                    containerClassName={cx('issue-form-item')}
                    fieldWrapperClassName={cx('field-wrapper')}
                    labelClassName={cx('form-group-label')}
                    label="Issue Type"
                    checked
                    required
                    withoutProvider
                  >
                    <InputDropdown
                      value={this.state.issueType}
                      onChange={this.handleInputChange}
                      mobileDisabled
                      options={this.issueTypeDropdownOptions}
                    />
                  </FormField>
                  <h4 className={cx('default-properties-title')}>
                    {intl.formatMessage(messages.defaultIssueFormPropsHeader)}
                  </h4>
                </Fragment>
              )}
            {loading ? (
              <SpinningPreloader />
            ) : (
              <Fragment>
                <DynamicFieldsSection fields={fields} customBlock={this.getCustomBLockConfig} />
                <div className={cx('buttons-block')}>
                  {this.checkIfTheSystemHasFields() && (
                    <div className={cx('button-container')}>
                      <BigButton color={'gray-60'} onClick={this.cancelUpdateHandler}>
                        {editMode
                          ? intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL)
                          : intl.formatMessage(COMMON_LOCALE_KEYS.UPDATE)}
                      </BigButton>
                    </div>
                  )}
                  <div className={cx('button-container')}>
                    <BigButton onClick={handleSubmit(this.submitHandler)}>
                      {intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
                    </BigButton>
                  </div>
                </div>
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    );
  }
}
