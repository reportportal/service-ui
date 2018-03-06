import PropTypes from 'prop-types';
import classname from 'classnames/bind';
import styles from './modalField.scss';

const cx = classname.bind(styles);

export const ModalField = ({ label, children }) => (
  <div className={cx('modal-field')}>
    {label
      ? <Label label={label} />
      : null
    }
    <Content>
      {children}
    </Content>
  </div>
);
ModalField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
};
ModalField.defaultProps = {
  label: '',
  children: null,
};

const Label = ({ label }) => (
  <div className={cx('modal-field-label')}>
    {label}
  </div>
);
Label.propTypes = {
  label: PropTypes.string,
};
Label.defaultProps = {
  label: '',
};

const Content = ({ children }) => (
  <div className={cx('modal-field-content')}>
    {children}
  </div>
);
Content.propTypes = {
  children: PropTypes.node,
};
Content.defaultProps = {
  children: null,
};
