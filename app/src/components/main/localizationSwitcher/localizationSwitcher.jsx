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
        <LocalizationSwitcherItem
          lang={this.props.lang}
          currentLang="uk"
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
