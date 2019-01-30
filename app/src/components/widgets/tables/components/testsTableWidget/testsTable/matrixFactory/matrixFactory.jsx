import * as React from 'react';
import { arrayOf, bool, string, oneOfType } from 'prop-types';
import classNames from 'classnames/bind';
import { PTStatus } from '../../pTypes';
import styles from './matrixFactory.scss';

const cx = classNames.bind(styles);

const renderForBool = (id) => (failed, idx) => (
  <div key={`${id}-square-${idx}`} className={cx('square', { 'most-failed': failed })} />
);

const renderForString = (id) => (status, idx) => (
  <div key={`${id}-square-${idx}`} className={cx('square', status.toLowerCase())} />
);

export function matrixFactory(renderBool) {
  const renderFn = renderBool ? renderForBool : renderForString;

  const Matrix = ({ tests, id }) => (
    <div className={cx('matrix')}>
      <div className={cx('squares-wrapper')}>{tests.map(renderFn(id))}</div>
    </div>
  );

  Matrix.propTypes = {
    tests: arrayOf(oneOfType([bool, PTStatus])).isRequired,
    id: string.isRequired,
  };

  return Matrix;
}
