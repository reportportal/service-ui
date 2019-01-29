import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import {
  DASHBOARD,
  LAUNCH,
  WIDGET,
  FILTER,
  IMPORT,
  PROJECT,
  DEFECT_TYPE,
} from 'common/constants/eventsObjectTypes';
import styles from '../eventsGrid.scss';

const cx = classNames.bind(styles);

const objectTypesMessages = defineMessages({
  [DASHBOARD]: {
    id: 'EventObjectTypes.dashboard',
    defaultMessage: 'dashboard',
  },
  [LAUNCH]: {
    id: 'EventObjectTypes.launch',
    defaultMessage: 'launch',
  },
  [WIDGET]: {
    id: 'EventObjectTypes.widget',
    defaultMessage: 'widget',
  },
  [FILTER]: {
    id: 'EventObjectTypes.filter',
    defaultMessage: 'filter',
  },
  [IMPORT]: {
    id: 'EventObjectTypes.import',
    defaultMessage: 'import',
  },
  [PROJECT]: {
    id: 'EventObjectTypes.project',
    defaultMessage: 'project',
  },
  [DEFECT_TYPE]: {
    id: 'EventObjectTypes.defectType',
    defaultMessage: 'defectType',
  },
});
@injectIntl
export class EventObjectTypes extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    value: PropTypes.object,
    intl: intlShape.isRequired,
  };
  static defaultProps = {
    value: {},
  };

  render() {
    const { className, value, intl } = this.props;
    return (
      <div className={cx('object-type-col', className)}>
        {value.objectType && intl.formatMessage(objectTypesMessages[value.objectType])}
      </div>
    );
  }
}
