import PropTypes from 'prop-types';
import classname from 'classnames/bind';
import styles from './modalField.scss';

const cx = classname.bind(styles);

export const ModalField = ({ label, children, labelWidth, inputWidth  }) => (
  <div className={cx('modal-field')}>
    {label && <Label label={label} labelWidth={labelWidth} />}
    <Content inputWidth={inputWidth} >{children}</Content>
  </div>
);
ModalField.propTypes = {
  label: PropTypes.string,
  labelWidth: PropTypes.number,
  children: PropTypes.node,
  labelWidth: PropTypes.string,
  inputWidth: PropTypes.string,
};
ModalField.defaultProps = {
  label: '',
  children: null,
  labelWidth: null,
  inputWidth: null,
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
const Content = ({ children, inputWidth }) => (
  <div className={cx('modal-field-content')} style={{ width: `${inputWidth}px` }}>
    {children}
  </div>
);
Content.propTypes = {
  children: PropTypes.node,
  inputWidth: PropTypes.number,
};
Content.defaultProps = {
  children: null,
  inputWidth: null,
};
