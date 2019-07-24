import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ArrowIcon from 'common/img/arrow-right-inline.svg';
import styles from './instancesListItem.scss';

const cx = classNames.bind(styles);

export const InstancesListItem = ({ title, creator, creationInfo, onClick, disabled }) => (
  // eslint-disable-next-line
  <li className={cx('instances-list-item', { disabled })} onClick={onClick}>
    <div className={cx('item-data')}>
      <h4 className={cx('integration-name')}>{title}</h4>
      <span className={cx('creation-info')}>
        {creator ? `${creator} on ${creationInfo}` : creationInfo}
      </span>
    </div>
    <div className={cx('arrow-control')}>{Parser(ArrowIcon)}</div>
  </li>
);

InstancesListItem.propTypes = {
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  creationInfo: PropTypes.string.isRequired,
  creator: PropTypes.string,
  disabled: PropTypes.bool,
};

InstancesListItem.defaultProps = {
  disabled: false,
  creator: '',
};
