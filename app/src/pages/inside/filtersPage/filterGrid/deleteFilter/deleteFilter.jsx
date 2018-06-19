import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import BinIcon from 'common/img/bin-icon-inline.svg';
import styles from './deleteFilter.scss';

const cx = classNames.bind(styles);

export const DeleteFilter = ({ canDelete, onDelete, filter }) => (
  <Fragment>
    <div
      className={cx('bin-icon', {
        disabled: !canDelete,
      })}
      onClick={() => onDelete(filter)}
    >
      {Parser(BinIcon)}
    </div>
  </Fragment>
);
DeleteFilter.propTypes = {
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
  filter: PropTypes.object,
};
DeleteFilter.defaultProps = {
  canDelete: false,
  onDelete: () => {},
  filter: {},
};
