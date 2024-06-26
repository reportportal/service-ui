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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import DOMPurify from 'dompurify';
import styles from './textTooltip.scss';

const cx = classNames.bind(styles);

export const TextTooltip = ({
  tooltipContent,
  className,
  preventParsing,
  preventTargetSanitizing,
}) => {
  const content = preventTargetSanitizing
    ? Parser(DOMPurify.sanitize(tooltipContent, { ADD_ATTR: ['target'] }))
    : Parser(DOMPurify.sanitize(tooltipContent));

  return (
    <div className={cx('text-tooltip', className)}>{preventParsing ? tooltipContent : content}</div>
  );
};
TextTooltip.propTypes = {
  tooltipContent: PropTypes.any,
  className: PropTypes.string,
  preventParsing: PropTypes.bool,
  preventTargetSanitizing: PropTypes.bool,
};
TextTooltip.defaultProps = {
  tooltipContent: '',
  className: '',
  preventParsing: false,
  preventTargetSanitizing: false,
};
