/*
 * Copyright 2024 EPAM Systems
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
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import RocketIcon from '../img/rocket-inline.svg';
import FooterImg from '../img/footer.png';
import { messages } from './messages';
import styles from './noAssignedEmptyPage.scss';

const cx = classNames.bind(styles);

export function NoAssignedEmptyPage() {
  const { formatMessage } = useIntl();
  const fullName = useSelector(fullNameSelector);
  const instanceType = useSelector(instanceTypeSelector);
  const isSaaS = instanceType === SAAS;
  const description = isSaaS
    ? formatMessage(messages.descriptionSaaS)
    : formatMessage(messages.description);

  const getSaasRender = () => {
    return (
      <div className={cx('saas-container')}>
        <section className={cx('block')}>
          <h2 className={cx('block-title')}>{formatMessage(messages.existingOrganization)}</h2>
          <p className={cx('block-description')}>{formatMessage(messages.invitations)}</p>
        </section>
        <div className={cx('separator-container')}>
          <div className={cx('text')}>{formatMessage(messages.or)}</div>
          <div className={cx('separator')} />
        </div>
        <section className={cx('block')}>
          <h2 className={cx('block-title')}>{formatMessage(messages.createOwnOrganization)}</h2>
          <p className={cx('block-description')}>{formatMessage(messages.contactUs)}</p>
          <a
            href="https://reportportal.io/pricing/saas"
            className={cx('link-container')}
            target="_blank"
            rel="noreferrer noopener"
          >
            <div className={cx('link')}>{formatMessage(messages.reviewPricing)}</div>
            <div className={cx('open-icon')}>{Parser(OpenIcon)}</div>
          </a>
        </section>
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
      <img className={cx('footer-icon')} src={FooterImg} alt="footer" />
    </div>
  );
}
