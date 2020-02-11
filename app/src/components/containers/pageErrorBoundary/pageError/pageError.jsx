/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { back } from 'redux-first-router';
import { injectIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ErrorMessage } from 'components/main/errorMessage';
import { BigButton } from 'components/buttons/bigButton';
import styles from './pageError.scss';

const cx = classNames.bind(styles);

export const PageError = injectIntl(({ error, intl: { formatMessage } }) => (
  <div className={cx('page-error')}>
    <ErrorMessage error={error} />
    <BigButton className={cx('back-button')} onClick={back}>
      {formatMessage(COMMON_LOCALE_KEYS.BACK)}
    </BigButton>
  </div>
));

PageError.propTypes = {
  error: PropTypes.shape({
    name: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  intl: PropTypes.object.isRequired,
};
