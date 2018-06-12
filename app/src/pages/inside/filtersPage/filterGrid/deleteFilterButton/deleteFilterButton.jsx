import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import BinIcon from 'common/img/bin-icon-inline.svg';
import styles from './deleteFilterButton.scss';

const cx = classNames.bind(styles);

export const DeleteFilterButton = ({ canDelete, onDelete, filter }) => (
  <div
    className={cx('bin-icon', {
      disabled: !canDelete,
    })}
    onClick={() => (canDelete ? onDelete(filter) : null)}
  >
    {Parser(BinIcon)}
  </div>
);
DeleteFilterButton.propTypes = {
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
  filter: PropTypes.object,
};
DeleteFilterButton.defaultProps = {
  canDelete: false,
  onDelete: () => {},
  filter: {},
};
