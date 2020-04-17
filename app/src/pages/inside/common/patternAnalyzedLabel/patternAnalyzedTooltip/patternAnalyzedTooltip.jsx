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

import { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import styles from './patternAnalyzedTooltip.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  patternAnalysisRecommendation: {
    id: 'PatternAnalyzedTooltip.patternAnalysisRecommendation',
    defaultMessage: 'Pattern-Analysis Recommendation',
  },
});

@injectIntl
export class PatternAnalyzedTooltip extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    patternTemplates: PropTypes.array,
  };
  static defaultProps = {
    patternTemplates: [],
  };

  render() {
    const { patternTemplates, intl } = this.props;
    return (
      <div className={cx('pattern-list')}>
        {patternTemplates.map((patternName, ind) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={cx('pattern-name')} key={`pattern-${ind}`} title={patternName}>
            {patternName}
          </div>
        ))}
        <div className={cx('pattern-list-label')}>
          {intl.formatMessage(messages.patternAnalysisRecommendation)}
        </div>
      </div>
    );
  }
}
