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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import SauceLabsIcon from 'common/img/plugins/sauce-labs-gray.png';
import SauceLabsActiveIcon from 'common/img/plugins/sauce-labs-active.png';
import { SAUCE_LABS } from 'common/constants/pluginNames';
import { PLUGIN_NAME_TITLES } from 'components/integrations';
import styles from './sauceLabsIntegrationButton.scss';

const cx = classNames.bind(styles);

export const SauceLabsIntegrationButton = ({ active, onClick }) => {
  const title = PLUGIN_NAME_TITLES[SAUCE_LABS];

  return (
    <button className={cx('sauce-labs-integration-button', { active })} onClick={onClick}>
      <img
        className={cx('sauce-labs-integration-button--icon')}
        src={active ? SauceLabsActiveIcon : SauceLabsIcon}
        alt={title}
        title={title}
      />
      <div className={cx('sauce-labs-integration-button--label')}>{title}</div>
    </button>
  );
};

SauceLabsIntegrationButton.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
};

SauceLabsIntegrationButton.defaultProps = {
  onClick: () => {},
  active: false,
};
