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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import track from 'react-tracking';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { CarouselProvider } from 'pure-react-carousel';
import {
  attachmentItemsSelector,
  attachmentsLoadingSelector,
  openAttachmentAction,
  fetchAttachmentsConcatAction,
  attachmentsPaginationSelector,
  setActiveAttachmentAction,
  activeAttachmentIdSelector,
} from 'controllers/log/attachments';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { NoItemMessage } from 'components/main/noItemMessage';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { DEFAULT_VISIBLE_THUMBS, MOBILE_VISIBLE_THUMBS } from './constants';
import { AttachmentsSlider } from './attachmentsSlider';
import styles from './attachments.scss';

export const messages = defineMessages({
  noAttachmentsMessage: {
    id: 'Attachments.noAttachmentsMessage',
    defaultMessage: 'No attachments to display',
  },
});

const cx = classNames.bind(styles);

const getVisibleThumbs = (isMobile) => (isMobile ? MOBILE_VISIBLE_THUMBS : DEFAULT_VISIBLE_THUMBS);

const getCurrentThumb = (activeItemId, visibleThumbs) =>
  activeItemId ? Math.floor(activeItemId / visibleThumbs) * visibleThumbs : 0;

@connect(
  (state) => ({
    attachments: attachmentItemsSelector(state),
    loading: attachmentsLoadingSelector(state),
    pagination: attachmentsPaginationSelector(state),
    activeItemId: activeAttachmentIdSelector(state),
  }),
  {
    fetchAttachmentsConcatAction,
    openAttachmentAction,
    setActiveAttachmentAction,
  },
)
@injectIntl
@track()
export class Attachments extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    attachments: PropTypes.array,
    activeItemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    pagination: PropTypes.object,
    loading: PropTypes.bool,
    setActiveAttachmentAction: PropTypes.func,
    fetchAttachmentsConcatAction: PropTypes.func,
    openAttachmentAction: PropTypes.func,
    isMobileView: PropTypes.bool,
  };

  static defaultProps = {
    attachments: [],
    pagination: {},
    loading: false,
    activeItemId: null,
    setActiveAttachmentAction: () => {},
    fetchAttachmentsConcatAction: () => {},
    openAttachmentAction: () => {},
    isMobileView: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.activeItemId === null) {
      const currentThumb = getCurrentThumb(props.activeItemId, state.visibleThumbs);
      return {
        mainAreaVisible: false,
        currentThumb,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const { activeItemId, isMobileView } = props;

    const visibleThumbs = getVisibleThumbs(isMobileView);
    const currentThumb = getCurrentThumb(activeItemId, visibleThumbs);

    this.state = {
      mainAreaVisible: activeItemId !== null,
      currentThumb,
      size: visibleThumbs,
    };
  }

  onClickItem = (itemIndex) => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.ATTACHMENT_CLICK);

    return this.props.openAttachmentAction(this.props.attachments[itemIndex]);
  };

  onClickThumb = (itemIndex) => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.ATTACHMENT_THUMBNAIL);
    this.props.setActiveAttachmentAction(itemIndex);
    this.setState({ mainAreaVisible: true });
  };

  changeActiveItem = (activeItemId, thumbConfig) => {
    const prevActiveItemId = this.props.activeItemId;
    this.props.setActiveAttachmentAction(activeItemId);
    this.setState(
      {
        currentThumb: thumbConfig ? thumbConfig.currentThumb : this.state.currentThumb,
      },
      () => this.loadNewItems(prevActiveItemId, thumbConfig),
    );
  };

  loadNewItems = (prevActiveItemId, thumbConfig) => {
    if (thumbConfig && this.props.activeItemId > prevActiveItemId) {
      const {
        pagination: { totalElements },
        attachments,
        loading,
      } = this.props;
      const { size } = this.state;
      const nextPage = Math.ceil((thumbConfig.currentThumb + 1) / size) + 1;
      const lastLoadedPage = Math.ceil(attachments.length / size);
      const lastPage = Math.ceil(totalElements / size);
      if (nextPage > lastLoadedPage && lastLoadedPage < lastPage && !loading) {
        this.fetchAttachments({ page: nextPage, size });
      }
    }
  };

  fetchAttachments = ({ page, size }) => {
    const params = {
      'filter.ex.binaryContent': true,
      [PAGE_KEY]: page,
      [SIZE_KEY]: size,
    };

    const concat = page > 1;

    this.props.fetchAttachmentsConcatAction({ params, concat });
  };

  renderAttachmentsContent = () => {
    const { intl, loading, attachments, isMobileView, activeItemId } = this.props;

    if (loading) {
      return <SpinningPreloader />;
    }

    if (!this.props.attachments.length) {
      return <NoItemMessage message={intl.formatMessage(messages.noAttachmentsMessage)} />;
    }

    const { currentThumb, mainAreaVisible } = this.state;
    const visibleThumbs = getVisibleThumbs(isMobileView);

    return (
      <Fragment>
        {mainAreaVisible && (
          <CarouselProvider
            naturalSlideWidth={20}
            naturalSlideHeight={30}
            dragEnabled={false}
            currentSlide={activeItemId}
            totalSlides={attachments.length}
            visibleSlides={1}
            className={cx('main-carousel')}
          >
            <AttachmentsSlider
              activeItemId={activeItemId}
              currentThumb={currentThumb}
              attachments={attachments}
              onClickItem={this.onClickItem}
              changeActiveItem={this.changeActiveItem}
              visibleThumbs={visibleThumbs}
            />
          </CarouselProvider>
        )}
        <CarouselProvider
          naturalSlideWidth={10}
          naturalSlideHeight={15}
          step={visibleThumbs}
          dragEnabled={false}
          totalSlides={attachments.length}
          visibleSlides={visibleThumbs}
          className={cx('thumbs-carousel', { 'show-separator': mainAreaVisible })}
        >
          <AttachmentsSlider
            activeItemId={activeItemId}
            currentThumb={currentThumb}
            attachments={attachments}
            onClickItem={this.onClickThumb}
            changeActiveItem={this.changeActiveItem}
            visibleThumbs={visibleThumbs}
            isThumbsView
          />
        </CarouselProvider>
      </Fragment>
    );
  };

  render() {
    return <div className={cx('attachments')}>{this.renderAttachmentsContent()}</div>;
  }
}
