import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { fetchAutoAnalysisConfigurationAction } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { AnalysisForm } from './analysisForm/analysisForm';
import { IndexActionsBlock } from './indexActionsBlock';
import styles from './autoAnalysisTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    fetchAutoAnalysisConfigurationAction,
  },
)
@injectIntl
export class AutoAnalysisTab extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    fetchAutoAnalysisConfigurationAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    projectId: '',
    fetchAutoAnalysisConfigurationAction: () => {},
  };

  componentDidMount() {
    this.props.fetchAutoAnalysisConfigurationAction(this.props.projectId);
  }

  render() {
    return (
      <div className={cx('settings-tab-content')}>
        <AnalysisForm />
        <IndexActionsBlock />
        <div className={cx('mobile-disabling-cover')} />
      </div>
    );
  }
}
