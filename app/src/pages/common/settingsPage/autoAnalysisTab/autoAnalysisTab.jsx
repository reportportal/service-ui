import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { canUpdateSettings } from 'common/utils/permissions';
import { fetchConfigurationAttributesAction } from 'controllers/project';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { projectIdSelector } from 'controllers/pages';
import { AnalysisForm } from './analysisForm/analysisForm';
import { IndexActionsBlock } from './indexActionsBlock';
import styles from './autoAnalysisTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
  }),
  {
    fetchConfigurationAttributesAction,
  },
)
@injectIntl
export class AutoAnalysisTab extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    fetchConfigurationAttributesAction: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
  };

  static defaultProps = {
    projectId: '',
    fetchConfigurationAttributesAction: () => {},
  };

  componentDidMount() {
    this.props.fetchConfigurationAttributesAction(this.props.projectId);
  }

  render() {
    return (
      <div className={cx('auto-analysis-tab')}>
        <AnalysisForm
          projectId={this.props.projectId}
          disabled={!canUpdateSettings(this.props.accountRole, this.props.userRole)}
        />
        <IndexActionsBlock
          disabled={!canUpdateSettings(this.props.accountRole, this.props.userRole)}
        />
      </div>
    );
  }
}
