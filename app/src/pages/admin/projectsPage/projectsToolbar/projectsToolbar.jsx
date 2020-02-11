/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { InputFilter } from 'components/inputs/inputFilter';
import { FilterEntitiesURLContainer } from 'components/filterEntities/containers';
import { GhostButton } from 'components/buttons/ghostButton';
import { ADMIN_PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events';

import {
  GRID_VIEW,
  TABLE_VIEW,
  startSetViewMode,
  viewModeSelector,
  selectedProjectsSelector,
  fetchProjectsAction,
  deleteItemsAction,
  unselectAllProjectsAction,
  querySelector,
} from 'controllers/administrate/projects';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';

import ExportIcon from 'common/img/export-inline.svg';
import GridViewDashboardIcon from 'common/img/grid-inline.svg';
import TableViewDashboardIcon from 'common/img/table-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { PROJECTS } from 'common/constants/projectsObjectTypes';
import { collectFilterEntities } from 'components/filterEntities/containers/utils';
import { downloadFile } from 'common/utils/downloadFile';
import { messages } from './../messages';
import { ProjectEntities } from './projectEntities';
import { ProjectsSorting } from './projectsSorting';
import styles from './projectsToolbar.scss';

const cx = classNames.bind(styles);
@connect(
  (state) => ({
    filterEntities: collectFilterEntities(querySelector(state)),
    selectedProjects: selectedProjectsSelector(state),
    viewMode: viewModeSelector(state),
  }),
  {
    setViewMode: startSetViewMode,
    deleteItemsAction,
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    fetchProjectsAction,
    unselectAllProjectsAction,
  },
)
@injectIntl
@track()
export class ProjectsToolbar extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    viewMode: PropTypes.string,
    setViewMode: PropTypes.func.isRequired,
    selectedProjects: PropTypes.arrayOf(PropTypes.object),
    filterEntities: PropTypes.object,
    deleteItemsAction: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    fetchProjectsAction: PropTypes.func.isRequired,
    unselectAllProjectsAction: PropTypes.func.isRequired,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    viewMode: GRID_VIEW,
    selectedProjects: [],
    filterEntities: {},
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
  };

  onExportProjects = () => {
    this.props.tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.EXPORT_BTN);
    downloadFile(URLS.exportProjects(this.props.filterEntities));
  };

  getSelectedProjectsNames = () =>
    this.props.selectedProjects.map(({ projectName }) => `'<b>${projectName}</b>'`).join(', ');

  confirmDeleteItems = (projectsToDelete) => {
    const ids = projectsToDelete.map((project) => project.id);

    this.props.showScreenLockAction();

    fetch(URLS.project(''), {
      method: 'delete',
      data: {
        ids,
      },
    })
      .then(() => {
        this.props.unselectAllProjectsAction();
        this.props.fetchProjectsAction();
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            projectsToDelete.length === 1
              ? this.props.intl.formatMessage(messages.deleteSuccess)
              : this.props.intl.formatMessage(messages.deleteSuccessMultiple),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            projectsToDelete.length === 1
              ? this.props.intl.formatMessage(messages.deleteError)
              : this.props.intl.formatMessage(messages.deleteErrorMultiple),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  deleteProjects = () => {
    const { selectedProjects, intl, tracking } = this.props;
    tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.DELETE_PROJECT_BTN);

    this.props.deleteItemsAction(selectedProjects, {
      onConfirm: this.confirmDeleteItems,
      header:
        selectedProjects.length === 1
          ? intl.formatMessage(messages.deleteModalHeader)
          : intl.formatMessage(messages.deleteModalMultipleHeader),
      mainContent:
        selectedProjects.length === 1
          ? intl.formatMessage(messages.deleteModalContent, {
              name: this.getSelectedProjectsNames(),
            })
          : intl.formatMessage(messages.deleteModalMultipleContent, {
              names: this.getSelectedProjectsNames(),
            }),
      eventsInfo: {
        closeIcon: ADMIN_PROJECTS_PAGE_EVENTS.CLOSE_ICON_DELETE_MODAL,
        cancelBtn: ADMIN_PROJECTS_PAGE_EVENTS.CANCEL_BTN_DELETE_MODAL,
        deleteBtn: ADMIN_PROJECTS_PAGE_EVENTS.DELETE_BTN_DELETE_MODAL,
      },
    });
  };

  render() {
    const {
      intl,
      tracking,
      viewMode,
      setViewMode,
      selectedProjects,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
    } = this.props;
    const selectedProjectsCount = selectedProjects.length;

    return (
      <div className={cx('toolbar')}>
        <div className={cx('search')}>
          <FilterEntitiesURLContainer
            debounced={false}
            render={({ entities, onChange }) => (
              <InputFilter
                id={PROJECTS}
                entitiesProvider={ProjectEntities}
                filterValues={entities}
                onChange={onChange}
                eventsInfo={{
                  enterFilter: ADMIN_PROJECTS_PAGE_EVENTS.ENTER_FILTER,
                  openFilter: ADMIN_PROJECTS_PAGE_EVENTS.FUNNEL_BTN,
                  applyBtn: ADMIN_PROJECTS_PAGE_EVENTS.APPLY_FILTER_BTN,
                }}
              />
            )}
          />
        </div>
        <div className={cx('buttons')}>
          {selectedProjectsCount > 0 ? (
            <Fragment>
              <div className={cx('delete-info')}>
                {intl.formatMessage(messages.deleteProjectsCount, {
                  count: selectedProjectsCount,
                })}
              </div>
              <button className={cx('delete-button')} onClick={this.deleteProjects}>
                {intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
              </button>
            </Fragment>
          ) : (
            <Fragment>
              {viewMode === GRID_VIEW && (
                <div className={cx('toolbar-button', 'mobile-hide')}>
                  <ProjectsSorting
                    sortingColumn={sortingColumn}
                    sortingDirection={sortingDirection}
                    onChangeSorting={onChangeSorting}
                  />
                </div>
              )}
              <div className={cx('toolbar-button', 'mobile-hide')}>
                <GhostButton icon={ExportIcon} mobileDisabled onClick={this.onExportProjects}>
                  <FormattedMessage id="ProjectsToolbar.export" defaultMessage="Export" />
                </GhostButton>
              </div>
              <div
                className={cx('toolbar-button', {
                  'toolbar-active-button': viewMode === GRID_VIEW,
                })}
              >
                <GhostButton
                  icon={GridViewDashboardIcon}
                  onClick={() => {
                    setViewMode(GRID_VIEW);
                    tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.SET_TILE_VIEW);
                  }}
                />
              </div>
              <div
                className={cx('toolbar-button', {
                  'toolbar-active-button': viewMode === TABLE_VIEW,
                })}
              >
                <GhostButton
                  icon={TableViewDashboardIcon}
                  onClick={() => {
                    setViewMode(TABLE_VIEW);
                    tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.SET_TABLE_VIEW);
                  }}
                />
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
