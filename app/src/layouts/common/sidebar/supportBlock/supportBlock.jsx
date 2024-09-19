/*
 * Copyright 2021 EPAM Systems
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

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import Parser from 'html-react-parser';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { GhostButton } from 'components/buttons/ghostButton';
import { HELP_AND_SUPPORT_EVENTS } from 'analyticsEvents/helpAndSupportEvents';
import { showModalAction } from 'controllers/modal';
import { referenceDictionary } from 'common/utils';
import { messages } from './messages';
import QuestionMark from './img/question-mark-inline.svg';
import styles from './supportBlock.scss';

const cx = classNames.bind(styles);

const EMAIL_SUPPORT = `${referenceDictionary.rpEmail}?subject=Support Request from the new RP instance`;
const EMAIL_QUESTION = `${referenceDictionary.rpEmail}?subject=A question from the new RP instance`;

const SupportBtn = () => <span className={cx('support-btn')}>{Parser(QuestionMark)}</span>;

const SupportBlockWithTooltip = withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    dynamicWidth: true,
    placement: 'right',
    tooltipTriggerClass: cx('tooltip-trigger'),
    dark: true,
  },
})(SupportBtn);

export const SupportBlock = ({ options }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const [isModalShown, setModalShown] = useState(false);
  const [userChoice, setUserChoice] = useState(options[0].value);
  const wrapperRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef?.current?.contains(event.target)) {
        setModalShown(false);
      }
    };
    document.addEventListener('click', handleClickOutside, false);

    return () => document.removeEventListener('click', handleClickOutside, false);
  }, []);

  const toggleModal = () => {
    setModalShown(!isModalShown);
    !isModalShown && trackEvent(HELP_AND_SUPPORT_EVENTS.CLICK_HELP_AND_SUPPORT_BUTTON);
  };

  const openModal = () => {
    setModalShown(false);
    dispatch(
      showModalAction({
        id: 'requestSupportModal',
      }),
    );
    trackEvent(HELP_AND_SUPPORT_EVENTS.CLICK_REQUEST_SUPPORT_BUTTON);
  };

  const onClickLink = (nameLink) => {
    toggleModal();
    trackEvent(HELP_AND_SUPPORT_EVENTS.CLICK_ON_SUPPORT_LINK(nameLink));
  };

  const onClickUserChoiceBtn = () => {
    toggleModal();
    const label = options.find(({ value }) => value === userChoice).label;
    !userChoice && trackEvent(HELP_AND_SUPPORT_EVENTS.CLICK_ASK_A_QUESTION_BUTTON);
    userChoice && trackEvent(HELP_AND_SUPPORT_EVENTS.CHOOSE_INSTRUCTION_BUTTON(label));
  };

  return (
    <div className={cx('support-block')} ref={wrapperRef} onClick={toggleModal}>
      <SupportBlockWithTooltip
        tooltipContent={
          <div className={cx('tooltip-text')}>{formatMessage(messages.helpAndSupport)}</div>
        }
        showTooltip={!isModalShown}
        preventParsing
      />
      {isModalShown && (
        <div className={cx('modal')} onClick={(e) => e.stopPropagation()}>
          <div className={cx('modal-header')}>{formatMessage(messages.helpAndSupport)}</div>
          <div className={cx('modal-content')}>
            <div className={cx('solutions-block')}>
              <span className={cx('solution-title')}>
                {formatMessage(messages.tryFindSolution)}
              </span>
              <InputDropdown
                value={userChoice}
                options={options}
                onChange={setUserChoice}
                mobileDisabled
              />
              <div className={cx('solution-btn')}>
                <a
                  href={userChoice || EMAIL_QUESTION}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cx('solution-link')}
                  onClick={onClickUserChoiceBtn}
                >
                  {userChoice
                    ? formatMessage(messages.instruction)
                    : formatMessage(messages.askQuestion)}
                </a>
              </div>
            </div>
            <span className={cx('ask-help')}>
              {formatMessage(messages.note, {
                ourSupportTeam: (
                  <a
                    href={EMAIL_SUPPORT}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={cx('support-link')}
                    onClick={() => onClickLink('support_team')}
                    key={EMAIL_SUPPORT}
                  >
                    {formatMessage(messages.ourSupportTeam)}
                  </a>
                ),
                slackChannel: (
                  <a
                    href={referenceDictionary.rpSlack}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={cx('support-link')}
                    onClick={() => onClickLink('slack')}
                    key={referenceDictionary.rpSlack}
                  >
                    {formatMessage(messages.slackChannel)}
                  </a>
                ),
              })}
            </span>
            <GhostButton onClick={openModal}>{formatMessage(messages.requestSupport)}</GhostButton>
          </div>
        </div>
      )}
    </div>
  );
};
SupportBlock.propTypes = {
  options: PropTypes.array.isRequired,
};
