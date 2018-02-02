import { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './localizationContainer.scss';

const cx = classNames.bind(styles);

export class LocalizationSwitcher extends PureComponent {
  render() {
    return (
      <ul className={cx('container')}>
        <li>EN</li>
        <li>RU</li>
        <li>BE</li>
      </ul>
    );
  }
}
