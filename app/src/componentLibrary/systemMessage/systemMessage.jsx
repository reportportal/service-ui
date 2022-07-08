/*
 * Copyright 2022 EPAM Systems
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
import styles from './systemMessage.scss';

const cx = classNames.bind(styles);
const MODE_INFORMATION = 'info';
const MODE_WARNING = 'warning';
const MODE_SYS_ERROR = 'error';

export const SystemMessage = ({ header, caption, children, mode, widthByContent }) => {
  return (
    <div className={cx('system-message', { 'content-width': widthByContent })}>
      <div className={cx(`stripes-${mode}`)} />
      <div className={cx('text-container')}>
        {header && <h1 className={cx(`message-header-${mode}`)}>{header}</h1>}
        <h2>{children}</h2>
        {caption && <p>{caption}</p>}
      </div>
    </div>
  );
};

SystemMessage.propTypes = {
  header: PropTypes.string,
  caption: PropTypes.string,
  children: PropTypes.node,
  mode: PropTypes.oneOf([MODE_INFORMATION, MODE_WARNING, MODE_SYS_ERROR]),
  widthByContent: PropTypes.bool,
};

SystemMessage.defaultProps = {
  header: '',
  caption: '',
  children: '',
  mode: MODE_INFORMATION,
  widthByContent: false,
};
