import PropTypes from 'prop-types';
import React from 'react';
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import styles from './patternGrid.scss';

const cx = classNames.bind(styles);

export const PatternNameColumn = ({ value, onPatternClick }) => (
  <div className={cx('patterns-name')}>
    <span className={cx('pattern-link')} onClick={() => onPatternClick(value.name)}>
      {value.name}
    </span>
  </div>
);
PatternNameColumn.propTypes = {
  value: PropTypes.object,
  onPatternClick: PropTypes.func,
};
PatternNameColumn.defaultProps = {
  value: {},
  onPatternClick: () => {},
};

export const LaunchNameColumn = ({ value, getLinkToLaunch }) => (
  <Link to={getLinkToLaunch(value.id)} className={cx('launches-link')}>
    {`${value.name}${value.number ? ` #${value.number}` : ''}`}
  </Link>
);
LaunchNameColumn.propTypes = {
  value: PropTypes.object,
  getLinkToLaunch: PropTypes.func,
};
LaunchNameColumn.defaultProps = {
  value: {},
  getLinkToLaunch: () => {},
};

export const TestCasesColumn = ({ value }) => <div className={cx('test-cases')}>{value.count}</div>;
TestCasesColumn.propTypes = {
  value: PropTypes.object,
};
TestCasesColumn.defaultProps = {
  value: {},
};
