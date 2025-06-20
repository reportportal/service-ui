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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { Dropdown, ThemeProvider } from '@reportportal/ui-kit';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import styles from './btsIntegrationSelector.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  btsTitle: {
    id: 'BtsIntegrationSelector.btsTitle',
    defaultMessage: 'BTS',
  },
  integrationNameTitle: {
    id: 'BtsIntegrationSelector.integrationNameTitle',
    defaultMessage: 'Integration name',
  },
});

@injectIntl
export class BtsIntegrationSelector extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    namedBtsIntegrations: PropTypes.object.isRequired,
    pluginName: PropTypes.string.isRequired,
    integrationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onChangePluginName: PropTypes.func.isRequired,
    onChangeIntegration: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.pluginNamesOptions = Object.keys(props.namedBtsIntegrations).map((key) => ({
      value: key,
      label: props.namedBtsIntegrations[key][0]?.integrationType.details.name || key,
    }));
  }

  getIntegrationNamesOptions = () =>
    this.props.namedBtsIntegrations[this.props.pluginName].map((item) => ({
      value: item.id,
      label: item.name,
    }));

  isMultipleBtsPlugins = () => Object.keys(this.props.namedBtsIntegrations).length > 1;

  isMultipleBtsIntegrations = () =>
    this.props.namedBtsIntegrations[this.props.pluginName].length > 1;

  render() {
    const { intl, pluginName, onChangePluginName, integrationId, onChangeIntegration } = this.props;

    return (
      <ThemeProvider theme="dark">
        <FieldElement
          className={cx('field-wrapper')}
          label={intl.formatMessage(messages.btsTitle)}
          labelClassName={cx('label')}
          withoutProvider
        >
          <Dropdown
            value={pluginName}
            options={this.pluginNamesOptions}
            onChange={onChangePluginName}
            disabled={!this.isMultipleBtsPlugins()}
          />
        </FieldElement>
        <FieldElement
          className={cx('field-wrapper')}
          label={intl.formatMessage(messages.integrationNameTitle)}
          labelClassName={cx('label')}
          withoutProvider
        >
          <Dropdown
            value={integrationId}
            options={this.getIntegrationNamesOptions()}
            onChange={onChangeIntegration}
            disabled={!this.isMultipleBtsIntegrations()}
          />
        </FieldElement>
      </ThemeProvider>
    );
  }
}
