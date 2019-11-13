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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './testParameters.scss';

const cx = classNames.bind(styles);

export const TestParameters = ({ parameters }) =>
  parameters.length ? (
    <table className={cx('test-parameters')}>
      <thead className={cx('header')}>
        <tr className={cx('row')}>
          <td className={cx('header-cell')}>
            <FormattedMessage id="TestItemDetailsModal.parameterKey" defaultMessage="Key" />
          </td>
          <td className={cx('header-cell')}>
            <FormattedMessage id="TestItemDetailsModal.parameterValue" defaultMessage="Value" />
          </td>
        </tr>
      </thead>
      <tbody>
        {parameters.map((param) => (
          <tr key={param.key} className={cx('row')}>
            <td className={cx('cell')}>{param.key}</td>
            <td className={cx('cell')}>{param.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div className={cx('no-parameters')}>
      <FormattedMessage id="TestItemDetailsModal.noParameters" defaultMessage="No parameters" />
    </div>
  );
TestParameters.propTypes = {
  parameters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
};
TestParameters.defaultProps = {
  parameters: [],
};
