/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { LOGIN_PAGE } from 'controllers/pages';
import styles from './registrationFailBlock.scss';

const cx = classNames.bind(styles);

@connect(null, (dispatch) => ({
  redirect: () =>
    setTimeout(() => {
      dispatch(rfrRedirect({ type: LOGIN_PAGE }));
    }, 5000),
}))
export class RegistrationFailBlock extends Component {
  static propTypes = {
    withRedirect: PropTypes.bool,
    children: PropTypes.node,
    redirect: PropTypes.func,
  };

  static defaultProps = {
    withRedirect: false,
    children: null,
    redirect: () => {},
  };

  componentDidMount() {
    if (this.props.withRedirect) {
      this.props.redirect();
    }
  }

  render() {
    const { children } = this.props;

    return <div className={cx('registration-fail-block')}>{children}</div>;
  }
}
