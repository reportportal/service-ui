import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import styles from './fieldFilterEntity.scss';

const cx = classNames.bind(styles);

export const FieldFilterEntity = ({
  title,
  children,
  removable,
  stretchable,
  smallSize,
  onRemove,
  vertical,
}) => (
  <div className={cx('field-filter-entity', { stretchable, small: smallSize, vertical })}>
    <span className={cx('entity-name', { vertical: 'vertical' })}>{title}</span>
    {removable && (
      <i className={cx('close-icon')} onClick={onRemove}>
        {Parser(CrossIcon)}
      </i>
    )}
    <div className={cx('entity-input-holder', { vertical: 'vertical' })}>{children}</div>
  </div>
);
FieldFilterEntity.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  smallSize: PropTypes.bool,
  removable: PropTypes.bool,
  stretchable: PropTypes.bool,
  vertical: PropTypes.bool,
  onRemove: PropTypes.func,
};
FieldFilterEntity.defaultProps = {
  children: null,
  title: '',
  smallSize: false,
  removable: true,
  stretchable: false,
  vertical: false,
  onRemove: () => {},
};
