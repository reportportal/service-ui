import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { formatAttribute } from 'common/utils/attributeUtils';
import styles from './attributesTooltip.scss';

const cx = classNames.bind(styles);

export const AttributesTooltip = ({ attributes }) => (
  <div className={cx('attributes-tooltip')}>
    {attributes.map((item) => (
      <div key={`${item.key}-${item.value}`}>
        {formatAttribute({ key: item.key, value: item.value })}
      </div>
    ))}
  </div>
);
AttributesTooltip.propTypes = {
  attributes: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
      system: PropTypes.bool,
    }),
  ),
};

AttributesTooltip.defaultProps = {
  attributes: [],
};
