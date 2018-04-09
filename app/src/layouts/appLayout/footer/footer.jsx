import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { buildVersionSelector } from 'controllers/appInfo';
import { referenceDictionary } from 'common/utils';
import styles from './footer.scss';

const cx = classNames.bind(styles);

@connect(state => ({
  buildVersion: buildVersionSelector(state),
}))
export class Footer extends Component {
  static propTypes = {
    buildVersion: PropTypes.string.isRequired,
  };
  render() {
    const { buildVersion } = this.props;
    return (
      <div className={cx('footer')}>
        <div className={cx('footer-links')}>
          <a
            href={referenceDictionary.rpGitHub}
            target="_blank"
          >
            <FormattedMessage
              id={'Footer.git'}
              defaultMessage={'Fork us on GitHub'}
            />
          </a>
          <a
            href={referenceDictionary.rpSlack}
            target="_blank"
          >
            <FormattedMessage
              id={'Footer.slack'}
              defaultMessage={'Chat with us on Slack'}
            />
          </a>
          <a href={referenceDictionary.rpEmail}>
            <FormattedMessage
              id={'Footer.contact'}
              defaultMessage={'Contact us'}
            />
          </a>
          <a
            href={referenceDictionary.rpEpam}
            target="_blank"
          >
              EPAM
          </a>
          <a
            href={referenceDictionary.rpDoc}
            target="_blank"
          >
            <FormattedMessage
              id={'Footer.documentation'}
              defaultMessage={'Documentation'}
            />
          </a>
        </div>
        <div className={cx('text-wrapper')}>
          <div className={cx('footer-text')}>
            <FormattedMessage
              id={'Footer.build'}
              defaultMessage={'Build'}
            />
            <span>: {buildVersion}</span>
          </div>
          <div className={cx('footer-text')}>
            <span> &copy; Report Portal 2018 </span>
            <FormattedMessage
              id={'Footer.copyright'}
              defaultMessage={'All rights reserved'}
            />
          </div>
        </div>
      </div>
    );
  }
}
