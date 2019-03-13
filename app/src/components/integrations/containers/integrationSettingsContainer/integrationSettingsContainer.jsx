import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { projectIdSelector } from 'controllers/pages';
import { fetchProjectIntegrationsAction } from 'controllers/project';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { INTEGRATIONS_SETTINGS_COMPONENTS_MAP, INTEGRATIONS_IMAGES_MAP } from '../../constants';
import styles from './integrationSettingsContainer.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  updateIntegrationSuccess: {
    id: 'IntegrationSettingsContainer.updateIntegrationSuccess',
    defaultMessage: 'Integration successfully updated',
  },
});

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
  }),
  {
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    showDefaultErrorNotification,
    fetchProjectIntegrationsAction,
  },
)
@injectIntl
export class IntegrationSettingsContainer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    fetchProjectIntegrationsAction: PropTypes.func.isRequired,
    data: PropTypes.object,
    title: PropTypes.string,
  };

  static defaultProps = {
    data: {},
    title: '',
  };

  state = {
    updatedParameters: {},
  };

  updateIntegration = (formData, onConfirm) => {
    const {
      intl: { formatMessage },
      projectId,
      data: { id, integrationType },
    } = this.props;

    this.props.showScreenLockAction();

    const data = {
      enabled: true,
      integrationName: integrationType.name,
      integrationParameters: formData,
    };

    fetch(URLS.projectIntegration(projectId, id), { method: 'put', data })
      .then(() => {
        this.props.fetchProjectIntegrationsAction(projectId);
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message: formatMessage(messages.updateIntegrationSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        onConfirm();
        this.setState({
          updatedParameters: formData,
        });
      })
      .catch((error) => {
        this.props.hideScreenLockAction();
        this.props.showDefaultErrorNotification(error);
      });
  };

  render() {
    const { data, title, goToPreviousPage, projectId } = this.props;
    const integrationName = data.integrationType.name;
    const image = INTEGRATIONS_IMAGES_MAP[integrationName];
    const IntegrationSettingsComponent = INTEGRATIONS_SETTINGS_COMPONENTS_MAP[integrationName];
    const updatedData = {
      ...data,
      integrationParameters: {
        ...data.integrationParameters,
        ...this.state.updatedParameters,
      },
    };

    return (
      <div className={cx('integration-settings-container')}>
        <div className={cx('settings-header')}>
          <img className={cx('logo')} src={image} alt={title} />
          <h2 className={cx('title')}>{title}</h2>
        </div>
        <IntegrationSettingsComponent
          data={updatedData}
          projectId={projectId}
          onUpdate={this.updateIntegration}
          goToPreviousPage={goToPreviousPage}
        />
      </div>
    );
  }
}
