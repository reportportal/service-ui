import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import styles from './fieldFilterEntity.scss';

const cx = classNames.bind(styles);

export const FieldFilterEntity = ({ title, children, removable, stretchable, onRemove }) => (
  <div className={cx('field-filter-entity', { stretchable })}>
    <span className={cx('entity-name')}>{title}</span>
    {removable && (
      <i className={cx('close-icon')} onClick={onRemove}>
        {Parser(CrossIcon)}
      </i>
    )}
    <div className={cx('entity-input-holder')}>{children}</div>
  </div>
);
FieldFilterEntity.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  removable: PropTypes.bool,
  stretchable: PropTypes.bool,
  onRemove: PropTypes.func,
};
FieldFilterEntity.defaultProps = {
  children: null,
  title: '',
  removable: true,
  stretchable: false,
  onRemove: () => {},
};
