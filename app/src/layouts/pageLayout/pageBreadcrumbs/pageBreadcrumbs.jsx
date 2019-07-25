import React, { Component } from 'react';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { NavLink } from 'components/main/navLink';
import styles from './pageBreadcrumbs.scss';

const cx = classNames.bind(styles);
@track()
export class PageBreadcrumbs extends Component {
  static propTypes = {
    data: PropTypes.array,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    data: [],
  };
  render() {
    const { data, tracking } = this.props;
    return (
      <ul className={cx('page-breadcrumbs')}>
        {data.map(({ title, link, eventInfo }, i) => (
          <li key={title} className={cx('page-breadcrumbs-item')}>
            {i === data.length - 1 ? (
              <span title={title}>{title}</span>
            ) : (
              <NavLink
                to={link}
                onClick={() => tracking.trackEvent(eventInfo)}
                className={cx('page-breadcrumbs-link')}
              >
                {title}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    );
  }
}
