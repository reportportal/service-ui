/*
 * Copyright 2023 EPAM Systems
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
import { BubblesLoader } from '@reportportal/ui-kit';
import { PlainTableHeader } from './plainTableHeader';
import { columnPropTypes } from './propTypes';
import { PlainTableBody } from './plainTableBody';
import styles from './plainTable.scss';

const cx = classNames.bind(styles);

export function PlainTable({ columns, data, actions, isLoading }) {
  return isLoading ? (
    <BubblesLoader />
  ) : (
    <div className={cx('table-container')}>
      <PlainTableHeader columns={columns} hasActions={Boolean(actions.length)} />
      <PlainTableBody data={data} columns={columns} actions={actions} />
    </div>
  );
}
PlainTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      handler: PropTypes.func,
      id: PropTypes.number,
    }),
  ),
};
PlainTable.defaultProps = {
  isLoading: false,
  actions: [],
};
