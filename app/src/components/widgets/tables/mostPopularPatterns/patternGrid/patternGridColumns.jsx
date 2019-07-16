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

export const LaunchNameColumn = ({ value }) => (
  <div className={cx('launch-name')}>{`${value.name}${
    value.number ? `#${value.number}` : ''
  }`}</div>
);
LaunchNameColumn.propTypes = {
  value: PropTypes.object,
};
LaunchNameColumn.defaultProps = {
  value: {},
};

export const TestCasesColumn = ({ value }) => <div className={cx('test-cases')}>{value.count}</div>;
TestCasesColumn.propTypes = {
  value: PropTypes.object,
};
TestCasesColumn.defaultProps = {
  value: {},
};

export const TestCasesLinkColumn = ({ value, getLinkToLaunch }) => (
  <Link to={getLinkToLaunch(value.id)} className={cx('test-cases-link')}>
    {value.count}
  </Link>
);

TestCasesLinkColumn.propTypes = {
  value: PropTypes.object,
  getLinkToLaunch: PropTypes.func,
};
TestCasesLinkColumn.defaultProps = {
  value: {},
  getLinkToLaunch: () => {},
};
