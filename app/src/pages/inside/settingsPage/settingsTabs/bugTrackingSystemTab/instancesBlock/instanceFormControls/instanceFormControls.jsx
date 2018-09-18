import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { BigButton } from 'components/buttons/bigButton';
import EditIcon from 'common/img/pencil-icon-inline.svg';
import DeleteIcon from 'common/img/circle-cross-icon-inline.svg';
import { activeProjectSelector } from 'controllers/user';
// import { externalSystemSelector, updateExternalSystemAction } from 'controllers/project';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { DefaultPropertiesForIssueForm } from '../defaultPropertiesForIssueForm';
import { ErrorMessageBlock } from './errorMessageBlock';
import styles from './instanceFormControls.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  editProjectWarning: {
    id: 'InstanceFormControls.editProjectWarning',
    defaultMessage: '! The default properties for issue will be reset',
  },
  editProjectTitle: {
    id: 'InstanceFormControls.editProjectTitle',
    defaultMessage: 'Edit',
  },
  removeProjectTitle: {
    id: 'InstanceFormControls.removeProjectTitle',
    defaultMessage: 'Remove project',
  },
});

@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
    // TODO: rewrite all logic responsible for externalSystems updates
    // externalSystems: externalSystemSelector(state),
  }),
  {
    showModalAction,
    showNotification,
    // updateExternalSystemAction,
  },
)
@injectIntl
export class InstanceFormControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    instanceData: PropTypes.object,
    formControls: PropTypes.shape({
      setDisabled: PropTypes.func,
      onCancel: PropTypes.func,
      prepareEditedDataForSubmit: PropTypes.func,
      newItem: PropTypes.bool,
    }),
    handleSubmit: PropTypes.func,
    externalSystems: PropTypes.array,
    currentProject: PropTypes.string,
    showNotification: PropTypes.func,
    showModalAction: PropTypes.func,
    updateExternalSystemAction: PropTypes.func,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    instanceData: {},
    formControls: {},
    handleSubmit: () => {},
    currentProject: '',
    externalSystems: [],
    showNotification: () => {},
    showModalAction: () => {},
    updateExternalSystemAction: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      errorMessage: false,
    };
  }

  shouldComponentUpdate() {
    this.state.errorMessage &&
      this.setState({
        errorMessage: false,
      });
    return true;
  }

  deleteInstanceHandler = () => {
    this.props.showModalAction({
      id: 'deleteInstanceModal',
      data: {
        instanceId: this.props.instanceData.id,
        instanceTitle: this.props.instanceData.project,
        systemType: this.props.instanceData.systemType,
      },
    });
  };

  fetchNewInstance = (currentProject, systemType, data) => {
    if (
      !this.props.externalSystems.length ||
      this.props.externalSystems.some((item) => item.systemType === systemType)
    ) {
      this.fetchPostInstance(currentProject, data).catch(this.catchError);
    } else {
      fetch(URLS.externalSystemClear(currentProject), { method: 'delete' })
        .then(() =>
          // this.updateExternalSystemsInStore([]);
          this.fetchPostInstance(currentProject, data),
        )
        .catch(this.catchError);
    }
  };

  catchError = (error) =>
    this.setState({
      loading: false,
      errorMessage: error.message,
    });

  fetchPostInstance = (currentProject, data) =>
    fetch(URLS.externalSystem(currentProject), { method: 'post', data }).then(({ id }) => {
      const newExternalSystemConfig = {
        id,
        projectRef: currentProject,
        ...data,
      };
      this.setState({
        loading: false,
      });
      delete newExternalSystemConfig.password;
      // this.updateExternalSystemsInStore([...this.props.externalSystems, newExternalSystemConfig]);
    });

  fetchEditExternalSystem = (currentProject, instanceId, data) =>
    fetch(URLS.externalSystemInstance(currentProject, instanceId), { method: 'put', data }).then(
      ({ msg }) => {
        const indexToEdit = this.props.externalSystems.findIndex((item) => item.id === instanceId);
        const updatedExternalSystemInstances = [...this.props.externalSystems];
        updatedExternalSystemInstances.splice(indexToEdit, 1, {
          ...this.props.externalSystems[indexToEdit],
          ...data,
        });
        this.setState({
          loading: false,
        });
        // this.updateExternalSystemsInStore(updatedExternalSystemInstances);
        this.props.formControls.setDisabled(true);
        this.props.showNotification({
          message: msg,
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        return Promise.resolve();
      },
    );

  // updateExternalSystemsInStore = (newInstances) =>
  //   this.props.updateExternalSystemAction(newInstances);

  submitHandler = (data) => {
    const {
      formControls: { prepareEditedDataForSubmit, newItem },
      currentProject,
      instanceData: { id, systemType },
    } = this.props;

    this.setState({
      loading: true,
    });

    newItem
      ? this.fetchNewInstance(currentProject, systemType, data)
      : this.fetchEditExternalSystem(currentProject, id, prepareEditedDataForSubmit(data)).catch(
          this.catchError,
        );
  };

  render() {
    const { intl, formControls, instanceData, handleSubmit } = this.props;

    return (
      <div className={cx('instance-form-controls')}>
        {!formControls.editMode && (
          <div className={cx('controls-items')}>
            <span
              title={intl.formatMessage(messages.editProjectTitle)}
              onClick={() => formControls.setDisabled(false)}
              className={cx('controls-item')}
            >
              {Parser(EditIcon)}
            </span>
            <span
              title={intl.formatMessage(messages.removeProjectTitle)}
              onClick={this.deleteInstanceHandler}
              className={cx('controls-item')}
            >
              {Parser(DeleteIcon)}
            </span>
          </div>
        )}
        {this.props.children}
        {formControls.showEditWarning && (
          <div className={cx('edit-project-warning')}>
            {intl.formatMessage(messages.editProjectWarning)}
          </div>
        )}
        {formControls.editMode && (
          <div className={cx('buttons-block')}>
            {!formControls.newItem && (
              <div className={cx('button-container')}>
                <BigButton
                  color={'gray-60'}
                  disabled={this.state.loading}
                  onClick={formControls.onCancel}
                >
                  {intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
                </BigButton>
              </div>
            )}
            <div className={cx('button-container')}>
              <BigButton disabled={this.state.loading} onClick={handleSubmit(this.submitHandler)}>
                {intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
              </BigButton>
            </div>
          </div>
        )}
        {this.state.errorMessage && <ErrorMessageBlock message={this.state.errorMessage} />}
        {instanceData.id &&
          !this.state.errorMessage && (
            <DefaultPropertiesForIssueForm
              fetchEditExternalSystem={this.fetchEditExternalSystem}
              instanceData={instanceData}
            />
          )}
        <div className={cx('disabling-cover')} />
      </div>
    );
  }
}
