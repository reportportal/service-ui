import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { Grid } from 'components/main/grid';
import {
  loadingSelector,
  projectsSelector,
  selectedProjectsSelector,
  toggleAllProjectsAction,
  toggleProjectSelectionAction,
} from 'controllers/administrate/projects';
import {
  NameColumn,
  ProjectTypeColumn,
  OrganizationColumn,
  MembersColumn,
  LaunchesColumn,
  LastLaunchColumn,
} from './projectsGridColumns';

import styles from './projectsGrid.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  nameCol: { id: 'ProjectsGrid.nameCol', defaultMessage: 'Name' },
  projectTypeCol: { id: 'ProjectsGrid.projectTypeCol', defaultMessage: 'Project Type' },
  organizationCol: { id: 'ProjectsGrid.organizationCol', defaultMessage: 'Organization' },
  membersCol: { id: 'ProjectsGrid.membersCol', defaultMessage: 'Members' },
  membersColShort: { id: 'ProjectsGrid.membersColShort', defaultMessage: 'Mmbrs' },
  launchesCol: { id: 'ProjectsGrid.launchesCol', defaultMessage: 'Launches' },
  launchesColShort: { id: 'ProjectsGrid.launchesColShort', defaultMessage: 'Lnchs' },
  lastLaunchCol: { id: 'ProjectsGrid.lastLaunchCol', defaultMessage: 'Last Launch date' },
  lastLaunchColShort: { id: 'ProjectsGrid.lastLaunchColShort', defaultMessage: 'Lnch date' },
});

@connect(
  (state) => ({
    projects: projectsSelector(state),
    loading: loadingSelector(state),
    selectedProjects: selectedProjectsSelector(state),
  }),
  {
    toggleProjectSelectionAction,
    toggleAllProjectsAction,
  },
)
@injectIntl
export class ProjectsGrid extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    projects: PropTypes.arrayOf(PropTypes.object),
    selectedProjects: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
    toggleProjectSelectionAction: PropTypes.func.isRequired,
    toggleAllProjectsAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    projects: [],
    selectedProjects: [],
    loading: false,
  };

  getColumns = () => [
    {
      id: 'name',
      title: {
        full: this.props.intl.formatMessage(messages.nameCol),
      },
      maxHeight: 170,
      component: NameColumn,
    },
    {
      id: 'projectType',
      title: {
        full: this.props.intl.formatMessage(messages.projectTypeCol),
      },
      component: ProjectTypeColumn,
    },
    {
      id: 'organization',
      title: {
        full: this.props.intl.formatMessage(messages.organizationCol),
      },
      component: OrganizationColumn,
    },
    {
      id: 'members',
      title: {
        full: this.props.intl.formatMessage(messages.membersCol),
        short: this.props.intl.formatMessage(messages.membersColShort),
      },
      component: MembersColumn,
    },
    {
      id: 'launches',
      title: {
        full: this.props.intl.formatMessage(messages.launchesCol),
        short: this.props.intl.formatMessage(messages.launchesColShort),
      },
      component: LaunchesColumn,
    },
    {
      id: 'lastLaunch',
      title: {
        full: this.props.intl.formatMessage(messages.lastLaunchCol),
        short: this.props.intl.formatMessage(messages.lastLaunchColShort),
      },
      component: LastLaunchColumn,
    },
  ];

  COLUMNS = this.getColumns();

  render() {
    const { projects, loading, selectedProjects } = this.props;

    return (
      <Grid
        columns={this.COLUMNS}
        data={projects}
        loading={loading}
        selectedItems={selectedProjects}
        selectable
        onToggleSelection={this.props.toggleProjectSelectionAction}
        onToggleSelectAll={() => this.props.toggleAllProjectsAction(projects)}
        className={cx('projects-grid')}
        gridRowClassName={cx('projects-grid-row')}
        headerClassName={cx('projects-header')}
      />
    );
  }
}
