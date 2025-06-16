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

import { NavLink } from 'components/main/navLink';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';

export function LinkItem({ isInternal, link, content, icon, ...rest }) {
  return isInternal ? (
    <NavLink to={link} {...rest}>
      {content}
      {icon && <i>{Parser(icon)}</i>}
    </NavLink>
  ) : (
    <a href={link} target="_blank" rel="noreferrer noopener" {...rest}>
      {content}
      {icon && <i>{Parser(icon)}</i>}
    </a>
  );
}

LinkItem.propTypes = {
  isInternal: PropTypes.bool,
  link: PropTypes.string,
  content: PropTypes.string,
  icon: PropTypes.string,
};
