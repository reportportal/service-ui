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

import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import AAIcon from 'common/img/aa_activated-inline.svg';
import { injectIntl, defineMessages } from 'react-intl';
import styles from './autoAnalyzedLabel.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  investigatedByAA: {
    id: 'AALabel.investigatedByAA',
    defaultMessage: 'Investigated by Auto-Analysis',
  },
});

export const AutoAnalyzedLabel = injectIntl(({ intl }) => (
  <div className={cx('aa-label')} title={intl.formatMessage(messages.investigatedByAA)}>
    {Parser(AAIcon)}
  </div>
));

AutoAnalyzedLabel.propTypes = {
  intl: PropTypes.object.isRequired,
};
