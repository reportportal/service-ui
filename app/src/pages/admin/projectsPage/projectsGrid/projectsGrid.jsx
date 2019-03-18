import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { Grid } from 'components/main/grid';
import {
  NameColumn,
  ProjectTypeColumn,
  OrganizationColumn,
  MembersColumn,
  LaunchesColumn,
  LastLaunchColumn,
} from './projectsGridColumns';

const messages = defineMessages({
  nameCol: { id: 'ProjectsGrid.nameCol', defaultMessage: 'Name' },
  projectTypeCol: { id: 'ProjectsGrid.projectTypeCol', defaultMessage: 'Project Type' },
  organizationCol: { id: 'ProjectsGrid.organizationCol', defaultMessage: 'Organization' },
  membersCol: { id: 'ProjectsGrid.membersCol', defaultMessage: 'Members' },
  launchesCol: { id: 'ProjectsGrid.launchesCol', defaultMessage: 'Launches' },
  lastLaunchCol: { id: 'ProjectsGrid.lastLaunchCol', defaultMessage: 'Last Launch date' },
});

@injectIntl
export class ProjectsGrid extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
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
      },
      component: MembersColumn,
    },
    {
      id: 'launches',
      title: {
        full: this.props.intl.formatMessage(messages.launchesCol),
      },
      component: LaunchesColumn,
    },
    {
      id: 'lastLaunch',
      title: {
        full: this.props.intl.formatMessage(messages.lastLaunchCol),
      },
      component: LastLaunchColumn,
    },
  ];

  COLUMNS = this.getColumns();

  render() {
    const { data, loading } = this.props;
    return (
      <Grid
        columns={this.COLUMNS}
        data={data}
        loading={loading}
        changeOnlyMobileLayout
        selectable
      />
    );
  }
}
