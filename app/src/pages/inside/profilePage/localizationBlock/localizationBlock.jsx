import { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { setStorageItem } from 'common/utils';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { langSelector, setLangAction } from 'controllers/lang';
import { InputDropdown } from 'components/inputs/inputDropdown';
import styles from './localizationBlock.scss';
import EnglishFlagIcon from './img/en-flag-inline.svg';
import RussianFlagIcon from './img/ru-flag-inline.svg';
import BelarusFlagIcon from './img/be-flag-inline.svg';

const cx = classNames.bind(styles);

const messages = defineMessages({
  label: {
    id: 'LocalizationBlock.label',
    defaultMessage: 'Language',
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
    defaultMessage: `Ru lang in beta. Please help us to translate it, send your PR to this <a target='_blank' href='https://github.com/reportportal/service-ui/blob/develop/src/main/resources/public/js/src/localizations/ru-RU.js' >file.</a>`,
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

@connect(
  (state) => ({
    lang: langSelector(state),
  }),
  {
    setLangAction,
  },
)
@injectIntl
export class LocalizationBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    lang: PropTypes.string.isRequired,
    setLangAction: PropTypes.func.isRequired,
  };

  onChangeLanguage = (lang) => {
    setStorageItem('application_settings', { appLanguage: lang });
    this.props.setLangAction(lang);
  };

  render() {
    const englishLangOption = (
      <LanguageOption
        icon={EnglishFlagIcon}
        label={this.props.intl.formatMessage(messages.english)}
      />
    );
    const russianLangOption = (
      <LanguageOption
        icon={RussianFlagIcon}
        label={this.props.intl.formatMessage(messages.russian)}
      />
    );
    const belarusLangOption = (
      <LanguageOption
        icon={BelarusFlagIcon}
        label={this.props.intl.formatMessage(messages.belarusian)}
      />
    );
    return (
      <div className={cx('localization-block')}>
        <span className={cx('label')}>{this.props.intl.formatMessage(messages.label)}</span>
        <div className={cx('localization')}>
          <InputDropdown
            options={[
              {
                value: 'en',
                label: englishLangOption,
              },
              {
                value: 'ru',
                label: russianLangOption,
              },
              {
                value: 'be',
                label: belarusLangOption,
              },
            ]}
            value={this.props.lang}
            onChange={this.onChangeLanguage}
          />

          <div className={cx('description')}>
            <p className={cx('note')}>{this.props.intl.formatMessage(messages.note)}:</p>
            <p className={cx('text')}>
              {Parser(this.props.intl.formatMessage(messages.contribute))}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
