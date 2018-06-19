import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { MarkdownViewer } from 'components/main/markdown';
import styles from './filterName.scss';

const cx = classNames.bind(styles);

export const FilterName = ({ userFilters, filter, onClickName, onEdit, userId }) => (
  <Fragment>
    <span className={cx('name-wrapper')}>
      <span
        className={cx('name', { link: userFilters.indexOf(filter.id) !== -1 })}
        onClick={onClickName}
      >
        {filter.name}
      </span>
      {userId === filter.owner ? (
        <div className={cx('pencil-icon')} onClick={() => onEdit(filter)} />
      ) : null}
    </span>
    <MarkdownViewer value={filter.description} />
  </Fragment>
);
FilterName.propTypes = {
  userFilters: PropTypes.array,
  filter: PropTypes.object,
  onClickName: PropTypes.func,
  onEdit: PropTypes.func,
  userId: PropTypes.string,
};
FilterName.defaultProps = {
  userFilters: [],
  filter: {},
  onClickName: () => {},
  onEdit: () => {},
  userId: '',
};
