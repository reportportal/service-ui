import * as React from 'react';
import { arrayOf, bool, string } from 'prop-types';
import classNames from 'classnames/bind';
import styles from '../testsTableWidget.scss';

const cx = classNames.bind(styles);

const Matrix = ({ tests, id }) => (
  <div className={cx('matrix')}>
    <div className={cx('squares-wrapper')}>
      {/* eslint-disable */
      tests.map((failed, idx) => (
        <div key={`${id}-square-${idx}`} className={cx('square', { failed })} />
      ))
      /* eslint-disable */
      }
    </div>
  </div>
);

Matrix.propTypes = {
  tests: arrayOf(bool).isRequired,
  id: string.isRequired,
};

export default Matrix;
