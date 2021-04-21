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

import classNames from 'classnames/bind';
import track from 'react-tracking';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Manager, Popper, Reference } from 'react-popper';
import { PROJECT_PAGE } from 'controllers/pages/constants';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NavLink } from 'components/main/navLink';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './projectSelector.scss';

const cx = classNames.bind(styles);

const Tooltip = ({ activeProject }) => (
  <div className={cx('project-selector-tooltip')}>{activeProject}</div>
);
Tooltip.propTypes = {
  activeProject: PropTypes.string.isRequired,
};

const CurrentProjectBlock = ({ getProjectName }) => {
  return (
    <>
      <div className={cx('current-project-name')}>{getProjectName()}</div>
      <div className={cx('show-list-icon')} />
    </>
  );
};

CurrentProjectBlock.propTypes = {
  getProjectName: PropTypes.func.isRequired,
};

const CurrentProjectNameWithTooltip = withTooltip({
  TooltipComponent: Tooltip,
  data: {
    dynamicWidth: true,
    placement: 'right',
    tooltipTriggerClass: cx('tooltip-trigger'),
    dark: true,
  },
})(CurrentProjectBlock);

@track()
export class ProjectSelector extends Component {
  static propTypes = {
    projects: PropTypes.arrayOf(PropTypes.string),
    activeProject: PropTypes.string,
    mobileOnly: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    projects: [],
    activeProject: '',
    mobileOnly: false,
  };

  controlNode = null;

  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  onClickProjectName = () => {
    this.props.tracking.trackEvent(SIDEBAR_EVENTS.CLICK_PROJECT_NAME_LINK);
  };

  toggleShowList = () => {
    this.props.tracking.trackEvent(SIDEBAR_EVENTS.CLICK_PROJECT_DROPDOWN);
    this.setState({ opened: !this.state.opened });
  };

  handleOutsideClick = (e) => {
    if (this.controlNode && !this.controlNode.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };

  getProjectName = () => {
    const { activeProject, mobileOnly } = this.props;
    const projectName = activeProject.toString();

    return mobileOnly ? projectName : `${projectName[0]}${projectName[projectName.length - 1]}`;
  };

  render() {
    const { projects, mobileOnly, activeProject } = this.props;
    const { opened } = this.state;

    return (
      <div
        className={cx('project-selector', { shown: this.state.opened, 'only-mobile': mobileOnly })}
      >
        <Manager>
          <Reference>
            {({ ref }) => (
              <div
                ref={(node) => {
                  ref(node);
                  this.controlNode = node;
                }}
                className={cx('current-project-block')}
                onClick={this.toggleShowList}
              >
                <CurrentProjectNameWithTooltip
                  getProjectName={this.getProjectName}
                  activeProject={activeProject}
                  showTooltip={!opened && !mobileOnly}
                />
              </div>
            )}
          </Reference>
          <Popper placement={mobileOnly ? 'bottom-start' : 'right-end'} eventsEnabled={false}>
            {({ ref, style, placement }) => (
              <div
                className={cx('projects-list')}
                ref={ref}
                style={style}
                data-placement={placement}
              >
                <ScrollWrapper autoHeight autoHeightMax={600}>
                  {projects.map((project) => (
                    <NavLink
                      to={{ type: PROJECT_PAGE, payload: { projectId: project } }}
                      key={project}
                      className={cx('project-list-item')}
                      activeClassName={cx('active')}
                      onClick={this.onClickProjectName}
                    >
                      <span title={project}>{project}</span>
                    </NavLink>
                  ))}
                </ScrollWrapper>
              </div>
            )}
          </Popper>
        </Manager>
      </div>
    );
  }
}
