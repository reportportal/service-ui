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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import track from 'react-tracking';
import { ADMIN_ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { URLS } from 'common/urls';
import { ROLES_MAP, MEMBER, PROJECT_ROLES } from 'common/constants/projectRoles';
import { isEmptyValue } from 'common/utils/isEmptyValue';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import CheckIcon from 'common/img/check-inline.svg';
import { ProjectName } from 'pages/admin/projectsPage/projectName';
import styles from './rolesRow.scss';

const cx = classNames.bind(styles);

const IconComponent = ({ different, disable, clickHandler, icon }) => (
  <div
    className={cx('roles-row-icon', {
      'roles-row-icon-check': different,
      'roles-row-icon-disable': disable,
    })}
    onClick={clickHandler}
  >
    {Parser(icon)}
  </div>
);
IconComponent.propTypes = {
  different: PropTypes.bool,
  disable: PropTypes.bool,
  clickHandler: PropTypes.func,
  icon: PropTypes.string,
};
IconComponent.defaultProps = {
  different: false,
  disable: false,
  clickHandler: () => {},
  icon: null,
};
const messages = defineMessages({
  projectSearchPlaceholder: { id: 'rolesRow.projectSearchPlaceholder', defaultMessage: 'Project' },
  unAssignFromPersonalProject: {
    id: 'rolesRow.unAssignFromPersonalProject',
    defaultMessage: 'Impossible to unassign user from personal project',
  },
  unAssignFromProject: {
    id: 'UnassignButton.unAssignTitle',
    defaultMessage: 'Unassign user from project',
  },
});

@injectIntl
@track()
export class RolesRow extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.oneOf(PROJECT_ROLES),
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onAssignProjectRole: PropTypes.func,
    project: PropTypes.string,
    createNew: PropTypes.bool,
    userId: PropTypes.string,
    entryType: PropTypes.string,
    accountType: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    value: MEMBER,
    project: null,
    onChange: () => {},
    onDelete: () => {},
    onAssignProjectRole: () => {},
    createNew: false,
    entryType: '',
    userId: '',
    accountType: '',
  };
  constructor(props) {
    super(props);
    const { value, project } = props;
    this.state = {
      value,
      project,
    };
  }
  onDelete = () => {
    const { project } = this.state;
    this.props.onDelete(project);
  };
  onChange = () => {
    const { value, project } = this.state;
    const { createNew } = this.props;
    if (createNew) {
      this.props.tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.ASSIGN_PROJECT_AND_ROLES);
      this.props.onAssignProjectRole(project, value);
    }
    this.props.onChange(project, value);
    this.props.tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.CHANGE_ROLE_PROJECT_AND_ROLES);
  };
  getRolesMap = () =>
    ROLES_MAP.map((role) => {
      const { label, value } = role;
      return {
        label: this.capitalizeString(label),
        value,
      };
    });
  dropdownHandler = (value) => {
    this.setState({
      value,
    });
  };
  projectSearchHandler = (project) => {
    this.setState({
      project,
    });
  };
  capitalizeString = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();
  isDifferentFromInitial = () => this.props.value !== this.state.value;
  isPersonalProject = () => {
    const { entryType, userId } = this.props;
    const { project } = this.state;
    return entryType === 'PERSONAL' && project === `${userId.replace('.', '_')}_personal`;
  };

  isProjectEmpty = () => {
    const { project } = this.state;
    return isEmptyValue(project);
  };
  renderIconComponent = () => {
    const { createNew, intl } = this.props;
    const different = this.isDifferentFromInitial() || createNew;
    const clickHandler = different ? this.onChange : this.onDelete;
    const icon = different ? CheckIcon : CrossIcon;
    if (this.isProjectEmpty()) {
      return <IconComponent different={different} disable clickHandler={null} icon={CheckIcon} />;
    }
    if (!different) {
      const tooltipMessage = this.isPersonalProject()
        ? intl.formatMessage(messages.unAssignFromPersonalProject)
        : intl.formatMessage(messages.unAssignFromProject);
      const Tooltip = () => <TextTooltip tooltipContent={tooltipMessage} />;
      const WrappedComponent = () => (
        <IconComponent
          different={different}
          disable={this.isPersonalProject()}
          clickHandler={!this.isPersonalProject() ? clickHandler : null}
          icon={CrossIcon}
        />
      );
      const Wrapper = withTooltip({ TooltipComponent: Tooltip })(WrappedComponent);
      return <Wrapper />;
    }
    return (
      <IconComponent
        different={different}
        disable={false}
        clickHandler={clickHandler}
        icon={icon}
      />
    );
  };
  render() {
    const { createNew, intl, entryType } = this.props;
    const { value, project } = this.state;
    return (
      <div className={cx('roles-row')}>
        <div className={cx('roles-row-item', 'roles-row-item-first')}>
          {createNew ? (
            <AsyncAutocomplete
              value={project}
              minLength={1}
              getURI={URLS.projectNameSearch}
              onChange={this.projectSearchHandler}
              placeholder={intl.formatMessage(messages.projectSearchPlaceholder)}
            />
          ) : (
            <div className={cx('roles-row-label')}>
              <ProjectName
                project={{
                  projectName: project,
                  entryType,
                }}
              />
            </div>
          )}
        </div>
        <div className={cx('roles-row-item', 'roles-row-item-last')}>
          <InputDropdown
            options={this.getRolesMap()}
            value={value}
            onChange={this.dropdownHandler}
          />
        </div>
        {this.renderIconComponent()}
      </div>
    );
  }
}
