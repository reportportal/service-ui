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

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { SCREEN_SM_MAX_MEDIA } from 'common/constants/screenSizeVariables';
import { PageButton } from './pageButton';

const DESKTOP_MAX_VISIBLE_PAGES = 10;
const MOBILE_MAX_VISIBLE_PAGES = 4;

const createPageRange = (start, end) => {
  const res = [];
  // eslint-disable-next-line no-plusplus
  for (let i = start; i <= end; i++) {
    res.push(i);
  }
  return res;
};

const createPageNumberButtons = (maxShownPages, activePage, pageCount, onChangePage) => {
  let range = [];
  const halfShownPages = parseInt(maxShownPages / 2, 10);
  if (pageCount <= maxShownPages) {
    range = createPageRange(1, pageCount);
  } else if (activePage <= halfShownPages) {
    range = createPageRange(1, maxShownPages);
  } else if (activePage >= pageCount - halfShownPages) {
    range = createPageRange(pageCount - (maxShownPages - 1), pageCount);
  } else {
    range = createPageRange(activePage - (halfShownPages - 1), activePage + halfShownPages);
  }
  const buttons = range.map((page) => (
    <PageButton
      key={page}
      active={activePage === page}
      onClick={() => activePage !== page && onChangePage(page)}
    >
      {page}
    </PageButton>
  ));
  if (range[0] !== 1) {
    buttons.unshift('...');
  }
  if (range[range.length - 1] !== pageCount) {
    buttons.push('...');
  }
  return buttons;
};

export class PageNumberButtons extends PureComponent {
  static propTypes = {
    activePage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    onChangePage: PropTypes.func,
  };

  static defaultProps = {
    onChangePage: () => {},
  };

  state = {
    shownPages: DESKTOP_MAX_VISIBLE_PAGES,
  };

  componentDidMount() {
    this.match = window.matchMedia(SCREEN_SM_MAX_MEDIA);
    this.match.addListener(this.setShownPages);
    this.setShownPages(this.match);
  }

  componentWillUnmount() {
    if (!this.match) {
      return;
    }
    this.match.removeListener(this.setShownPages);
  }

  setShownPages = (media) =>
    this.setState({
      shownPages: media.matches ? MOBILE_MAX_VISIBLE_PAGES : DESKTOP_MAX_VISIBLE_PAGES,
    });

  render() {
    return createPageNumberButtons(
      this.state.shownPages,
      this.props.activePage,
      this.props.pageCount,
      this.props.onChangePage,
    );
  }
}
