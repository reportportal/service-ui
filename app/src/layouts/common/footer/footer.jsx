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

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { serverFooterLinksSelector, uiBuildVersionSelector } from 'controllers/appInfo';
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import { EPAM, SAAS } from 'controllers/appInfo/constants';
import styles from './footer.scss';

const cx = classNames.bind(styles);
export const DEFAULT_FOOTER_LINKS = [
  {
    name: 'Fork us on GitHub',
    url: referenceDictionary.rpGitHub,
  },
  {
    name: 'Documentation',
    url: referenceDictionary.rpDoc,
  },
];

export const PRIVACY_POLICY_LINK = {
  name: 'Privacy Policy',
  url: referenceDictionary.rpEpamPolicy,
};
const MAX_HEIGHT_ONE_LINE = 35;

export const Footer = ({ className = '' }) => {
  const buildVersion = useSelector(uiBuildVersionSelector);
  const instanceType = useSelector(instanceTypeSelector);
  const customLinks = useSelector(serverFooterLinksSelector);
  const links = [
    ...DEFAULT_FOOTER_LINKS,
    ...customLinks,
    ...(instanceType === EPAM || instanceType === SAAS ? [PRIVACY_POLICY_LINK] : []),
  ];
  const footerRef = useRef(null);
  const [isSingleLine, setIsSingleLine] = useState(true);

  useEffect(() => {
    const checkIsSingleLine = () => {
      if (footerRef.current) {
        setIsSingleLine(footerRef.current.offsetHeight <= MAX_HEIGHT_ONE_LINE);
      }
    };
    checkIsSingleLine();
    window.addEventListener('resize', checkIsSingleLine);
    return () => window.removeEventListener('resize', checkIsSingleLine);
  }, [customLinks]);

  return (
    <footer className={cx('footer', { 'one-line': isSingleLine }, className)} ref={footerRef}>
      <div className={cx('text-wrapper')}>
        <div className={cx('footer-text')}>
          <FormattedMessage id={'Footer.build'} defaultMessage={'Build'} />
          <span>: {buildVersion}</span>
        </div>
        <div className={cx('footer-text')}>
          <span> &copy; Report Portal {new Date().getFullYear()} </span>
          <FormattedMessage id={'Footer.copyright'} defaultMessage={'All rights reserved'} />
        </div>
      </div>
      <div className={cx('footer-links', { 'one-line': isSingleLine })}>
        {links.map((link) => (
          <a key={link.name} href={link.url} target="_blank">
            {link.name}
          </a>
        ))}
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};
