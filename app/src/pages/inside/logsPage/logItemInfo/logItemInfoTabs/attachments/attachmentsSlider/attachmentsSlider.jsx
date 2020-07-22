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
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { WithStore, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import ArrowIcon from 'common/img/arrow-right-inline.svg';
import { Image } from 'components/main/image';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { DEFAULT_VISIBLE_THUMBS } from '../constants';
import styles from './attachmentsSlider.scss';

const cx = classNames.bind(styles);

@track()
class AttachmentsSlider extends Component {
  static propTypes = {
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    attachments: PropTypes.array,
    activeItemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    currentThumb: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onClickItem: PropTypes.func,
    changeActiveItem: PropTypes.func,
    isThumbsView: PropTypes.bool,
    visibleThumbs: PropTypes.number,
    carouselStore: PropTypes.object,
  };

  static defaultProps = {
    attachments: [],
    activeItemId: null,
    currentThumb: 0,
    onClickItem: () => {},
    changeActiveItem: () => {},
    isThumbsView: false,
    visibleThumbs: DEFAULT_VISIBLE_THUMBS,
    carouselStore: {},
  };

  componentDidMount() {
    if (this.props.isThumbsView && this.props.currentThumb) {
      this.updateCurrentSlide();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isThumbsView && prevProps.currentThumb !== this.props.currentThumb) {
      this.updateCurrentSlide();
    }
  }

  updateCurrentSlide = () =>
    this.props.carouselStore.setStoreState({ currentSlide: this.props.currentThumb });

  nextArrowClickHandler = () => {
    const {
      isThumbsView,
      activeItemId,
      currentThumb,
      carouselStore,
      attachments,
      visibleThumbs,
    } = this.props;

    let nextItemId = activeItemId + 1;
    let thumbConfig = null;

    if (isThumbsView) {
      if (activeItemId >= currentThumb) {
        nextItemId = currentThumb + visibleThumbs;
        if (nextItemId >= attachments.length) {
          nextItemId = attachments.length - 1;
        }
        carouselStore.setStoreState({ currentSlide: nextItemId });
        thumbConfig = { currentThumb: nextItemId };
      }
    } else {
      thumbConfig =
        activeItemId + 1 >= currentThumb + visibleThumbs ? { currentThumb: nextItemId } : null;
    }
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.NEXT_ATTACHMENT_ICON);
    this.props.changeActiveItem(nextItemId, thumbConfig);
  };

  backArrowClickHandler = () => {
    const { isThumbsView, activeItemId, currentThumb, carouselStore, visibleThumbs } = this.props;

    let prevItemId = activeItemId - 1;
    let thumbConfig = null;

    if (isThumbsView) {
      prevItemId = currentThumb - visibleThumbs;
      if (prevItemId < 0) {
        prevItemId = 0;
      }
      carouselStore.setStoreState({ currentSlide: prevItemId });
      thumbConfig = { currentThumb: prevItemId };
    } else {
      const thumbToUpdate = currentThumb - visibleThumbs < 0 ? 0 : currentThumb - visibleThumbs;
      thumbConfig = activeItemId <= currentThumb ? { currentThumb: thumbToUpdate } : null;
    }
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.PREVIOUS_ATTACHMENT_ICON);
    this.props.changeActiveItem(prevItemId, thumbConfig);
  };

  render() {
    const { isThumbsView, attachments, activeItemId, onClickItem } = this.props;
    return (
      <Fragment>
        <Slider className={cx('slider', { 'thumbs-view': isThumbsView })}>
          {attachments.map((attachment, index) => (
            <Slide index={index} key={attachment.id}>
              <div
                className={cx('preview-container', { 'main-area': !isThumbsView })}
                onClick={() => onClickItem(index)}
              >
                <Image
                  className={cx('preview', { active: isThumbsView && activeItemId === index })}
                  src={
                    isThumbsView && attachment.isImage ? attachment.thumbnailSrc : attachment.src
                  }
                  alt={attachment.alt}
                  isStatic={!attachment.isImage}
                />
              </div>
            </Slide>
          ))}
        </Slider>
        <ButtonBack onClick={this.backArrowClickHandler} className={cx('arrow', 'prev-arrow')}>
          {Parser(ArrowIcon)}
        </ButtonBack>
        <ButtonNext onClick={this.nextArrowClickHandler} className={cx('arrow', 'next-arrow')}>
          {Parser(ArrowIcon)}
        </ButtonNext>
      </Fragment>
    );
  }
}

export default WithStore(AttachmentsSlider);
