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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import Parser from 'html-react-parser';
import { FormattedMessage } from 'react-intl';
import styles from './serviceVersionsBlock.scss';
import { ServiceVersionItem } from './serviceVersionItem';
import deprecatedIcon from '../../img/info-small-deprecated-inline.svg';
import currentIcon from '../../img/info-small-current-inline.svg';

const cx = classNames.bind(styles);

const ServiceVersionsBlockWithTooltip = ({ services }) => {
  return (
    <div className={cx('tooltip-block')}>
      <span className={cx('current-version')}>
        <FormattedMessage
          id={'ServiceVersionsBlock.currentVersion'}
          defaultMessage={'Current version'}
        />
      </span>
      :
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
ServiceVersionsBlockWithTooltip.propTypes = {
  services: PropTypes.object,
  serviceVersions: PropTypes.object,
  latestServiceVersions: PropTypes.object,
};
ServiceVersionsBlockWithTooltip.defaultProps = {
  serviceVersions: {},
  latestServiceVersions: {},
  services: {},
};
export const ServiceVersionsBlock = ({ isDeprecated }) => {
  const iconURL = isDeprecated ? deprecatedIcon : currentIcon;
  return <i className={cx('status-icon')}>{Parser(iconURL)}</i>;
};

ServiceVersionsBlock.propTypes = {
  isDeprecated: PropTypes.bool.isRequired,
};
ServiceVersionsBlock.defaultProps = {
  isDeprecated: false,
};

export const ServiceVersionItemTooltip = withTooltip({
  TooltipComponent: ServiceVersionsBlockWithTooltip,
  data: {
    dynamicWidth: true,
    placement: 'top',
    desktopOnly: true,
  },
})(ServiceVersionsBlock);
