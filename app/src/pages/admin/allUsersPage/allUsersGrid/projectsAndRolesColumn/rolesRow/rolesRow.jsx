import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { URLS } from 'common/urls';
import { ROLES_MAP, MEMBER, PROJECT_ROLES } from 'common/constants/projectRoles';
import { isEmptyValue } from 'common/utils/isEmptyValue';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import CheckIcon from 'common/img/check-inline.svg';
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
});

@injectIntl
export class RolesRow extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.oneOf(PROJECT_ROLES),
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onAssignProjectRole: PropTypes.func,
    project: PropTypes.string,
    createNew: PropTypes.bool,
    userId: PropTypes.string,
    entryType: PropTypes.string,
    accountType: PropTypes.string,
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
      this.props.onAssignProjectRole(project.value, value);
    }
    this.props.onChange(project, value);
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
  formatValue = (values) => values.map((value) => ({ value, label: value }));
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

    if (this.isPersonalProject() && !different) {
      const Tooltip = () => (
        <TextTooltip tooltipContent={intl.formatMessage(messages.unAssignFromPersonalProject)} />
      );
      const WrappedComponent = () => (
        <IconComponent different={different} disable clickHandler={null} icon={CrossIcon} />
      );
      const Wrapper = withTooltip({ TooltipComponent: Tooltip })(WrappedComponent);
      return <Wrapper />;
    }
    if (this.isProjectEmpty()) {
      return <IconComponent different={different} disable clickHandler={null} icon={CheckIcon} />;
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
    const { createNew, intl } = this.props;
    const { value, project } = this.state;
    const uri = URLS.projectNameSearch();
    return (
      <div className={cx('roles-row')}>
        <div className={cx('roles-row-item', 'roles-row-item-first')}>
          {createNew ? (
            <InputTagsSearch
              value={project}
              minLength={1}
              async
              uri={uri}
              makeOptions={this.formatValue}
              onChange={this.projectSearchHandler}
              placeholder={intl.formatMessage(messages.projectSearchPlaceholder)}
              removeSelected
            />
          ) : (
            <div className={cx('roles-row-label')}>{project}</div>
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
