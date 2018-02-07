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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { Input } from 'components/inputs/input/input';
import { GhostButton } from 'components/buttons/ghostButton';
import styles from './uuidBlock.scss';
import { BlockContainerHeader, BlockContainerBody } from '../blockContainer';

const cx = classNames.bind(styles);

export const UuidBlock = ({ uuid }) => (
  <div className={cx('uuid-block')}>
    <BlockContainerHeader>
      <span className={cx('header-label')}>
        <FormattedMessage id={'UuidBlock.headerNameCol'} class="a" defaultMessage={'Universally unique identifier'} />
      </span>
    </BlockContainerHeader>
    <BlockContainerBody>
      <div className={cx('body-wrapper')}>
        <div className={cx('field-wrapper')}>
          <span className={cx('label')}>UUID</span>
          <div className={cx('regenerate-btn')}>
            <GhostButton>
              <FormattedMessage id={'UuidBlock.regenerate'} defaultMessage={'Regenerate'} />
            </GhostButton>
          </div>
          <div className={cx('field')}>
            <Input readonly value={uuid} />
          </div>

        </div>
        <p className={cx('tip')}>
          <FormattedMessage id={'UuidBlock.tip'} defaultMessage={'In order to provide security for your own domain password, you can use a user token, named UUID - to verify your account to be able to log with agent.'} />
        </p>
      </div>
    </BlockContainerBody>
  </div>
);

UuidBlock.propTypes = {
  uuid: PropTypes.string,
};

UuidBlock.defaultProps = {
  uuid: '',
};
