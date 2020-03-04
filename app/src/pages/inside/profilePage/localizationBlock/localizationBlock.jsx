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

import { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { updateStorageItem } from 'common/utils';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import {
  ENGLISH,
  UKRAINIAN,
  RUSSIAN,
  BELARUSIAN,
  DEFAULT_LANGUAGE,
} from 'common/constants/supportedLanguages';
import { langSelector, setLangAction } from 'controllers/lang';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './localizationBlock.scss';
import EnglishFlagIcon from './img/en-flag-inline.svg';
import UkrainianFlagIcon from './img/ua-flag-inline.svg';
import RussianFlagIcon from './img/ru-flag-inline.svg';
import BelarusFlagIcon from './img/be-flag-inline.svg';

const cx = classNames.bind(styles);

const messages = defineMessages({
  label: {
    id: 'LocalizationBlock.label',
    defaultMessage: 'Language',
  },
  ukrainian: {
    id: 'LocalizationBlock.ukrainian',
    defaultMessage: 'Ukrainian',
  },
  russian: {
    id: 'LocalizationBlock.russian',
    defaultMessage: 'Russian',
  },
  belarusian: {
    id: 'LocalizationBlock.belarusian',
    defaultMessage: 'Belarusian',
  },
  english: {
    id: 'LocalizationBlock.english',
    defaultMessage: 'English (United States)',
  },
  note: {
    id: 'LocalizationBlock.note',
    defaultMessage: 'Note',
  },
  contribute: {
    id: 'LocalizationBlock.contribute',
    defaultMessage: `This lang in beta. Please help us to translate it, send your PR to this <a target='_blank' href='https://github.com/reportportal/service-ui/blob/develop/app/localization/translated/ru.json' >file.</a>`,
  },
});

const LanguageOption = ({ icon, label }) => (
  <div className={cx('icon-block')}>
    <i className={cx('icon')}>{Parser(icon)}</i>
    {label}
  </div>
);
LanguageOption.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
};
LanguageOption.defaultProps = {
  icon: '',
  label: '',
};

const LANG_OPTIONS = [
  {
    value: ENGLISH,
    icon: EnglishFlagIcon,
    label: messages.english,
  },
  {
    value: UKRAINIAN,
    icon: UkrainianFlagIcon,
    label: messages.ukrainian,
  },
  {
    value: RUSSIAN,
    icon: RussianFlagIcon,
    label: messages.russian,
  },
  {
    value: BELARUSIAN,
    icon: BelarusFlagIcon,
    label: messages.belarusian,
  },
];

@connect(
  (state) => ({
    lang: langSelector(state),
  }),
  {
    setLangAction,
  },
)
@injectIntl
@track()
export class LocalizationBlock extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    setLangAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  onChangeLanguage = (lang) => {
    this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.CHANGE_LANGUAGE);
    updateStorageItem(APPLICATION_SETTINGS, { appLanguage: lang });
    this.props.setLangAction(lang);
  };

  getLangOptions = () =>
    LANG_OPTIONS.map(({ value, icon, label }) => ({
      value,
      label: <LanguageOption icon={icon} label={this.props.intl.formatMessage(label)} />,
    }));

  render() {
    return (
      <div className={cx('localization-block')}>
        <span className={cx('label')}>{this.props.intl.formatMessage(messages.label)}</span>
        <div className={cx('localization')}>
          <InputDropdown
            options={this.getLangOptions()}
            value={this.props.lang}
            onChange={this.onChangeLanguage}
          />

          {this.props.lang !== DEFAULT_LANGUAGE && (
            <div className={cx('description')}>
              <p className={cx('note')}>{this.props.intl.formatMessage(messages.note)}:</p>
              <p className={cx('text')}>
                {Parser(this.props.intl.formatMessage(messages.contribute))}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
