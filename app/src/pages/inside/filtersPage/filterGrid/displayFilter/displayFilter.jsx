import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import styles from './displayFilter.scss';

const cx = classNames.bind(styles);

export const DisplayFilter = ({ userFilters, filter, onChangeDisplay }) => {
  const isFilterDisplayed = !!userFilters.find((item) => item.id === filter.id);
  return (
    <Fragment>
      <div className={cx('mobile-label', 'display-label')}>
        <FormattedMessage id={'DisplayFilter.display'} defaultMessage={'Display on launches:'} />
      </div>
      <div className={cx('switcher-wrapper')}>
        <InputSwitcher
          value={!!isFilterDisplayed}
          onChange={() => onChangeDisplay(isFilterDisplayed, filter)}
        >
          <span className={cx('switcher-label')}>
            {isFilterDisplayed ? (
              <FormattedMessage
                id={'DisplayFilter.showOnLaunchesSwitcherOn'}
                defaultMessage={'ON'}
              />
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
};
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
