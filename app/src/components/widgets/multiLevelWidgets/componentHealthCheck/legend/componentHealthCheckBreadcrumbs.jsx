import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import styles from './componentHealthCheckBreadcrumbs.scss';

const cx = classNames.bind(styles);

@injectIntl
export class ComponentHealthCheckBreadcrumbs extends PureComponent {
  static propTypes = {
    breadcrumbs: PropTypes.array,
    activeBreadcrumbs: PropTypes.array,
    onClickBreadcrumbs: PropTypes.func,
  };

  static defaultProps = {
    breadcrumbs: [],
    activeBreadcrumbs: [],
    onClickBreadcrumbs: () => {},
  };

  render() {
    const { breadcrumbs, activeBreadcrumbs, onClickBreadcrumbs } = this.props;
    const actualBreadcrumbs = activeBreadcrumbs || breadcrumbs;

    return (
      <ul className={cx('list')}>
        {actualBreadcrumbs &&
          actualBreadcrumbs.map((item, i) => (
            <li className={cx('item', { active: item.isActive })} key={item.key}>
              {!item.isStatic && !item.isActive ? (
                <a className={cx('link')} onClick={() => onClickBreadcrumbs(item.id)}>
                  <span className={cx('link-key')} title={item.key}>
                    {item.key}
                  </span>
                  <span className={cx('link-value')}>
                    <span
                      className={cx('link-color')}
                      style={{ backgroundColor: item.attr.color }}
                    />
                    <span className={cx('link-value-name')} title={item.attr.value}>
                      {item.attr.value}
                    </span>
                    <span>{`, ${item.attr.passingRate}%`}</span>
                  </span>
                </a>
              ) : (
                <span className={cx('item-name')} title={item.key}>
                  {item.key}
                </span>
              )}
              {i + 1 < actualBreadcrumbs.length && <span className={cx('icon')} />}
            </li>
          ))}
      </ul>
    );
  }
}
