import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { projectAnalyzerConfigSelector, fetchProjectAction } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { StrategyBlock } from './strategyBlock';
import { IndexActionsBlock } from './indexActionsBlock';
import styles from './autoAnalysisTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    analyzerConfiguration: projectAnalyzerConfigSelector(state),
    projectId: activeProjectSelector(state),
  }),
  {
    fetchProjectAction,
  },
)
@injectIntl
export class AutoAnalysisTab extends PureComponent {
  static propTypes = {
    analyzerConfiguration: PropTypes.object,
    projectId: PropTypes.string,
    fetchProjectAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    analyzerConfiguration: {},
    projectId: '',
    fetchProjectAction: () => {},
  };

  componentDidMount() {
    this.props.fetchProjectAction(this.props.projectId);
  }

  render() {
    const { analyzerConfiguration } = this.props;
    return (
      <div className={cx('settings-tab-content')}>
        <StrategyBlock
          analyzer_mode={analyzerConfiguration.analyzer_mode}
          isAutoAnalyzerEnabled={analyzerConfiguration.isAutoAnalyzerEnabled}
        />
        <IndexActionsBlock indexing_running={analyzerConfiguration.indexing_running} />
      </div>
    );
  }
}
