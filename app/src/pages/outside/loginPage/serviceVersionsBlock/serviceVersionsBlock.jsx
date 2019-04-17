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

import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import styles from './serviceVersionsBlock.scss';
import { ServiceVersionItem } from './serviceVersionItem';

const cx = classNames.bind(styles);

export const ServiceVersionsBlock = ({ services }) => (
  <div className={cx('service-versions-block')}>
    <span className={cx('current-version')}>
      <FormattedMessage
        id={'ServiceVersionsBlock.currentVersion'}
        defaultMessage={'Current version'}
      />:
    </span>
    <span className={cx('versions-list')}>
      {Object.keys(services).map((objKey) => {
        const value = services[objKey];

        return (
          <ServiceVersionItem
            // eslint-disable-next-line react/no-array-index-key
            key={objKey}
            serviceName={value.name}
            serviceVersion={value.version}
            serviceNewVersion={value.newVersion}
            isDeprecated={value.isDeprecated}
          />
        );
      })}
    </span>
  </div>
);

ServiceVersionsBlock.propTypes = {
  serviceVersions: PropTypes.object,
  latestServiceVersions: PropTypes.object,
  services: PropTypes.object,
};
ServiceVersionsBlock.defaultProps = {
  serviceVersions: {},
  latestServiceVersions: {},
  services: {},
};
