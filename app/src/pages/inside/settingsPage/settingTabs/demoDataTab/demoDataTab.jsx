import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';

import { DemoDataTabForm } from './demoDataTabForm/';
import warningIcon from './img/warning-icon-inline.svg';
import styles from './demoDataTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  mobileHint: {
    id: 'DemoDataTab.mobileHint',
    defaultMessage: 'You can generate data only on desktop view.',
  },
  descriptionHeader: {
    id: 'DemoDataTab.descriptionHeader',
    defaultMessage: 'The system will generate the following demo data:',
  },
  descriptionListFirstItem: {
    id: 'DemoDataTab.descriptionListFirstItem',
    defaultMessage: '10 launches',
  },
  descriptionListSecItem: {
    id: 'DemoDataTab.descriptionListSecItem',
    defaultMessage: '1 dashboard with 9 widgets',
  },
  descriptionListThirdItem: {
    id: 'DemoDataTab.descriptionListThirdItem',
    defaultMessage: '1 filter',
  },
  postfixHint: {
    id: 'DemoDataTab.postfixHint',
    defaultMessage: 'Postfix will be added to the demo dashboard, widgets, filter name',
  },
  warningText: {
    id: 'DemoDataTab.warningText',
    defaultMessage: 'Warning!',
  },
  warningInfo: {
    id: 'DemoDataTab.warningInfo',
    defaultMessage: 'You will have to remove the demo data manually.',
  },
});

@injectIntl
export class DemoDataTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('demo-data-tab')}>
        <span className={cx('mobile-hint')}>{intl.formatMessage(messages.mobileHint)}</span>
        <h5 className={cx('description-header')}>
          {intl.formatMessage(messages.descriptionHeader)}
        </h5>
        <ul className={cx('description-list')}>
          <li>{intl.formatMessage(messages.descriptionListFirstItem)}</li>
          <li>{intl.formatMessage(messages.descriptionListSecItem)}</li>
          <li>{intl.formatMessage(messages.descriptionListThirdItem)}</li>
        </ul>
        <span className={cx('postfix-hint')}>{intl.formatMessage(messages.postfixHint)}</span>
        <DemoDataTabForm />
        <div className={cx('warning-block')}>
          <i className={cx('warning-icon')}>{Parser(warningIcon)}</i>
          <span className={cx('warning-text')}>{intl.formatMessage(messages.warningText)}</span>
          <p className={cx('warning-info')}>{intl.formatMessage(messages.warningInfo)}</p>
        </div>
      </div>
    );
  }
}
