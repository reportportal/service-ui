import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import styles from './displayFilter.scss';

const cx = classNames.bind(styles);

export const DisplayFilter = ({ userFilters, filter, onChangeDisplay }) => (
  <Fragment>
    <div className={cx('mobile-label', 'display-label')}>
      <FormattedMessage id={'DisplayFilter.display'} defaultMessage={'Display on launches:'} />
    </div>
    <div className={cx('switcher-wrapper')}>
      <InputSwitcher
        value={userFilters.indexOf(filter.id) !== -1}
        onChange={() => onChangeDisplay(filter.id)}
      >
        <span className={cx('switcher-label')}>
          {userFilters.indexOf(filter.id) !== -1 ? (
            <FormattedMessage id={'DisplayFilter.showOnLaunchesSwitcherOn'} defaultMessage={'ON'} />
          ) : (
            <FormattedMessage
              id={'DisplayFilter.showOnLaunchesSwitcherOff'}
              defaultMessage={'OFF'}
            />
          )}
        </span>
      </InputSwitcher>
    </div>
    <div className={cx('separator')} />
  </Fragment>
);
DisplayFilter.propTypes = {
  userFilters: PropTypes.array,
  filter: PropTypes.object,
  onChangeDisplay: PropTypes.func,
};
DisplayFilter.defaultProps = {
  userFilters: [],
  filter: {},
  onChangeDisplay: () => {},
};
