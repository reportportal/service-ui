import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  start_launch: {
    id: 'LaunchChanges.start',
    defaultMessage: 'started',
  },
  finish_launch: {
    id: 'LaunchChanges.finish',
    defaultMessage: 'finished',
  },
  delete_launch: {
    id: 'LaunchChanges.delete',
    defaultMessage: 'deleted',
  },
  finish_import: {
    id: 'LaunchChanges.finishImport',
    defaultMessage: 'finished import',
  },
  start_import: {
    id: 'LaunchChanges.startImport',
    defaultMessage: 'started import',
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
        {activity.actionType === 'delete_launch' && (
          <span>
            <span> {intl.formatMessage(messages.launch)} </span>
            {activity.name}
          </span>
        )}
        {(activity.actionType === 'start_launch' || activity.actionType === 'finish_launch') && (
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
        {(activity.actionType === 'finish_import' || activity.actionType === 'start_import') && (
          <a target="_blank" className={cx('link')} href={`#${activity.projectRef}/launches/all`}>
            {activity.name}
          </a>
        )}
      </Fragment>
    );
  }
}
