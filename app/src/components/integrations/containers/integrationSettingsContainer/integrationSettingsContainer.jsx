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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { updateIntegrationAction } from 'controllers/plugins';
import { PLUGIN_IMAGES_MAP } from 'components/integrations/constants';
import { INTEGRATIONS_SETTINGS_COMPONENTS_MAP } from 'components/integrations/settingsComponentsMap';
import styles from './integrationSettingsContainer.scss';

const cx = classNames.bind(styles);

@connect(null, {
  updateIntegrationAction,
})
export class IntegrationSettingsContainer extends Component {
  static propTypes = {
    goToPreviousPage: PropTypes.func.isRequired,
    updateIntegrationAction: PropTypes.func.isRequired,
    data: PropTypes.object,
    isGlobal: PropTypes.bool,
  };

  static defaultProps = {
    data: {},
    isGlobal: false,
  };

  state = {
    updatedParameters: {},
  };

  updateIntegration = (formData, onConfirm, metaData) => {
    const {
      data: {
        integrationType: { name: pluginName },
        id,
      },
      isGlobal,
    } = this.props;
    const data = {
      enabled: true,
      integrationParameters: formData,
    };

    if (formData.integrationName) {
      data.name = formData.integrationName;
    }

    this.props.updateIntegrationAction(
      data,
      isGlobal,
      id,
      pluginName,
      () => {
        this.setState({
          updatedParameters: data,
        });
        onConfirm();
      },
      metaData,
    );
  };

  render() {
    const { data, goToPreviousPage, isGlobal } = this.props;
    const { updatedParameters } = this.state;
    const instanceType = data.integrationType.name;
    const image = PLUGIN_IMAGES_MAP[instanceType];
    const IntegrationSettingsComponent = INTEGRATIONS_SETTINGS_COMPONENTS_MAP[instanceType];
    const updatedData = {
      ...data,
      name: updatedParameters.name || data.name,
      integrationParameters: {
        ...data.integrationParameters,
        ...updatedParameters.integrationParameters,
      },
    };

    return (
      <div className={cx('integration-settings-container')}>
        <div className={cx('settings-header')}>
          <img className={cx('logo')} src={image} alt={instanceType} />
          <h2 className={cx('title')}>{updatedData.name}</h2>
        </div>
        <IntegrationSettingsComponent
          data={updatedData}
          onUpdate={this.updateIntegration}
          goToPreviousPage={goToPreviousPage}
          isGlobal={isGlobal}
        />
      </div>
    );
  }
}
