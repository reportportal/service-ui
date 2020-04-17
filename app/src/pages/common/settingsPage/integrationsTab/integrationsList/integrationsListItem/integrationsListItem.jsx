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
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { PLUGIN_IMAGES_MAP, PLUGIN_NAME_TITLES } from 'components/integrations';
import styles from './integrationsListItem.scss';

const cx = classNames.bind(styles);

@injectIntl
export class IntegrationsListItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    integrationType: PropTypes.object.isRequired,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    onClick: () => {},
  };

  itemClickHandler = () => this.props.onClick(this.props.integrationType);

  render() {
    const {
      integrationType: { name, uploadedBy },
    } = this.props;

    return (
      <div className={cx('integrations-list-item')} onClick={this.itemClickHandler}>
        <img className={cx('integration-image')} src={PLUGIN_IMAGES_MAP[name]} alt={name} />
        <div className={cx('integration-info-block')}>
          <span className={cx('integration-name')}>{PLUGIN_NAME_TITLES[name] || name}</span>
          <span className={cx('plugin-author')}>{`by ${uploadedBy || 'Report Portal'}`}</span>
        </div>
      </div>
    );
  }
}
