import PropTypes from 'prop-types';
import classname from 'classnames/bind';
import styles from './modalField.scss';

const cx = classname.bind(styles);

export const ModalField = ({ className, label, children, tip, labelWidth }) => (
  <div className={cx('modal-field', className)}>
    {label && <Label label={label} labelWidth={labelWidth} />}
    <Content>
      {children}
      {tip && <Tip tip={tip} />}
    </Content>
  </div>
);
ModalField.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  tip: PropTypes.string,
  children: PropTypes.node,
  labelWidth: PropTypes.number,
};
ModalField.defaultProps = {
  className: '',
  label: '',
  tip: '',
  children: null,
  labelWidth: null,
};

const Tip = ({ tip }) => <div className={cx('modal-field-tip')}>{tip}</div>;
Tip.propTypes = {
  tip: PropTypes.string,
};
Tip.defaultProps = {
  tip: '',
};

const Label = ({ label, labelWidth }) => (
  <div
    className={cx('modal-field-label', { 'no-min-height': label === ' ' })}
    style={{ width: labelWidth || 'unset' }}
  >
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
