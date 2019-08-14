import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { formatAttribute, notSystemAttributePredicate } from 'common/utils/attributeUtils';
import styles from './attributesBlock.scss';

const cx = classNames.bind(styles);

export const AttributesBlock = ({ attributes, onClickAttribute, isAttributeClickable }) => (
  <div className={cx('attributes-block')}>
    {attributes.some(notSystemAttributePredicate) && <div className={cx('attributes-icon')} />}
    {attributes.filter(notSystemAttributePredicate).map((attribute) => (
      <div
        key={formatAttribute(attribute)}
        className={cx('attribute', { cursor: isAttributeClickable })}
        onClick={() => onClickAttribute(attribute)}
      >
        {formatAttribute(attribute)}
      </div>
    ))}
  </div>
);

AttributesBlock.propTypes = {
  attributes: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
      system: PropTypes.bool,
    }),
  ).isRequired,
  onClickAttribute: PropTypes.func,
  isAttributeClickable: PropTypes.bool,
};
AttributesBlock.defaultProps = {
  onClickAttribute: () => {},
  isAttributeClickable: false,
};
