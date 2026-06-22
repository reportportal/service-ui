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
import { OkIcon } from '@reportportal/ui-kit';
import { PASSWORD_RULE_IDS } from 'common/utils/validation/passwordRules';
import styles from './passwordRequirementsList.scss';

const cx = classNames.bind(styles);

const RuleIcon = ({ isMet, showFailState }) => {
  if (isMet) {
    return (
      <span className={cx('rule-icon', 'rule-icon--pass')}>
       <OkIcon/>
      </span>
    );
  }

  return (
    <span
      className={cx('rule-icon', 'rule-icon--neutral', {
        'rule-icon--fail': showFailState,
      })}
    />
  );
};

RuleIcon.propTypes = {
  isMet: PropTypes.bool.isRequired,
  showFailState: PropTypes.bool.isRequired,
};

export const PasswordRequirementsList = ({
  ruleStatus,
  ruleLabels,
  showFailState = false,
}) => (
  <ul className={cx('password-requirements-list')}>
    {PASSWORD_RULE_IDS.map((ruleId) => {
      const isMet = ruleStatus[ruleId];

      return (
        <li
          key={ruleId}
          className={cx('rule-item', {
            'rule-item--pass': isMet,
            'rule-item--fail': showFailState && !isMet,
          })}
        >
          <RuleIcon isMet={isMet} showFailState={showFailState} />
          <span className={cx('rule-label')}>{ruleLabels[ruleId]}</span>
        </li>
      );
    })}
  </ul>
);

PasswordRequirementsList.propTypes = {
  ruleStatus: PropTypes.shape({
    minLength: PropTypes.bool,
    specialSymbol: PropTypes.bool,
    uppercase: PropTypes.bool,
    lowercase: PropTypes.bool,
  }).isRequired,
  ruleLabels: PropTypes.shape({
    minLength: PropTypes.string.isRequired,
    specialSymbol: PropTypes.string.isRequired,
    uppercase: PropTypes.string.isRequired,
    lowercase: PropTypes.string.isRequired,
  }).isRequired,
  showFailState: PropTypes.bool,
};
