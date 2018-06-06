import { PureComponent } from 'react';
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
  english: {
    id: 'LocalizationBlock.english',
    defaultMessage: 'English (United States)',
  },
  note: {
    id: 'LocalizationBlock.note',
    defaultMessage: 'Note',
  },
  reload: {
    id: 'LocalizationBlock.reload',
    defaultMessage: `You have to <a>Reload</a> the page to implement language change.`,
  },
  contribute: {
    id: 'LocalizationBlock.contribute',
    defaultMessage: `Ru lang in beta. Please help us to translate it, send your PR to this <a target='_blank' href='https://github.com/reportportal/service-ui/blob/develop/src/main/resources/public/js/src/localizations/ru-RU.js' >file.</a>`,
  },
});

@connect(
  (state) => ({
    lang: langSelector(state),
  }),
  {
    setLangAction,
  },
)
@injectIntl
export class LocalizationBlock extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    lang: PropTypes.string.isRequired,
    setLangAction: PropTypes.func.isRequired,
  };

  state = {
    lang: this.props.lang,
    showNote: false,
  };

  onReload = () => {
    setStorageItem('application_settings', { appLanguage: this.state.lang });
    this.setState({ showNote: false });
    this.props.setLangAction(this.state.lang);
  };

  selectLanguage = (lang) => {
    this.setState({ lang, showNote: true });
  };

  render() {
    const englishIcon = `<div className=${cx('icon-block')}>
        <i className=${cx('icon')}>${EnglishFlagIcon}</i>
        ${this.props.intl.formatMessage(messages.english)}
      </div>`;
    const russianIcon = `<div className=${cx('icon-block')}>
        <i className=${cx('icon')}>${RussianFlagIcon}</i>
        ${this.props.intl.formatMessage(messages.russian)}
      </div>`;
    return (
      <div className={cx('localization-block')}>
        <span className={cx('label')}>{this.props.intl.formatMessage(messages.label)}</span>
        <div className={cx('localization')}>
          <InputDropdown
            options={[
              {
                value: 'en',
                label: Parser(englishIcon),
              },
              {
                value: 'ru',
                label: Parser(russianIcon),
              },
            ]}
            value={this.state.lang}
            onChange={this.selectLanguage}
          />
          {this.state.showNote && (
            <div className={cx('description')}>
              <p className={cx('note')}>{this.props.intl.formatMessage(messages.note)}:</p>
              <a className={cx('text')} onClick={this.onReload}>
                {Parser(this.props.intl.formatMessage(messages.reload))}
              </a>
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
