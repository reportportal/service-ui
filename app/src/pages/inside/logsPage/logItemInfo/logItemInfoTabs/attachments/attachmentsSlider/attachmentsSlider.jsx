import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { WithStore, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import ArrowIcon from 'common/img/arrow-right-inline.svg';
import { DEFAULT_VISIBLE_THUMBS } from '../constants';
import styles from './attachmentsSlider.scss';

const cx = classNames.bind(styles);

class AttachmentsSlider extends Component {
  static propTypes = {
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
    this.props.changeActiveItem(prevItemId, thumbConfig);
  };

  render() {
    const { isThumbsView, activeItemId, onClickItem } = this.props;
    return (
      <Fragment>
        <Slider className={cx('slider', { 'thumbs-view': isThumbsView })}>
          {this.props.attachments.map((attachment, index) => (
            <Slide index={index} key={attachment.id}>
              <div
                className={cx('preview-container', { 'main-area': !isThumbsView })}
                onClick={() => onClickItem(index)}
              >
                <img
                  className={cx('preview', { active: isThumbsView && activeItemId === index })}
                  src={attachment.src}
                  alt={attachment.alt}
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
