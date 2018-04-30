import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';

import styles from './demoDataGenerator.scss';
import warningSign from './img/ic-warning.svg';
import DemoDataGeneratorForm from './demoDataGeneratorForm';

const cx = classNames.bind(styles);

export class DemoDataGenerator extends Component {
  generateDemoData = (values) => {
    console.log('values: ', values);
  };
  render() {
    return (
      <div className={cx('demo-data-generator-container')}>
        <p className={cx('mobile-hint')}>
          <FormattedMessage
            id={'DemoDataGenerator.mobileHint'}
            defaultMessage={'You can generate data only on desktop view.'}
          />
        </p>
        <h5 className={cx('description-header')}>
          <FormattedMessage
            id={'DemoDataGenerator.descriptionHeader'}
            defaultMessage={'THE SYSTEM WILL GENERATE THE FOLLOWING DEMO DATA:'}
          />
        </h5>
        <ul className={cx('description-list')}>
          <li>
            <FormattedMessage
              id={'DemoDataGenerator.descriptionListFirstItem'}
              defaultMessage={'10 launches'}
            />
          </li>
          <li>
            <FormattedMessage
              id={'DemoDataGenerator.descriptionListSecItem'}
              defaultMessage={'1 dashboard with 9 widgets'}
            />
          </li>
          <li>
            <FormattedMessage
              id={'DemoDataGenerator.descriptionListThirdItem'}
              defaultMessage={'1 filter'}
            />
          </li>
        </ul>
        <p className={cx('postfix-hint')}>
          <FormattedMessage
            id={'DemoDataGenerator.postfixHint'}
            defaultMessage={'Postfix will be added to the demo dashboard, widgets, filter name'}
          />
        </p>
        <DemoDataGeneratorForm onSubmit={this.generateDemoData} />
        <div className={cx('warning-block')}>
          <img src={warningSign} className={cx('warning-sign')} alt="red exclamation sign" />
          <p className={cx('warning-text')}>
            <FormattedMessage id={'DemoDataGenerator.warningText'} defaultMessage={'Warning'} />
          </p>
          <p className={cx('warning-info')}>
            <FormattedMessage
              id={'DemoDataGenerator.warningInfo'}
              defaultMessage={'You will have to remove the demo data manually.'}
            />
          </p>
        </div>
      </div>
    );
  }
}
