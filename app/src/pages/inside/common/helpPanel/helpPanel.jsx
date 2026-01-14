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

import React from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { LinkComponent } from '../LinkComponent';
import styles from './helpPanel.scss';

const cx = classNames.bind(styles);

export const HelpPanel = ({ items }) => {
  return (
    <div className={cx('help-panel-container')}>
      {items.map(({ title, mainIcon, link, openIcon, automationId, description, event }) => (
        <div key={`info-item-${title}`} className={cx('info-item')}>
          <span className={cx('main-item-icon')}>
            <i className={cx('icon')}>{Parser(mainIcon)}</i>
          </span>
          <div className={cx('item-content-wrapper')}>
            <LinkComponent to={link} icon={openIcon} event={event} automationId={automationId}>
              <span className={cx('item-title')}>{title}</span>
            </LinkComponent>
            <p>{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
HelpPanel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      mainIcon: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      openIcon: PropTypes.string.isRequired,
      link: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          type: PropTypes.string,
          payload: PropTypes.object,
        }),
      ]).isRequired,
      automationId: PropTypes.string,
    }),
  ),
};
HelpPanel.defaultProps = {
  items: [],
};
