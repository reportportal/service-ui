import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { DEFECT } from 'common/constants/settingsTabs';
import { DELETE_DEFECT, UPDATE_DEFECT } from 'common/constants/actionTypes';
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
    const link = `#${activity.projectRef}/settings/${DEFECT}`;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.userRef}</span>
        {intl.formatMessage(messages[activity.actionType])}
        <a target="_blank" href={link} className={cx('link')}>
          {activity.actionType === DELETE_DEFECT
            ? activity.name
            : intl.formatMessage(messages.defectTypes)}
        </a>
      </Fragment>
    );
  }
}
