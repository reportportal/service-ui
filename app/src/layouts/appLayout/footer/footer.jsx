import React from 'react';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './footer.scss';

const cx = classNames.bind(styles);

export const Footer = () => (
  <div className={cx('footer')}>
    <ul className={cx('footer-links')}>
      <li>
        <a
          href="https://github.com/reportportal/reportportal"
          target="_blank"
        >
          <FormattedMessage
            id={'Footer.git'}
            defaultMessage={'Fork us on GitHub'}
          />
        </a>
      </li>
      <li>
        <a
          href="https://reportportal-slack-auto.herokuapp.com/"
          target="_blank"
        >
          <FormattedMessage
            id={'Footer.slack'}
            defaultMessage={'Chat with us on Slack'}
          />
        </a>
      </li>
      <li>
        <a href="mailto:support@reportportal.io">
          <FormattedMessage
            id={'Footer.contact'}
            defaultMessage={'Contact us'}
          />
        </a>
      </li>
      <li>
        <a
          href="http://www.epam.com"
          target="_blank"
        >
            EPAM
        </a>
      </li>
      <li>
        <a
          href="http://reportportal.io/#documentation"
          target="_blank"
        >
          <FormattedMessage
            id={'Footer.documentation'}
            defaultMessage={'Documentation'}
          />
        </a>
      </li>
    </ul>
    <div>
      <div className={cx('footer-text')}>
        <FormattedMessage
          id={'Footer.build'}
          defaultMessage={'Build'}
        />
        <span>: 4.0.1-SNAPSHOT-512</span>
      </div>
      <div className={cx('footer-text')}>
        <span> © Report Portal 2018 </span>
        <FormattedMessage
          id={'Footer.allrights'}
          defaultMessage={'All rights reserved'}
        />
      </div>
    </div>
  </div>
);
