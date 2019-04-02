import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { redirect } from 'redux-first-router';

import {
  assignToProjectAction,
  unassignFromProjectAction,
  assignedProjectsSelector,
  userIdSelector,
} from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { deleteProjectAction } from 'controllers/administrate/projects';
import { PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { SETTINGS, MEMBERS } from 'common/constants/projectSections';
import { DotsMenuButton, SEPARATOR_ITEM, DANGER_ITEM } from 'components/buttons/dotsMenuButton';
import { ADMIN_ALL_PROJECTS_PAGE_MODAL_EVENTS } from 'components/main/analytics/events';
import { messages } from '../messages';

@connect(
  (state, ownProps) => ({
    isAssigned: !!assignedProjectsSelector(state)[ownProps.project.projectName],
    userId: userIdSelector(state),
  }),
  {
    redirect,
    showModal: showModalAction,
    assignToProject: assignToProjectAction,
    unassignFromProject: unassignFromProjectAction,
    deleteProject: deleteProjectAction,
  },
)
@injectIntl
export class ProjectMenu extends Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    isAssigned: PropTypes.bool.isRequired,
    userId: PropTypes.string.isRequired,
    redirect: PropTypes.func.isRequired,
    assignToProject: PropTypes.func.isRequired,
    unassignFromProject: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
  };

  onAssign = () => {
    const { assignToProject, project } = this.props;
    assignToProject(project);
  };

  onUnassign = () => {
    const { unassignFromProject, project } = this.props;
    unassignFromProject(project);
  };

  onDelete = () => {
    const { showModal, intl, userId, project } = this.props;
    const { projectName } = project;
    showModal({
      id: 'deleteItemsModal',
      data: {
        items: [project],
        onConfirm: this.onDeleteSubmit,
        header: intl.formatMessage(messages.deleteModalHeader),
        mainContent: intl.formatMessage(messages.deleteModalContent, {
          name: projectName,
        }),
        userId,
        eventsInfo: {
          closeIcon: ADMIN_ALL_PROJECTS_PAGE_MODAL_EVENTS.CLOSE_ICON_DELETE_MODAL,
          cancelBtn: ADMIN_ALL_PROJECTS_PAGE_MODAL_EVENTS.CANCEL_BTN_DELETE_MODAL,
          deleteBtn: ADMIN_ALL_PROJECTS_PAGE_MODAL_EVENTS.DELETE_BTN_DELETE_MODAL,
        },
      },
    });
  };

  onDeleteSubmit = () => {
    this.props.deleteProject(this.props.project);
  };

  getMenuItems = () => {
    const { intl, project, isAssigned, userId } = this.props;
    const isPersonalProject = project.projectName === `${userId}_personal`;
    return [
      {
        onClick: this.redirectToMembers,
        label: intl.formatMessage(messages.members),
        value: 'action-members',
      },
      {
        onClick: this.redirectToSettings,
        label: intl.formatMessage(messages.settings),
        value: 'action-settings',
      },
      {
        type: SEPARATOR_ITEM,
      },
      {
        onClick: this.onUnassign,
        label: intl.formatMessage(messages.unassign),
        value: 'action-unassign',
        hidden: !isAssigned,
        disabled: isPersonalProject,
        title: isPersonalProject ? intl.formatMessage(messages.unassignFromPersonal) : '',
      },
      {
        onClick: this.onAssign,
        label: intl.formatMessage(messages.assign),
        value: 'action-assign',
        hidden: isAssigned,
      },
      {
        onClick: this.onDelete,
        label: intl.formatMessage(messages.delete),
        value: 'action-delete',
        type: DANGER_ITEM,
      },
    ];
  };

  redirectToMembers = () => {
    const { projectName } = this.props.project;
    this.props.redirect({
      type: PROJECT_DETAILS_PAGE,
      payload: { projectId: projectName, projectSection: MEMBERS },
    });
  };

  redirectToSettings = () => {
    const { projectName } = this.props.project;
    this.props.redirect({
      type: PROJECT_DETAILS_PAGE,
      payload: { projectId: projectName, projectSection: SETTINGS },
    });
  };

  render() {
    return <DotsMenuButton items={this.getMenuItems()} />;
  }
}
