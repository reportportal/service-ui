import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { SORTING_ASC } from 'controllers/sorting';
import { InputDropdownSorting } from 'components/inputs/inputDropdownSorting';
import {
  CREATION_DATE,
  NAME,
  TYPE,
  ORGANIZATION,
  USERS_QUANTITY,
  LAST_RUN,
  LAUNCHES_QUANTITY,
} from 'common/constants/projectsObjectTypes';
import styles from './projectsSorting.scss';

const messages = defineMessages({
  sortBy: { id: 'ProjectsPage.sortBy', defaultMessage: 'Sort by' },
  dateCol: { id: 'ProjectsPage.dateCol', defaultMessage: 'Date' },
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

const cx = classNames.bind(styles);

@injectIntl
export class ProjectsSorting extends Component {
  static propTypes = {
    intl: intlShape,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    sortingColumn: null,
    sortingDirection: SORTING_ASC,
    onChangeSorting: () => {},
  };

  getSortOptions = () => [
    {
      value: CREATION_DATE,
      label: this.props.intl.formatMessage(messages.dateCol),
      disabled: false,
    },
    {
      value: NAME,
      label: this.props.intl.formatMessage(messages.nameCol),
      disabled: false,
    },
    {
      value: USERS_QUANTITY,
      label: this.props.intl.formatMessage(messages.membersCol),
      disabled: false,
    },
    {
      value: LAUNCHES_QUANTITY,
      label: this.props.intl.formatMessage(messages.launchesCol),
      disabled: false,
    },
    {
      value: LAST_RUN,
      label: this.props.intl.formatMessage(messages.lastLaunchCol),
      disabled: false,
    },
    {
      value: TYPE,
      label: this.props.intl.formatMessage(messages.projectTypeCol),
      disabled: false,
    },
    {
      value: ORGANIZATION,
      label: this.props.intl.formatMessage(messages.organizationCol),
      disabled: false,
    },
  ];

  handleChange = (field) => {
    this.props.onChangeSorting(field);
  };

  render() {
    const { intl, sortingColumn, sortingDirection } = this.props;

    return (
      <div className={cx('sorting-block')}>
        <div className={cx('caption')}>{intl.formatMessage(messages.sortBy)}:</div>
        <InputDropdownSorting
          value={sortingColumn}
          options={this.getSortOptions()}
          onChange={this.handleChange}
          sortingMode={sortingDirection === SORTING_ASC}
        />
      </div>
    );
  }
}
