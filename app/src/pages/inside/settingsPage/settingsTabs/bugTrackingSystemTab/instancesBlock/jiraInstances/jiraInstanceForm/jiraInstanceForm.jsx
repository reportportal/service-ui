import React, { Component, Fragment } from 'react';
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
import { InstanceFormControls } from '../../instanceFormControls';
import styles from './jiraInstanceForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  linkToBtsLabel: {
    id: 'JiraInstanceForm.linkToBtsLabel',
    defaultMessage: 'Link to BTS',
  },
  projectNameLabel: {
    id: 'JiraInstanceForm.projectNameLabel',
    defaultMessage: 'Project name in BTS',
  },
  authTypeLabel: {
    id: 'JiraInstanceForm.authTypeLabel',
    defaultMessage: 'Authorization type',
  },
  usernameLabel: {
    id: 'JiraInstanceForm.usernameLabel',
    defaultMessage: 'BTS username',
  },
  passwordLabel: {
    id: 'JiraInstanceForm.passwordLabel',
    defaultMessage: 'BTS password',
  },
});

@reduxForm({
  form: 'jiraInstanceForm',
  validate: ({ url, password, username, project }) => ({
    url: (!url || !validate.url(url)) && 'btsUrlHint',
    project: (!project || !validate.btsProject(project)) && 'btsProjectHint',
    password: !password && 'requiredFieldHint',
    username: !username && 'requiredFieldHint',
  }),
})
@injectIntl
export class JiraInstanceForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    instanceData: PropTypes.shape({
      id: PropTypes.string,
      url: PropTypes.string,
      projectRef: PropTypes.string,
      systemType: PropTypes.string,
      systemAuth: PropTypes.string,
      username: PropTypes.string,
      project: PropTypes.string,
      fields: PropTypes.array,
    }),
    newItem: PropTypes.bool,
    initialize: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
  };

  static defaultProps = {
    instanceData: {
      id: '',
      url: '',
      projectRef: '',
      systemType: '',
      systemAuth: '',
      username: '',
      project: '',
      fields: [],
    },
    newItem: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(state.instanceData, props.instanceData)) {
      return {
        instanceData: props.instanceData,
        showEditWarning: false,
        disabled: !props.newItem,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.systemAuthTypes = [{ value: 'BASIC', label: 'Basic' }];
    this.state = {
      instanceData: props.instanceData,
      disabled: !props.newItem,
    };
  }

  componentDidMount() {
    this.props.initialize(this.mapInstanceDataToFormData(this.props.instanceData));
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.instanceData, this.state.instanceData)) {
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
    username = '',
    project = '',
    password = '',
  }) => ({
    url,
    systemType,
    systemAuth,
    username,
    project,
    password,
  });

  inputChangeHandler = (event) => {
    if (
      event.target.value !== this.state.instanceData.project ||
      event.target.value !== this.state.instanceData.url
    ) {
      this.props.change('username', '');
      this.props.change('password', '');
      this.setState({
        showEditWarning: this.props.instanceData.fields && this.props.instanceData.fields.length,
      });
    }
  };

  usernameChangeHandler = (event) =>
    event.target.value !== this.state.instanceData.username && this.props.change('password', '');

  prepareEditedDataForSubmit = (formData) => {
    const { instanceData, showEditWarning } = this.state;

    const data = {
      fields: showEditWarning ? [] : instanceData.fields,
      project: formData.project,
      systemAuth: formData.systemAuth,
      systemType: formData.systemType,
      url: formData.url,
    };
    if (
      formData.username !== instanceData.username ||
      formData.password !== instanceData.password
    ) {
      data.username = formData.username;
      data.password = formData.password;
    }

    this.setState({
      showEditWarning: false,
    });

    return data;
  };

  createFormControlsConfig = () => ({
    setDisabled: this.setDisabled,
    onCancel: this.onCancel,
    prepareEditedDataForSubmit: this.prepareEditedDataForSubmit,
    editMode: !this.state.disabled,
    showEditWarning: this.state.showEditWarning,
    newItem: this.props.newItem,
  });

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('jira-instance-form')}>
        <InstanceFormControls
          formControls={this.createFormControlsConfig()}
          handleSubmit={this.props.handleSubmit}
          instanceData={this.props.instanceData}
        >
          <Fragment>
            <FormField
              name="url"
              fieldWrapperClassName={cx('instance-form-input-wrapper')}
              label={intl.formatMessage(messages.linkToBtsLabel)}
              labelClassName={cx('instance-field-label')}
              onChange={this.props.newItem ? null : this.inputChangeHandler}
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
              label={intl.formatMessage(messages.projectNameLabel)}
              labelClassName={cx('instance-field-label')}
              onChange={this.props.newItem ? null : this.inputChangeHandler}
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
              name="username"
              fieldWrapperClassName={cx('instance-form-input-wrapper')}
              label={intl.formatMessage(messages.usernameLabel)}
              labelClassName={cx('instance-field-label')}
              onChange={this.props.newItem ? null : this.usernameChangeHandler}
              required
              type="text"
              disabled={this.state.disabled}
            >
              <FieldErrorHint>
                <Input mobileDisabled />
              </FieldErrorHint>
            </FormField>
            <FormField
              name="password"
              fieldWrapperClassName={cx('instance-form-input-wrapper')}
              label={intl.formatMessage(messages.passwordLabel)}
              labelClassName={cx('instance-field-label')}
              required
              type="password"
              disabled={this.state.disabled}
            >
              <FieldErrorHint>
                <Input mobileDisabled />
              </FieldErrorHint>
            </FormField>
          </Fragment>
        </InstanceFormControls>
      </div>
    );
  }
}
