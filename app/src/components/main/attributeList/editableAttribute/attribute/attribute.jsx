import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { formatAttribute } from 'common/utils/attributeUtils';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import styles from './attribute.scss';

const cx = classNames.bind(styles);

const createRemoveClickHandler = (clickHandler) => (e) => {
  e.stopPropagation();
  clickHandler();
};

export const Attribute = ({ attribute, onClick, onRemove, disabled }) => (
  <div className={cx('attribute', { disabled })} onClick={disabled ? undefined : onClick}>
    {!disabled && (
      <div className={cx('remove-icon')} onClick={createRemoveClickHandler(onRemove)}>
        {Parser(CrossIcon)}
      </div>
    )}
    <div className={cx('label')}>{formatAttribute(attribute)}</div>
  </div>
);

Attribute.propTypes = {
  attribute: PropTypes.object,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
};

Attribute.defaultProps = {
  attribute: {},
  disabled: false,
  onClick: () => {},
  onRemove: () => {},
};
