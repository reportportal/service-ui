import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { validate } from 'common/utils';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { DEFAULT_RALLY_CONFIG } from '../constants';
import styles from './rallyInstanceForm.scss';
import { InstanceFormControls } from '../instanceFormControls';

const cx = classNames.bind(styles);

const messages = defineMessages({
  editProjectWarning: {
    id: 'RallyInstanceForm.editProjectWarning',
    defaultMessage: '! The default properties for issue will be reset',
  },
  editProjectTitle: {
    id: 'RallyInstanceForm.editProjectTitle',
    defaultMessage: 'Edit',
  },
  removeProjectTitle: {
    id: 'RallyInstanceForm.removeProjectTitle',
    defaultMessage: 'Remove project',
  },
  linkToBtsLabel: {
    id: 'RallyInstanceForm.linkToBtsLabel',
    defaultMessage: 'Link to BTS',
  },
  projectIdLabel: {
    id: 'RallyInstanceForm.projectIdLabel',
    defaultMessage: 'Project ID in BTS',
  },
  authTypeLabel: {
    id: 'RallyInstanceForm.authTypeLabel',
    defaultMessage: 'Authorization type',
  },
  apiKeyLabel: {
    id: 'RallyInstanceForm.apiKeyLabel',
    defaultMessage: 'ApiKey',
  },
});

@reduxForm({
  form: 'rallyInstanceForm',
  validate: ({ url, project, accessKey }) => ({
    url: (!url || !validate.url(url)) && 'btsUrlHint',
    project: (!project || !validate.btsProject(project)) && 'btsProjectHint',
    accessKey: !accessKey && 'requiredFieldHint',
  }),
})
@injectIntl
export class RallyInstanceForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    instances: PropTypes.array,
    initialize: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
  };

  static defaultProps = {
    instances: [],
  };

  static getInstanceData = (instances) =>
    (instances.length && instances[0]) || DEFAULT_RALLY_CONFIG;

  static getDerivedStateFromProps(props, state) {
    const instanceData = RallyInstanceForm.getInstanceData(props.instances);
    if (!isEqual(instanceData, state.instanceData)) {
      return {
        disabled: !!props.instances.length,
        newItem: !props.instances.length,
        instanceData,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.systemAuthTypes = [{ value: DEFAULT_RALLY_CONFIG.systemAuth, label: 'ApiKey' }];
    this.state = {
      instanceData: (props.instances.length && props.instances[0]) || DEFAULT_RALLY_CONFIG,
      disabled: !!props.instances.length,
      newItem: !props.instances.length,
      showEditWarning: false,
    };
  }

  componentDidMount() {
    this.props.initialize(this.mapInstanceDataToFormData(this.state.instanceData));
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(RallyInstanceForm.getInstanceData(prevProps.instances), this.state.instanceData)) {
      this.props.initialize(this.mapInstanceDataToFormData(this.state.instanceData));
    }
  }

  onCancel = () => {
    this.setState({
      disabled: true,
      showEditWarning: false,
    });
    this.props.reset();
  };

  setDisabled = (value) => {
    this.setState({
      disabled: value,
    });
  };

  mapInstanceDataToFormData = ({
    url = '',
    systemType = '',
    systemAuth = '',
    accessKey = '',
    project = '',
  }) => ({
    url,
    systemType,
    systemAuth,
    accessKey,
    project,
  });

  prepareEditedDataForSubmit = (formData) => {
    const { instanceData } = this.state;

    this.setState({
      showEditWarning: false,
    });

    return {
      ...formData,
      fields: instanceData.fields || [],
    };
  };

  inputValueChangeHandler = (event) => {
    if (
      event.target.value !== this.state.instanceData.project ||
      event.target.value !== this.state.instanceData.url
    ) {
      this.props.change('accessKey', '');
      this.setState({
        showEditWarning: this.state.instanceData.fields && this.state.instanceData.fields.length,
      });
    }
  };

  createFormControlsConfig = () => ({
    setDisabled: this.setDisabled,
    onCancel: this.onCancel,
    prepareEditedDataForSubmit: this.prepareEditedDataForSubmit,
    editMode: !this.state.disabled,
    showEditWarning: this.state.showEditWarning,
    newItem: this.state.newItem,
  });

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('rally-instance-form')}>
        <InstanceFormControls
          formControls={this.createFormControlsConfig()}
          handleSubmit={this.props.handleSubmit}
          instanceData={this.state.instanceData}
        >
          <FormField
            name="url"
            fieldWrapperClassName={cx('instance-form-input-wrapper')}
            label={intl.formatMessage(messages.linkToBtsLabel)}
            labelClassName={cx('instance-field-label')}
            onChange={this.state.newItem ? null : this.inputValueChangeHandler}
            required
            disabled={this.state.disabled}
          >
            <FieldErrorHint>
              <Input mobileDisabled />
            </FieldErrorHint>
          </FormField>
          <FormField
            name="project"
            fieldWrapperClassName={cx('instance-form-input-wrapper')}
            label={intl.formatMessage(messages.projectIdLabel)}
            labelClassName={cx('instance-field-label')}
            onChange={this.state.newItem ? null : this.inputValueChangeHandler}
            required
            disabled={this.state.disabled}
          >
            <FieldErrorHint>
              <Input mobileDisabled />
            </FieldErrorHint>
          </FormField>
          <FormField
            name="systemAuth"
            fieldWrapperClassName={cx('instance-form-input-wrapper')}
            label={intl.formatMessage(messages.authTypeLabel)}
            labelClassName={cx('instance-field-label')}
            disabled={this.state.disabled}
          >
            <FieldErrorHint>
              <InputDropdown mobileDisabled options={this.systemAuthTypes} />
            </FieldErrorHint>
          </FormField>
          <FormField
            name="accessKey"
            containerClassName={cx('text-area-container')}
            fieldWrapperClassName={cx('instance-form-text-area-wrapper')}
            label={intl.formatMessage(messages.apiKeyLabel)}
            labelClassName={cx('instance-field-label', 'text-area-label')}
            required
            type="text"
            disabled={this.state.disabled}
          >
            <FieldErrorHint>
              <InputTextArea mobileDisabled />
            </FieldErrorHint>
          </FormField>
        </InstanceFormControls>
      </div>
    );
  }
}
