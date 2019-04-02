import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { langSelector, setLangAction } from 'controllers/lang';
import styles from './localizationSwitcher.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    lang: langSelector(state),
  }),
  {
    setLangAction,
  },
)
export class LocalizationSwitcher extends PureComponent {
  static propTypes = {
    lang: PropTypes.string.isRequired,
    setLangAction: PropTypes.func.isRequired,
  };
  render() {
    return (
      <ul className={cx('container')}>
        <LocalizationSwitcherItem
          lang={this.props.lang}
          currentLang="en"
          setLang={this.props.setLangAction}
        />
        <LocalizationSwitcherItem
          lang={this.props.lang}
          currentLang="ru"
          setLang={this.props.setLangAction}
        />
        <LocalizationSwitcherItem
          lang={this.props.lang}
          currentLang="be"
          setLang={this.props.setLangAction}
        />
      </ul>
    );
  }
}

const LocalizationSwitcherItem = ({ lang, currentLang, setLang }) => (
  <li // eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
    className={cx({
      active: lang === currentLang,
      item: true,
    })}
    onClick={() => {
      setLang(currentLang);
    }}
  >
    {currentLang}
  </li>
);
LocalizationSwitcherItem.propTypes = {
  lang: PropTypes.string.isRequired,
  currentLang: PropTypes.string.isRequired,
  setLang: PropTypes.func.isRequired,
};
