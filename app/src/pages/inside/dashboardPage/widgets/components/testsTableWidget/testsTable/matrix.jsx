import * as React from 'react';
import { arrayOf, bool, string } from 'prop-types';
import classNames from 'classnames/bind';
import styles from '../testsTableWidget.scss';

const cx = classNames.bind(styles);

const renderForBool = (id) => (failed, idx) => (
  <div key={`${id}-square-${idx}`} className={cx('square', { 'most-failed': failed })} />
);

const renderForString = (id) => (status, idx) => (
  <div key={`${id}-square-${idx}`} className={cx('square', status.toLowerCase())} />
);

function matrixFactory(renderBool) {
  const renderFn = renderBool ? renderForBool : renderForString;
  console.log('RENDER BOOL: ', renderBool);
  const Matrix = ({ tests, id }) => (
    <div className={cx('matrix')}>
      <div className={cx('squares-wrapper')}>
        {/* eslint-disable */
        tests.map(renderFn(id))
        /* eslint-disable */
        }
      </div>
    </div>
  );

  Matrix.propTypes = {
    tests: arrayOf(bool).isRequired,
    id: string.isRequired,
  };

  return Matrix;
}

export default matrixFactory;
