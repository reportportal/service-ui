/*
 * Copyright 2023 EPAM Systems
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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styles from './serviceVersionsTooltip.scss';
import { ServiceVersionItem } from '../../serviceVersionItem';

const cx = classNames.bind(styles);

export const ServiceVersionsTooltip = ({ services, className }) => {
  return (
    <div className={cx(className)}>
      <span className={cx('current-version')}>
        <FormattedMessage
          id={'ServiceVersionsBlock.currentVersion'}
          defaultMessage={'Current version:'}
        />
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
              isDeprecated={!!value.isDeprecated}
            />
          );
        })}
      </span>
    </div>
  );
};
ServiceVersionsTooltip.propTypes = {
  services: PropTypes.object,
  className: PropTypes.string,
};
ServiceVersionsTooltip.defaultProps = {
  services: {},
  className: '',
};
