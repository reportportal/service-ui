/*!
 * Copyright 2026 EPAM Systems
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

import SubLevelIcon from './img/sub-level-inline.svg';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { NavLink } from 'components/main/navLink';
import styles from './popoverContent.scss';

const cx = classNames.bind(styles);

const SHIFT = 16;

const getStartShift = (index) => {
  if (index === 0) {
    return "0px";
  }
  return `${(index - 1) * SHIFT}px`;
};

export const PopoverContent = ({ descriptors }) => {
  if (!descriptors.length) {
    return null;
  }

  return (
    <div>
      {descriptors.map(({ title, link }, index) => (
        <div key={title} className={cx('crumb')} style={{marginInlineStart: getStartShift(index)}}>
          {index ? Parser(SubLevelIcon) : null}
          {link ? <NavLink to={link}>{title}</NavLink> : title}
        </div>
      ))}
    </div>
  )
}

PopoverContent.propTypes = {
  descriptors: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.shape({
        type: PropTypes.string.isRequired,
        payload: PropTypes.object,
      }),
    })
  ).isRequired,
};

PopoverContent.defaultProps = {
  projectName: null,
};
