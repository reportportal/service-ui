import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { DEFECT } from 'common/constants/settingsTabs';
import { DELETE_DEFECT, UPDATE_DEFECT } from 'common/constants/actionTypes';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [DELETE_DEFECT]: {
    id: 'DefectTypeChanges.delete',
    defaultMessage: 'deleted defect type',
  },
  [UPDATE_DEFECT]: {
    id: 'DefectTypeChanges.update',
    defaultMessage: 'updated',
  },
  defectTypes: {
    id: 'DefectTypeChanges.defectTypes',
    defaultMessage: 'defect types',
  },
});

@injectIntl
export class DefectType extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };
  state = {
    testItem: null,
  };

  render() {
    const { activity, intl } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        {messages[activity.actionType] && intl.formatMessage(messages[activity.actionType])}
        <Link
          to={getProjectSettingTabPageLink(activity.projectName, DEFECT)}
          className={cx('link')}
          target="_blank"
        >
          {activity.actionType === DELETE_DEFECT
            ? activity.details.objectName
            : intl.formatMessage(messages.defectTypes)}
        </Link>
      </Fragment>
    );
  }
}
