import React, { Component } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames/bind';

import { Input } from 'components/inputs/input';
import styles from './demoDataTab.scss';
import warningSign from './img/ic-warning.svg';

const cx = classNames.bind(styles);

export class DemoDataGenerator extends Component {
  static propTypes = {
    postfix: PropTypes.string.isRequired,
    postfixChanged: PropTypes.func.isRequired,
    generateDemo: PropTypes.func.isRequired,
  };

  handleOnChange = (event) => {
    this.props.postfixChanged(event.target.value);
  };

  handleClick = () => {
    this.props.generateDemo();
  };

  render() {
    return (
      <div className={cx('demo-data-generator-container')}>
        <p className={cx('you-can-generate-dat')}>You can generate data only on desktop view.</p>
        <h5 className={cx('the-system-will-gene')}>
          THE SYSTEM WILL GENERATE THE FOLLOWING DEMO DATA:
        </h5>
        <ul>
          <li>
            <span className={cx('dot')} />10 launches
          </li>
          <li>
            <span className={cx('dot')} />1 dashboard with 9 widgets
          </li>
          <li>
            <span className={cx('dot')} />1 filter
          </li>
        </ul>
        <p className={cx('post-fix-will-be-add')}>
          Postfix will be added to the demo dashboard, widgets, filter name
        </p>
        <div className={cx('input-enter-postfix')}>
          <Input
            placeholder="Enter Postfix"
            value={this.props.postfix}
            onChange={this.handleOnChange}
          />
        </div>
        <button className={cx('button')} onClick={this.handleClick}>
          <span className={cx('generate-demo-data')}>Generate Demo Data</span>
        </button>
        <div className={cx('warning-message')}>
          <img src={warningSign} className={cx('warning-sign')} alt="red exclamation sign" />
          <p className={cx('warning-text')}>Warning</p>
        </div>
        <p className={cx('you-will-have-to-remove')}>
          You will have to remove the demo data manually.
        </p>
      </div>
    );
  }
}
