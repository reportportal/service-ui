import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ReactObserver from 'react-event-observer';
import Fullscreen from 'react-full-screen';
import { activeLogSelector } from 'controllers/log';
import {
  bulkExecuteSauceLabsCommandAction,
  sauceLabsLoadingSelector,
  SAUCE_LABS_JOB_INFO_COMMAND,
  SAUCE_LABS_LOGS_COMMAND,
  SAUCE_LABS_ASSETS_COMMAND,
} from 'controllers/log/sauceLabs';
import { getSauceLabsConfig } from 'components/integrations/integrationProviders/sauceLabsIntegration/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { VideoSection } from './videoSection';
import { JobInfoSection } from './jobInfoSection';
import styles from './sauceLabsSection.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    logItem: activeLogSelector(state),
    loading: sauceLabsLoadingSelector(state),
  }),
  {
    executeCommands: bulkExecuteSauceLabsCommandAction,
  },
)
export class SauceLabsSection extends Component {
  static propTypes = {
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
    this.slIntegrationConfig = getSauceLabsConfig(this.props.logItem.attributes);
    this.props.executeCommands(
      [SAUCE_LABS_JOB_INFO_COMMAND, SAUCE_LABS_LOGS_COMMAND, SAUCE_LABS_ASSETS_COMMAND],
      this.slIntegrationConfig,
    );
  }

  toggleFullscreenMode = () => {
    this.setState({
      isFullscreenMode: !this.state.isFullscreenMode,
    });
  };

  render() {
    const { loading } = this.props;
    return (
      <div className={cx('sauce-labs-section')}>
        {loading || !this.slIntegrationConfig ? (
          <SpinningPreloader />
        ) : (
          <Fullscreen enabled={this.state.isFullscreenMode}>
            <VideoSection
              observer={this.observer}
              isFullscreenMode={this.state.isFullscreenMode}
              onToggleFullscreen={this.toggleFullscreenMode}
            />
            <JobInfoSection observer={this.observer} />
          </Fullscreen>
        )}
      </div>
    );
  }
}
