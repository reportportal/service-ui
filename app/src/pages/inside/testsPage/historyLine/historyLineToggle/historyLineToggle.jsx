import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { HistoryLineItem } from '../historyLineItem';

export const HistoryLineToggle = ({ items, value, onClickItem }) => (
  <Fragment>
    {items.map((item, index) => (
      <HistoryLineItem
        key={item.launchNumber}
        active={item.launchNumber === value}
        isFirstItem={index === 0}
        isLastItem={index === items.length - 1}
        onClick={() => onClickItem(item)}
        {...item}
      />
    ))}
  </Fragment>
);
HistoryLineToggle.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      launchNumber: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    }),
  ),
  value: PropTypes.string,
  onClickItem: PropTypes.func,
};
HistoryLineToggle.defaultProps = {
  items: [],
  value: '',
  onClickItem: () => {},
};
