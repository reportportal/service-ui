import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { loadingSelector, projectsSelector } from 'controllers/administrate/projects';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ProjectPanel } from './projectPanel';
import styles from './projectsPanelView.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noProjects: {
    id: 'ProjectsPage.noProjects',
    defaultMessage: 'No projects',
  },
});
@connect((state) => ({
  projects: projectsSelector(state),
  loading: loadingSelector(state),
}))
@injectIntl
export class ProjectsPanelView extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projects: PropTypes.array,
    loading: PropTypes.bool,
    onMembers: PropTypes.func,
    onSettings: PropTypes.func,
    onAssign: PropTypes.func,
    onUnassign: PropTypes.func,
    onDelete: PropTypes.func,
  };

  static defaultProps = {
    projects: [],
    loading: false,
    onMembers: () => {},
    onSettings: () => {},
    onAssign: () => {},
    onUnassign: () => {},
    onDelete: () => {},
  };

  getPanelList = (projects) =>
    projects.map((project) => (
      <div className={cx('panel')} key={project.id}>
        <ProjectPanel
          project={project}
          onMembersClick={this.props.onMembers}
          onSettingsClick={this.props.onSettings}
          onAssign={this.props.onAssign}
          onUnassign={this.props.onUnassign}
          onDelete={this.props.onDelete}
        />
      </div>
    ));

  render() {
    const { intl, projects, loading } = this.props;
    return (
      <Fragment>
        {loading && (
          <div className={cx('spinner-block')}>
            <SpinningPreloader />
          </div>
        )}
        {!loading &&
          (projects.length ? (
            <div className={cx('panel-list')}>{this.getPanelList(projects)}</div>
          ) : (
            <div className={cx('no-projects')}>{intl.formatMessage(messages.noProjects)}</div>
          ))}
      </Fragment>
    );
  }
}
