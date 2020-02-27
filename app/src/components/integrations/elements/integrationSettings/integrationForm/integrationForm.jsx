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
import { injectIntl, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { BigButton } from 'components/buttons/bigButton';
import { GhostButton } from 'components/buttons/ghostButton';
import { isIntegrationSupportsMultipleInstances } from 'components/integrations/utils';
import styles from './integrationForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  configureTitle: {
    id: 'IntegrationForm.configureTitle',
    defaultMessage: 'Configure',
  },
  configurationTitle: {
    id: 'IntegrationForm.configurationTitle',
    defaultMessage: 'Configuration',
  },
  configurationNotSpecifiedInfo: {
    id: 'IntegrationForm.configurationNotSpecifiedInfo',
    defaultMessage: 'Configuration not specified.',
  },
});

@reduxForm()
@injectIntl
export class IntegrationForm extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    formFieldsComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
    connected: PropTypes.bool.isRequired,
    isEmptyConfiguration: PropTypes.bool.isRequired,
    pluginName: PropTypes.string.isRequired,
    isGlobal: PropTypes.bool,
  };

  static defaultProps = {
    isGlobal: false,
  };

  state = {
    disabled: !this.props.isEmptyConfiguration,
    metaData: {},
  };

  isSupportsMultipleInstances = isIntegrationSupportsMultipleInstances(
    this.props.data.integrationType.name,
  );

  toggleDisabled = () => {
    if (this.props.dirty && !this.state.disabled) {
      this.props.reset();
    }
    this.setState({ disabled: !this.state.disabled });
  };

  submitIntegrationSuccess = () => {
    this.setState({ disabled: true });
  };

  submitIntegration = (formData) => {
    this.props.onSubmit(formData, this.submitIntegrationSuccess, this.state.metaData);
  };

  updateMetaData = (metaData) => {
    this.setState({
      metaData: {
        ...this.state.metaData,
        ...metaData,
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      data: { blocked, id, integrationParameters = {}, integrationType = {} },
      handleSubmit,
      initialize,
      change,
      connected,
      formFieldsComponent: FieldsComponent,
      isEmptyConfiguration,
      isGlobal,
      pluginName,
    } = this.props;
    const { disabled } = this.state;
    const isConfigurationNotSpecified = blocked && isEmptyConfiguration;
    const shouldFieldsBeHidden = !connected && this.isSupportsMultipleInstances;

    return (
      <form className={cx('integration-form')}>
        <h3 className={cx('block-header')}>{formatMessage(messages.configurationTitle)}</h3>
        {isConfigurationNotSpecified ? (
          <p className={cx('configuration-not-specified-info')}>
            {formatMessage(messages.configurationNotSpecifiedInfo)}
          </p>
        ) : (
          <div className={cx('integration-form-fields')}>
            {shouldFieldsBeHidden ? null : (
              <FieldsComponent
                initialize={initialize}
                change={change}
                instanceId={id}
                initialData={integrationParameters}
                pluginDetails={integrationType.details}
                disabled={disabled}
                updateMetaData={this.updateMetaData}
                isGlobal={isGlobal}
                pluginName={pluginName}
              />
            )}
          </div>
        )}
        {!blocked && (
          <div className={cx('controls-block')}>
            {disabled ? (
              <GhostButton
                onClick={this.toggleDisabled}
                disabled={shouldFieldsBeHidden}
                mobileDisabled
              >
                {formatMessage(messages.configureTitle)}
              </GhostButton>
            ) : (
              <div className={cx('control-buttons-block')}>
                {!isEmptyConfiguration && (
                  <div className={cx('button-container')}>
                    <BigButton
                      color={'gray-60'}
                      onClick={this.toggleDisabled}
                      disabled={shouldFieldsBeHidden}
                    >
                      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
                    </BigButton>
                  </div>
                )}
                <div className={cx('button-container')}>
                  <BigButton
                    onClick={handleSubmit(this.submitIntegration)}
                    disabled={shouldFieldsBeHidden}
                  >
                    {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
                  </BigButton>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    );
  }
}
