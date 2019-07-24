import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
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
import { messages } from './../../messages';

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
