import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { updateProjectIntegrationAction, updateGlobalIntegrationAction } from 'controllers/plugins';
import { INTEGRATIONS_SETTINGS_COMPONENTS_MAP, INTEGRATIONS_IMAGES_MAP } from '../../constants';
import styles from './integrationSettingsContainer.scss';

const cx = classNames.bind(styles);

@connect(null, {
  updateProjectIntegrationAction,
  updateGlobalIntegrationAction,
})
export class IntegrationSettingsContainer extends Component {
  static propTypes = {
    goToPreviousPage: PropTypes.func.isRequired,
    updateProjectIntegrationAction: PropTypes.func.isRequired,
    updateGlobalIntegrationAction: PropTypes.func.isRequired,
    data: PropTypes.object,
    pluginPageType: PropTypes.bool,
  };

  static defaultProps = {
    data: {},
    pluginPageType: false,
  };

  state = {
    updatedParameters: {},
  };

  updateIntegration = (formData, onConfirm) => {
    const {
      data: { id },
      pluginPageType,
    } = this.props;
    const data = {
      enabled: true,
      integrationParameters: formData,
    };

    if (formData.integrationName) {
      data.name = formData.integrationName;
    }

    pluginPageType
      ? this.props.updateGlobalIntegrationAction(data, pluginPageType, id, () => {
          onConfirm();
          this.setState({
            updatedParameters: data,
          });
        })
      : this.props.updateProjectIntegrationAction(data, pluginPageType, id, () => {
          onConfirm();
          this.setState({
            updatedParameters: data,
          });
        });
  };

  render() {
    const { data, goToPreviousPage, pluginPageType } = this.props;
    const integrationName = data.integrationType.name;
    const image = INTEGRATIONS_IMAGES_MAP[integrationName];
    const IntegrationSettingsComponent = INTEGRATIONS_SETTINGS_COMPONENTS_MAP[integrationName];
    const updatedData = {
      ...data,
      ...this.state.updatedParameters,
    };

    return (
      <div className={cx('integration-settings-container')}>
        <div className={cx('settings-header')}>
          <img className={cx('logo')} src={image} alt={integrationName} />
          <h2 className={cx('title')}>{updatedData.name}</h2>
        </div>
        <IntegrationSettingsComponent
          data={updatedData}
          onUpdate={this.updateIntegration}
          goToPreviousPage={goToPreviousPage}
          pluginPageType={pluginPageType}
        />
      </div>
    );
  }
}
