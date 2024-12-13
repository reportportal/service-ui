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

import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { fullNameSelector } from 'controllers/user/selectors';
import OpenIcon from 'common/img/open-in-rounded-inline.svg';
import { SAAS } from 'controllers/appInfo/constants';
import { useIntl } from 'react-intl';
import RocketIcon from '../img/rocket-inline.svg';
import FooterIcon from '../img/footer-inline.svg';
import { messages } from './messages';
import styles from './noAssignedEmptyPage.scss';

const cx = classNames.bind(styles);

export const NoAssignedEmptyPage = () => {
  const { formatMessage } = useIntl();
  const fullName = useSelector(fullNameSelector);
  const isSaaS = process.env.SAAS !== SAAS;
  const description = isSaaS
    ? formatMessage(messages.descriptionSaaS)
    : formatMessage(messages.description);

  const getSaasRender = () => {
    return (
      <div className={cx('saas-container')}>
        <div className={cx('block')}>
          <div className={cx('block-title')}>{formatMessage(messages.existingOrganization)}</div>
          <div className={cx('block-description')}>{formatMessage(messages.invitations)}</div>
        </div>
        <div className={cx('separator-container')}>
          <div className={cx('text')}>{formatMessage(messages.or)}</div>
          <div className={cx('separator')} />
        </div>
        <div className={cx('block')}>
          <div className={cx('block-title')}>{formatMessage(messages.createOwnOrganization)}</div>
          <div className={cx('block-description')}>{formatMessage(messages.contactUs)}</div>
          <a
            href="https://reportportal.io/pricing/saas"
            className={cx('link-container')}
            target="_blank"
            rel="noreferrer noopener"
          >
            <div className={cx('link')}>{formatMessage(messages.reviewPricing)}</div>
            <div className={cx('open-icon')}>{Parser(OpenIcon)}</div>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className={cx('no-assigned-empty-page')}>
      <div className={cx('content')}>
        <div className={cx('rocket-icon')}>{Parser(RocketIcon)}</div>
        <div className={cx('title')}>{`${formatMessage(messages.title)}, ${fullName}!`}</div>
        <div className={cx('description')}>{description}</div>
        {isSaaS && getSaasRender()}
      </div>
      <div className={cx('footer-icon')}>{Parser(FooterIcon)}</div>
    </div>
  );
};
