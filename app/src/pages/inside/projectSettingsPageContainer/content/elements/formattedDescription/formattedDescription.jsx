/*
 * Copyright 2023 EPAM Systems
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
import Parser from 'html-react-parser';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import styles from './formattedDescription.scss';

const cx = classNames.bind(styles);

const isAnchorElement = (target) => target.tagName === 'A' || !!target.closest('SVG');

export const FormattedDescription = ({ content, event }) => {
  const { trackEvent } = useTracking();

  const handleExternalLinkClick = ({ target }) => {
    if (isAnchorElement(target)) {
      trackEvent(event);
    }
  };

  return (
    <span className={cx('formatted-description')} onClick={handleExternalLinkClick}>
      {Parser(content)}
    </span>
  );
};
FormattedDescription.propTypes = {
  content: PropTypes.string,
  event: PropTypes.object,
};
FormattedDescription.defaultProps = {
  content: '',
  event: {},
};
