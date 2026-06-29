/*
 * Copyright 2026 EPAM Systems
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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Button, useEllipsisTitle } from '@reportportal/ui-kit';
import styles from './providerButton.scss';

const cx = classNames.bind(styles);

export const ProviderButton = ({ label, onClick }) => {
  const { ref, title } = useEllipsisTitle(label);

  return (
    <div className={cx('provider-button')}>
      <Button variant="ghost" className={cx('provider-action-button')} onClick={onClick}>
        <span ref={ref} title={title} className={cx('provider-name')}>
          {label}
        </span>
      </Button>
    </div>
  );
};
ProviderButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
