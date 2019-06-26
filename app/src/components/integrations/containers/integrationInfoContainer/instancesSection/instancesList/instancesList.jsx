import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import moment from 'moment';
import { InstancesListItem } from './instancesListItem';
import styles from './instancesList.scss';

const cx = classNames.bind(styles);

export const InstancesList = ({
  items,
  title,
  onItemClick,
  disabled,
  disabledHint,
  blocked,
  defaultItemTitle,
}) => (
  <div className={cx('instances-list-wrapper')}>
    <h3 className={cx('instances-list-title')}>{title}</h3>
    {disabled && <p className={cx('instances-disabled-hint')}>{disabledHint}</p>}
    <ul className={cx('instances-list')}>
      {items.map((item) => (
        <InstancesListItem
          key={item.id}
          disabled={disabled}
          data={item}
          title={item.name || defaultItemTitle}
          creator={item.creator}
          creationInfo={moment(item.creationDate).format('ll')}
          onClick={() => onItemClick({ name: defaultItemTitle, ...item, blocked }, title)}
        />
      ))}
    </ul>
  </div>
);

InstancesList.propTypes = {
  items: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  onItemClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  disabledHint: PropTypes.string,
  defaultItemTitle: PropTypes.string,
  blocked: PropTypes.bool,
};

InstancesList.defaultProps = {
  disabled: false,
  disabledHint: '',
  defaultItemTitle: '',
  blocked: false,
};
