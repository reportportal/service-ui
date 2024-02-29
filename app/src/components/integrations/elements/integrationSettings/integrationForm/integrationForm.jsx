/*
 * Copyright 2022 EPAM Systems
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
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Button } from 'componentLibrary/button';
import { isIntegrationSupportsMultipleInstances } from 'components/integrations/utils';
import { PLUGINS_PAGE_EVENTS, SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
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
    defaultMessage: 'Configuration is not specified',
  },
});

@reduxForm()
@track()
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
    isEditable: PropTypes.bool.isRequired,
    isGlobal: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    isGlobal: false,
  };

  state = {
    disabled: !this.props.isEmptyConfiguration,
    metaData: {},
  };

  toggleDisabled = () => {
    if (this.props.dirty && !this.state.disabled) {
      this.props.reset();
    }
    this.props.tracking.trackEvent(
      (this.props.isGlobal ? PLUGINS_PAGE_EVENTS : SETTINGS_PAGE_EVENTS).pluginConfigureClick(
        this.props.data.integrationType.name,
      ),
    );
    this.setState({ disabled: !this.state.disabled });
  };

  submitIntegrationSuccess = () => {
    this.setState({ disabled: true });
  };

  submitIntegration = (formData) => {
    this.props.onSubmit(formData, this.submitIntegrationSuccess, this.state.metaData);
    this.props.tracking.trackEvent(
      (this.props.isGlobal ? PLUGINS_PAGE_EVENTS : SETTINGS_PAGE_EVENTS).pluginConfigureClickSubmit(
        this.props.data.integrationType.name,
      ),
    );
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
      isEditable,
    } = this.props;
    const isSupportsMultipleInstances = isIntegrationSupportsMultipleInstances(pluginName);

    const { disabled } = this.state;
    const isConfigurationNotSpecified = (blocked || !isEditable) && isEmptyConfiguration;
    const shouldFieldsBeHidden = !connected && isSupportsMultipleInstances;

    return (
      <form
        className={cx('integration-form', {
          'configuration-not-specified-view': isConfigurationNotSpecified,
        })}
      >
        {!shouldFieldsBeHidden && (
          <>
            {isConfigurationNotSpecified ? (
              <p className={cx('configuration-not-specified-info')}>
                {formatMessage(messages.configurationNotSpecifiedInfo)}
              </p>
            ) : (
              <>
                <h3 className={cx('block-header')}>{formatMessage(messages.configurationTitle)}</h3>
                <div className={cx('integration-form-fields')}>
                  {!shouldFieldsBeHidden && (
                    <FieldsComponent
                      initialize={initialize}
                      change={change}
                      integrationId={id}
                      initialData={integrationParameters}
                      pluginDetails={integrationType.details}
                      disabled={disabled}
                      updateMetaData={this.updateMetaData}
                      isGlobal={isGlobal}
                      pluginName={pluginName}
                    />
                  )}
                </div>
              </>
            )}
            {!blocked && isEditable && (
              <div className={cx('controls-block')}>
                {disabled ? (
                  <Button onClick={this.toggleDisabled} disabled={shouldFieldsBeHidden}>
                    {formatMessage(COMMON_LOCALE_KEYS.EDIT)}
                  </Button>
                ) : (
                  <div className={cx('control-buttons-block')}>
                    <div className={cx('button-container')}>
                      <Button
                        onClick={handleSubmit(this.submitIntegration)}
                        disabled={shouldFieldsBeHidden}
                      >
                        {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
                      </Button>
                    </div>

                    {!isEmptyConfiguration && (
                      <div className={cx('button-container')}>
                        <Button
                          variant="ghost"
                          onClick={this.toggleDisabled}
                          disabled={shouldFieldsBeHidden}
                        >
                          {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </form>
    );
  }
}
