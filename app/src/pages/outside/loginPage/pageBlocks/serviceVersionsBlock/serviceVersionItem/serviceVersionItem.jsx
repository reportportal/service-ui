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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import styles from './serviceVersionItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  newVersion: {
    id: 'ServiceVersionItem.newVersion',
    defaultMessage: 'New version available: {newVersion}',
  },
});

@injectIntl
export class ServiceVersionItem extends Component {
  static propTypes = {
    serviceName: PropTypes.string,
    serviceVersion: PropTypes.string,
    serviceNewVersion: PropTypes.string,
    isDeprecated: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };
  static defaultProps = {
    serviceName: '',
    serviceVersion: '',
    serviceNewVersion: '',
    isDeprecated: false,
  };
  render() {
    const { serviceName, serviceVersion, serviceNewVersion, isDeprecated, intl } = this.props;
    const classes = {
      'service-version-item': true,
      deprecated: isDeprecated,
    };
    return (
      <span
        className={cx(classes)}
        title={
          isDeprecated
            ? intl.formatMessage(messages.newVersion, { newVersion: serviceNewVersion })
            : null
        }
      >
        {`${serviceName}: ${serviceVersion};`}
      </span>
    );
  }
}
