/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
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
    intl: intlShape.isRequired,
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
