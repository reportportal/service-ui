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

import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { PatternsGroup } from '../types';
import { PatternNameColumn, TestCasesColumn } from './patternGridColumns';
import styles from './patternGrid.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  patternName: {
    id: 'MostPopularPatterns.patternName',
    defaultMessage: 'Pattern name',
  },
  testCases: {
    id: 'MostPopularPatterns.testCases',
    defaultMessage: 'Test cases',
  },
});

const getDataByAttribute = (attribute: string | null, data: PatternsGroup[] = []) =>
  data.find((group) => group.attributeValue === attribute)?.patterns;

interface PatternGridProps {
  result?: PatternsGroup[];
  selectedAttribute: string | null;
  onPatternClick: (patternName: string) => void;
}

export const PatternGrid = ({ result, selectedAttribute, onPatternClick }: PatternGridProps) => {
  const { formatMessage } = useIntl();
  const data = getDataByAttribute(selectedAttribute, result);

  return (
    <table className={cx('patterns-table')}>
      <thead>
        <tr className={cx('patterns-header')}>
          <th className={cx('cell', 'pattern-col')}>{formatMessage(messages.patternName)}</th>
          <th className={cx('cell', 'test-cases-col')}>{formatMessage(messages.testCases)}</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((row) => (
          <tr className={cx('patterns-row')} key={row.name}>
            <td className={cx('cell', 'pattern-col')}>
              <PatternNameColumn value={row} onPatternClick={onPatternClick} />
            </td>
            <td className={cx('cell', 'test-cases-col')}>
              <TestCasesColumn value={row} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
