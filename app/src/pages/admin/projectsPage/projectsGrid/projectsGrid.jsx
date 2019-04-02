import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
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
  NAME,
  TYPE,
  ORGANIZATION,
  USERS_QUANTITY,
  LAST_RUN,
  LAUNCHES_QUANTITY,
} from 'common/constants/projectsObjectTypes';
import {
  NameColumn,
  ProjectTypeColumn,
  OrganizationColumn,
  MembersColumn,
  LaunchesColumn,
  LastLaunchColumn,
  MenuColumn,
} from './projectsGridColumns';

import styles from './projectsGrid.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

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
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
  };

  static defaultProps = {
    projects: [],
    selectedProjects: [],
    loading: false,
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
  };

  getColumns = () => [
    {
      id: NAME,
      title: {
        full: this.props.intl.formatMessage(messages.nameCol),
      },
      maxHeight: 170,
      component: NameColumn,
      sortable: true,
    },
    {
      id: TYPE,
      title: {
        full: this.props.intl.formatMessage(messages.projectTypeCol),
      },
      component: ProjectTypeColumn,
      sortable: true,
    },
    {
      id: ORGANIZATION,
      title: {
        full: this.props.intl.formatMessage(messages.organizationCol),
      },
      component: OrganizationColumn,
      sortable: true,
    },
    {
      id: USERS_QUANTITY,
      title: {
        full: this.props.intl.formatMessage(messages.membersCol),
        short: this.props.intl.formatMessage(messages.membersColShort),
      },
      component: MembersColumn,
      sortable: true,
    },
    {
      id: LAUNCHES_QUANTITY,
      title: {
        full: this.props.intl.formatMessage(messages.launchesCol),
        short: this.props.intl.formatMessage(messages.launchesColShort),
      },
      component: LaunchesColumn,
      sortable: true,
    },
    {
      id: LAST_RUN,
      title: {
        full: this.props.intl.formatMessage(messages.lastLaunchCol),
        short: this.props.intl.formatMessage(messages.lastLaunchColShort),
      },
      component: LastLaunchColumn,
      sortable: true,
    },
    {
      id: 'menu',
      component: MenuColumn,
    },
  ];

  COLUMNS = this.getColumns();

  render() {
    const {
      projects,
      loading,
      selectedProjects,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
    } = this.props;

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
        sortingColumn={sortingColumn}
        sortingDirection={sortingDirection}
        onChangeSorting={onChangeSorting}
      />
    );
  }
}
