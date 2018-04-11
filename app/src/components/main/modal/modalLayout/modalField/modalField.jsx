import PropTypes from 'prop-types';
import classname from 'classnames/bind';
import styles from './modalField.scss';

const cx = classname.bind(styles);

export const ModalField = ({ label, labelWidth, children }) => (
  <div className={cx('modal-field')}>
    {label && <Label label={label} labelWidth={labelWidth} />}
    <Content>{children}</Content>
  </div>
);
ModalField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
  labelWidth: PropTypes.string,
};
ModalField.defaultProps = {
  label: '',
  children: null,
  labelWidth: 'auto',
};

const Label = ({ label, labelWidth: width }) => (
  <div className={cx('modal-field-label')} style={{ width }}>
    {label}
  </div>
);
Label.propTypes = {
  label: PropTypes.string,
  labelWidth: PropTypes.string,
};
Label.defaultProps = {
  label: '',
  labelWidth: 'auto',
};

const Content = ({ children }) => <div className={cx('modal-field-content')}>{children}</div>;
Content.propTypes = {
  children: PropTypes.node,
};
Content.defaultProps = {
  children: null,
};
