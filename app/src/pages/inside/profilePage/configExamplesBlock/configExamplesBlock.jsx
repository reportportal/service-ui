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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ContainerWithTabs } from 'components/main/containerWithTabs';
import { activeProjectSelector } from 'controllers/user';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './configExamplesBlock.scss';
import { BlockContainerBody } from '../blockContainer';

import { TabsConfig } from './tabsConfig';

const cx = classNames.bind(styles);
@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class ConfigExamplesBlock extends Component {
  static propTypes = {
    activeProject: PropTypes.string,
  };
  static defaultProps = {
    activeProject: '',
  };
  render() {
    const { activeProject } = this.props;
    return (
      <div className={cx('config-example-block')}>
        <BlockContainerBody>
          <div className={cx('content-container')}>
            <ContainerWithTabs
              selectTabEventInfo={PROFILE_PAGE_EVENTS.SELECT_CONFIGURATION_TAB}
              data={[
                TabsConfig.javaConfig(activeProject),
                TabsConfig.pythonConfig(activeProject),
                TabsConfig.dotNetConfig(activeProject),
                TabsConfig.nodejsConfig(activeProject),
                TabsConfig.rubyConfig(activeProject),
              ]}
            />
          </div>
        </BlockContainerBody>
      </div>
    );
  }
}
