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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { UAT_API_URL_PREFIX } from 'common/urls';
import { BigButton } from 'components/buttons/bigButton';
import styles from './externalLoginBlock.scss';

const cx = classNames.bind(styles);

export const ExternalLoginBlock = ({ externalAuth }) => (
  <div className={cx('external-login-block')}>
    {Object.keys(externalAuth).map((objKey) => {
      const val = externalAuth[objKey];
      let path = val.path;
      if (path.indexOf(UAT_API_URL_PREFIX) === -1) {
        path = `${UAT_API_URL_PREFIX}${val.path}`;
      }

      return (
        // eslint-disable-next-line react/no-array-index-key
        <div className={cx('external-auth-btn')} key={objKey}>
          <BigButton roundedCorners color="booger">
            <span
              onClick={() => {
                window.location = `${window.location.protocol}//${window.location.host}${path}`;
              }}
            >
              {Parser(val.button)}
            </span>
          </BigButton>
        </div>
      );
    })}
  </div>
);

ExternalLoginBlock.propTypes = {
  externalAuth: PropTypes.object,
};
ExternalLoginBlock.defaultProps = {
  externalAuth: {},
};
