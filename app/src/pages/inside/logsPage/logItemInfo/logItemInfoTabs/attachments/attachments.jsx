import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { CarouselProvider } from 'pure-react-carousel';
import {
  attachmentItemsSelector,
  attachmentsLoadingSelector,
  openAttachmentAction,
  fetchAttachmentsConcatAction,
  attachmentsPaginationSelector,
} from 'controllers/log/attachments';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { NoItemMessage } from 'components/main/noItemMessage';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
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

@connect(
  (state) => ({
    attachments: attachmentItemsSelector(state),
    loading: attachmentsLoadingSelector(state),
    pagination: attachmentsPaginationSelector(state),
  }),
  {
    fetchAttachmentsConcatAction,
    openAttachmentAction,
  },
)
@injectIntl
export class Attachments extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    attachments: PropTypes.array,
    activeItemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    pagination: PropTypes.object,
    loading: PropTypes.bool,
    onChangeActiveItem: PropTypes.func,
    fetchAttachmentsConcatAction: PropTypes.func,
    openAttachmentAction: PropTypes.func,
    isMobileView: PropTypes.bool,
  };

  static defaultProps = {
    attachments: [],
    pagination: {},
    loading: false,
    activeItemId: null,
    onChangeActiveItem: () => {},
    fetchAttachmentsConcatAction: () => {},
    openAttachmentAction: () => {},
    isMobileView: false,
  };

  static getVisibleThumbs = (isMobile) =>
    isMobile ? MOBILE_VISIBLE_THUMBS : DEFAULT_VISIBLE_THUMBS;

  constructor(props) {
    super(props);
    const { activeItemId, isMobileView, pagination } = props;

    const visibleThumbs = Attachments.getVisibleThumbs(isMobileView);
    const currentThumb = activeItemId
      ? Math.floor(activeItemId / visibleThumbs) * visibleThumbs
      : 0;

    this.state = {
      mainAreaVisible: activeItemId !== null,
      currentThumb,
      page: pagination.number ? pagination.number + 1 : 1,
      size: visibleThumbs,
    };
  }

  componentDidMount() {
    const { page } = this.state;
    const { loading, attachments } = this.props;
    !attachments.length && !loading && this.fetchAttachments({ page });
  }

  componentDidUpdate() {
    const { page } = this.state;
    const {
      attachments,
      pagination: { totalPages },
      loading,
    } = this.props;
    if (totalPages > 1 && attachments.length <= this.state.size && page < 3 && !loading) {
      this.fetchAttachments({ page });
    }
  }

  onClickItem = (itemIndex) => this.props.openAttachmentAction(this.props.attachments[itemIndex]);

  onClickThumb = (itemIndex) => {
    this.props.onChangeActiveItem(itemIndex);
    this.setState({ mainAreaVisible: true });
  };

  changeActiveItem = (activeItemId, thumbConfig) => {
    const prevActiveItemId = this.props.activeItemId;
    this.props.onChangeActiveItem(activeItemId);
    this.setState(
      {
        currentThumb: thumbConfig ? thumbConfig.currentThumb : this.state.currentThumb,
      },
      () => this.loadNewItems(prevActiveItemId, thumbConfig),
    );
  };

  loadNewItems = (prevActiveItemId, thumbConfig) => {
    if (thumbConfig && this.props.activeItemId > prevActiveItemId) {
      const { page, size } = this.state;
      const currentPage = Math.floor(thumbConfig.currentThumb / size) + 1;
      if (currentPage + 1 >= page) {
        const {
          attachments,
          pagination: { totalElements, totalPages },
          loading,
        } = this.props;

        if ((attachments.length >= totalElements && page >= totalPages) || loading) {
          return;
        }

        this.fetchAttachments({ page });
      }
    }
  };

  fetchAttachments = ({ page, size }) => {
    const { size: stateSize, page: statePage } = this.state;
    const params = {
      'filter.ex.binaryContent': true,
      [PAGE_KEY]: page || statePage,
      [SIZE_KEY]: size || stateSize,
    };

    const concat = page > 1;

    this.props.fetchAttachmentsConcatAction({ params, concat });
    this.setState({ page: page + 1 });
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
    const visibleThumbs = Attachments.getVisibleThumbs(isMobileView);

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
