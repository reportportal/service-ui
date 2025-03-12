/*
 * Copyright 2025 EPAM Systems
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

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { messages } from 'components/widgets/multiLevelWidgets/testCaseSearchTable/messages';
import { StepGrid } from 'pages/inside/stepPage/stepGrid';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import styles from './testCaseSearchContent.scss';

const cx = classNames.bind(styles);
export const TestCaseSearchContent = ({ isEmptyState, data }) => {
  const { formatMessage } = useIntl();
  return (
    <ScrollWrapper>
      {isEmptyState ? (
        <div className={cx('content')}>
          <p className={cx('title')}>{formatMessage(messages.letsSearch)}</p>
          <p className={cx('description')}>{formatMessage(messages.provideParameters)}</p>
        </div>
      ) : (
        <StepGrid data={data} listView isTestSearchView />
      )}
    </ScrollWrapper>
  );
};

TestCaseSearchContent.propTypes = {
  isEmptyState: PropTypes.bool,
  data: PropTypes.array,
};
