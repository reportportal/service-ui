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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { API_PAGE } from 'controllers/pages';
import { useState } from 'react';
import { referenceDictionary } from 'common/utils';
import { LinkItem } from '../linkItem';
import { FAQWithPopover } from '../index';
import styles from './servicesContent.scss';
import { messages } from '../../messages';

const cx = classNames.bind(styles);

export const ServicesContent = ({ closePopover, closeNavbar, isFaqTouched, onOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { formatMessage } = useIntl();

  const currentYear = new Date().getFullYear();

  const ServiceContentItems = [
    {
      linkTo: referenceDictionary.rpDoc,
      message: messages.documentation,
    },
    {
      isInternal: true,
      linkTo: { type: API_PAGE },
      message: messages.openAPI,
    },
    {
      linkTo: referenceDictionary.rpGitHub,
      message: messages.github,
    },
    {
      linkTo: referenceDictionary.rpSlack,
      message: messages.slack,
    },
    {
      linkTo: referenceDictionary.rpEmail,
      message: messages.contactUs,
    },
    {
      linkTo: referenceDictionary.rpEpam,
      message: messages.epam,
    },
  ];

  const onClearHover = () => {
    setIsHovered(false);
  };

  const onSetHover = () => {
    setIsHovered(true);
  };

  return (
    <>
      <button
        className={cx('FAQ-control', { hovered: isHovered })}
        onMouseLeave={onClearHover}
        onMouseEnter={onSetHover}
      >
        <FAQWithPopover
          closeNavbar={closeNavbar}
          closePopover={closePopover}
          isFaqTouched={isFaqTouched}
          onOpen={onOpen}
          title={formatMessage(messages.FAQ)}
        />
      </button>

      {ServiceContentItems.map((contentItem) => (
        <LinkItem
          link={contentItem.linkTo}
          content={formatMessage(contentItem.message)}
          onClick={() => {
            closePopover();
            closeNavbar();
          }}
          className={cx('menu-item')}
          isInternal={contentItem.isInternal}
          activeClassName={cx('active')}
          key={contentItem.linkTo.type || contentItem.linkTo}
        />
      ))}

      <p className={cx('menu-item', 'with-divider')}>{formatMessage(messages.servicesVersions)}</p>
      <p className={cx('menu-item', 'rights')}>{formatMessage(messages.rights, { currentYear })}</p>
    </>
  );
};

ServicesContent.propTypes = {
  closePopover: PropTypes.func.isRequired,
  closeNavbar: PropTypes.func.isRequired,
  isFaqTouched: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
};
