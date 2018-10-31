import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import {
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  START_IMPORT,
  FINISH_IMPORT,
} from 'common/constants/actionTypes';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [START_LAUNCH]: {
    id: 'LaunchChanges.start',
    defaultMessage: 'started',
  },
  [FINISH_LAUNCH]: {
    id: 'LaunchChanges.finish',
    defaultMessage: 'finished',
  },
  [DELETE_LAUNCH]: {
    id: 'LaunchChanges.delete',
    defaultMessage: 'deleted',
  },
  [START_IMPORT]: {
    id: 'LaunchChanges.startImport',
    defaultMessage: 'started import',
  },
  [FINISH_IMPORT]: {
    id: 'LaunchChanges.finishImport',
    defaultMessage: 'finished import',
  },
  launch: {
    id: 'LaunchChanges.launch',
    defaultMessage: 'launch',
  },
});

@injectIntl
export class Launch extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };

  render() {
    const { activity, intl } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.userRef}</span>
        {intl.formatMessage(messages[activity.actionType])}
        {activity.actionType === DELETE_LAUNCH && (
          <span>
            <span> {intl.formatMessage(messages.launch)} </span>
            {activity.name}
          </span>
        )}
        {(activity.actionType === START_LAUNCH || activity.actionType === FINISH_LAUNCH) && (
          <span>
            <span> {intl.formatMessage(messages.launch)} </span>
            <a
              target="_blank"
              className={cx('link')}
              href={URLS.launch(activity.projectRef, activity.loggedObjectRef)}
            >
              {activity.name}
            </a>
          </span>
        )}
        {(activity.actionType === START_IMPORT || activity.actionType === FINISH_IMPORT) && (
          <a target="_blank" className={cx('link')} href={`#${activity.projectRef}/launches/all`}>
            {activity.name}
          </a>
        )}
      </Fragment>
    );
  }
}
