import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { canUpdateSettings } from 'common/utils/permissions';
import { fetchAutoAnalysisConfigurationAction } from 'controllers/project';
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { AnalysisForm } from './analysisForm/analysisForm';
import { IndexActionsBlock } from './indexActionsBlock';
import styles from './autoAnalysisTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
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
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
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
      <div className={cx('auto-analysis-tab')}>
        <AnalysisForm disabled={!canUpdateSettings(this.props.accountRole, this.props.userRole)} />
        <IndexActionsBlock
          disabled={!canUpdateSettings(this.props.accountRole, this.props.userRole)}
        />
        <div className={cx('mobile-disabling-cover')} />
      </div>
    );
  }
}
