import PropTypes from 'prop-types';
import classname from 'classnames/bind';
import styles from './modalField.scss';

const cx = classname.bind(styles);

export const ModalField = ({ label, children, labelWidth }) => (
  <div className={cx('modal-field')}>
    {label && <Label label={label} labelWidth={labelWidth} />}
    <Content>{children}</Content>
  </div>
);
ModalField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
  labelWidth: PropTypes.number,
};
ModalField.defaultProps = {
  label: '',
  children: null,
  labelWidth: null,
};

const Label = ({ label, labelWidth }) => (
  <div className={cx('modal-field-label')} style={{ width: labelWidth || 'unset' }}>
    {label}
  </div>
);
Label.propTypes = {
  label: PropTypes.string,
  labelWidth: PropTypes.number,
};
Label.defaultProps = {
  label: '',
  labelWidth: null,
};

const Content = ({ children }) => <div className={cx('modal-field-content')}>{children}</div>;
Content.propTypes = {
  children: PropTypes.node,
};
Content.defaultProps = {
  children: null,
};
