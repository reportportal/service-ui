import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/icon-cross-inline.svg';
import styles from './fieldFilterEntity.scss';

const cx = classNames.bind(styles);

export const FieldFilterEntity = ({ title, children, deletable, stretchable, onRemove }) => (
  <div className={cx('field-filter-entity', { stretchable })}>
    <span className={cx('entity-name')}>{title}</span>
    {deletable && (
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
  deletable: PropTypes.bool,
  stretchable: PropTypes.bool,
  onRemove: PropTypes.func,
};
FieldFilterEntity.defaultProps = {
  children: null,
  title: '',
  deletable: true,
  stretchable: false,
  onRemove: () => {},
};
