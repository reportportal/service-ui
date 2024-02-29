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

import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import DOMPurify from 'dompurify';
import Link from 'redux-first-router-link';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { MarkdownViewer } from 'components/main/markdown';
import styles from './filterName.scss';

const cx = classNames.bind(styles);

const NameLink = ({ link, children }) =>
  link ? (
    <Link className={cx('name-link')} to={link}>
      {children}
    </Link>
  ) : (
    children
  );
NameLink.propTypes = {
  link: PropTypes.string,
  children: PropTypes.node,
};
NameLink.defaultProps = {
  link: '',
  children: null,
};

export class FilterName extends Component {
  static propTypes = {
    userFilters: PropTypes.array,
    filter: PropTypes.object,
    onClickName: PropTypes.func,
    onEdit: PropTypes.func,
    search: PropTypes.string,
    showDesc: PropTypes.bool,
    editable: PropTypes.bool,
    isBold: PropTypes.bool,
    isLink: PropTypes.bool,
    nameLink: PropTypes.object,
  };

  static defaultProps = {
    userFilters: [],
    filter: {},
    onClickName: () => {},
    onEdit: () => {},
    search: '',
    showDesc: true,
    editable: true,
    isBold: false,
    isLink: false,
    nameLink: null,
  };

  getHighlightName = () => {
    const {
      filter: { name },
      search,
    } = this.props;

    if (!search.length) {
      return name;
    }

    return name.replace(
      new RegExp(search, 'i'),
      (match) => `<span class=${cx('name-highlight')}>${match}</span>`,
    );
  };

  render() {
    const {
      userFilters,
      filter,
      onClickName,
      onEdit,
      showDesc,
      editable,
      isBold,
      isLink,
      nameLink,
    } = this.props;

    return (
      <Fragment>
        <span className={cx('name-wrapper')}>
          <NameLink link={nameLink}>
            <span
              className={cx('name', {
                bold: isBold,
                link: isLink || userFilters.find((item) => item.id === filter.id),
              })}
              onClick={() => onClickName(filter)}
            >
              {Parser(DOMPurify.sanitize(this.getHighlightName(filter.name)))}
            </span>
          </NameLink>
          {editable && (
            <span className={cx('pencil-icon')} onClick={() => onEdit(filter)}>
              {Parser(PencilIcon)}
            </span>
          )}
        </span>
        {showDesc && <MarkdownViewer value={filter.description} />}
      </Fragment>
    );
  }
}
