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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ReactObserver from 'react-event-observer';
import { Fullscreen } from 'components/containers/fullscreen';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex/dist/commonjs';
import 'react-reflex/styles.css';
import { SAUCE_LABS } from 'common/constants/pluginNames';
import { activeLogSelector } from 'controllers/log';
import { availableIntegrationsByPluginNameSelector } from 'controllers/plugins';
import {
  bulkExecuteSauceLabsCommandAction,
  sauceLabsLoadingSelector,
  SAUCE_LABS_JOB_INFO_COMMAND,
  SAUCE_LABS_LOGS_COMMAND,
  SAUCE_LABS_ASSETS_COMMAND,
  SAUCE_LABS_TOKEN_COMMAND,
} from 'controllers/log/sauceLabs';
import { getSauceLabsConfig } from 'components/integrations/integrationProviders/sauceLabsIntegration/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { VideoSection } from './videoSection';
import { JobInfoSection } from './jobInfoSection';
import styles from './sauceLabsSection.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    logItem: activeLogSelector(state),
    loading: sauceLabsLoadingSelector(state),
    sauceLabsIntegrations: availableIntegrationsByPluginNameSelector(state, SAUCE_LABS),
  }),
  {
    executeCommands: bulkExecuteSauceLabsCommandAction,
  },
)
export class SauceLabsSection extends Component {
  static propTypes = {
    sauceLabsIntegrations: PropTypes.array.isRequired,
    logItem: PropTypes.object,
    executeCommands: PropTypes.func,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    logItem: {},
    executeCommands: () => {},
    loading: false,
  };

  constructor(props) {
    super(props);
    this.observer = ReactObserver();
    this.state = {
      isFullscreenMode: false,
    };
  }

  componentDidMount() {
    const { logItem, sauceLabsIntegrations } = this.props;
    this.slIntegrationConfig = getSauceLabsConfig(logItem.attributes, sauceLabsIntegrations);
    this.props.executeCommands(
      [
        SAUCE_LABS_TOKEN_COMMAND,
        SAUCE_LABS_JOB_INFO_COMMAND,
        SAUCE_LABS_LOGS_COMMAND,
        SAUCE_LABS_ASSETS_COMMAND,
      ],
      this.slIntegrationConfig,
    );
  }

  toggleFullscreenMode = (isFullscreenModeNewValue) => {
    const isFullscreenMode =
      typeof isFullscreenModeNewValue === 'boolean'
        ? isFullscreenModeNewValue
        : !this.state.isFullscreenMode;
    this.setState({
      isFullscreenMode,
    });
  };

  render() {
    const { loading } = this.props;
    const { isFullscreenMode } = this.state;
    const Content = (
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement minSize="300" className={cx('video-container')}>
          <VideoSection
            observer={this.observer}
            isFullscreenMode={isFullscreenMode}
            onToggleFullscreen={this.toggleFullscreenMode}
          />
        </ReflexElement>
        <ReflexSplitter className={cx('elements-splitter')} />
        <ReflexElement minSize="320" className={cx('job-info-container')}>
          <JobInfoSection observer={this.observer} isFullscreenMode={isFullscreenMode} />
        </ReflexElement>
      </ReflexContainer>
    );

    return (
      <div className={cx('sauce-labs-section')}>
        {loading || !this.slIntegrationConfig ? (
          <SpinningPreloader />
        ) : (
          <Fullscreen enabled={isFullscreenMode} onChange={this.toggleFullscreenMode}>
            {isFullscreenMode ? (
              <ScrollWrapper hideTracksWhenNotNeeded autoHide>
                {Content}
              </ScrollWrapper>
            ) : (
              Content
            )}
          </Fullscreen>
        )}
      </div>
    );
  }
}
