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

import React, { PureComponent } from 'react';
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { LOGIN_PAGE } from 'controllers/pages';
import { BigButton } from 'components/buttons/bigButton';
import { normalizePathWithPrefix, setWindowLocationToNewPath } from '../../../utils';
import styles from './externalLoginBlock.scss';

const cx = classNames.bind(styles);

export class ExternalLoginBlock extends PureComponent {
  static propTypes = {
    externalAuth: PropTypes.object,
  };
  static defaultProps = {
    externalAuth: {},
  };

  externalAuthClickHandler = (path) => setWindowLocationToNewPath(normalizePathWithPrefix(path));

  render() {
    const { externalAuth } = this.props;
    return (
      <div className={cx('external-login-block')}>
        {Object.keys(externalAuth).map((objKey) => {
          const val = externalAuth[objKey];

          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className={cx('external-auth-btn')} key={objKey}>
              <BigButton roundedCorners color="booger">
                {val.providers ? (
                  <Link to={{ type: LOGIN_PAGE, payload: { query: { multipleAuth: objKey } } }}>
                    {Parser(val.button)}
                  </Link>
                ) : (
                  <span onClick={() => this.externalAuthClickHandler(val.path)}>
                    {Parser(val.button)}
                  </span>
                )}
              </BigButton>
            </div>
          );
        })}
      </div>
    );
  }
}
