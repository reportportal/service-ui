import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { showModalAction } from 'controllers/modal';
import { appInfoSelector } from 'controllers/appInfo/selectors';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { analyzerAttributesSelector } from 'controllers/project';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { INDEXING_RUNNING } from '../analysisForm/constants';
import styles from './indexActionsBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  indexActionsBlockTitle: {
    id: 'IndexActionsBlock.title',
    defaultMessage: 'Actions with index',
  },
  removeIndexDescription: {
    id: 'IndexActionsBlock.removeIndexDescription',
    defaultMessage:
      'All data with your investigations will be deleted from the ElasticSearch. For creating a new one you could start to investigate test results manually or generate data based on previous results on the project once again',
  },
  generateIndexDescription: {
    id: 'IndexActionsBlock.generateIndexDescription',
    defaultMessage:
      'All data is removed from ElasticSearch and new one is generated based on all previous investigations on the project in accordance with current analysis settings. You can start auto-analyse test results after receiving an e-mail about the end of the generation process',
  },
  removeIndexButtonCaption: {
    id: 'IndexActionsBlock.removeIndexButtonCaption',
    defaultMessage: 'Remove index',
  },
  generateIndexButtonCaption: {
    id: 'IndexActionsBlock.generateIndexButtonCaption',
    defaultMessage: 'Generate index',
  },
  generateIndexButtonProgressCaption: {
    id: 'IndexActionsBlock.generateIndexButtonProgressCaption',
    defaultMessage: 'In progress...',
  },
  analyzerDisabledButtonTitle: {
    id: 'IndexActionsBlock.analyzerDisabledButtonTitle',
    defaultMessage: 'Service ANALYZER is not running',
  },
});

@connect(
  (state) => ({
    indexingRunning: JSON.parse(analyzerAttributesSelector(state)[INDEXING_RUNNING] || 'false'),
    appInfo: appInfoSelector(state),
  }),
  {
    showRemoveIndexModal: () => showModalAction({ id: 'removeIndexModal' }),
    showGenerateIndexModal: () => showModalAction({ id: 'generateIndexModal' }),
  },
)
@injectIntl
@track()
export class IndexActionsBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    disabled: PropTypes.bool,
    indexingRunning: PropTypes.bool,
    appInfo: PropTypes.object,
    showRemoveIndexModal: PropTypes.func,
    showGenerateIndexModal: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    disabled: false,
    indexingRunning: false,
    appInfo: {},
    showRemoveIndexModal: () => {},
    showGenerateIndexModal: () => {},
  };

  removeIndex = () => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.REMOVE_INDEX_BTN);
    this.props.showRemoveIndexModal();
  };

  generateIndex = () => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.GENERATE_INDEX_BTN);
    this.props.showGenerateIndexModal();
  };

  render() {
    const { intl, disabled } = this.props;
    return (
      <Fragment>
        <div className={cx('index-actions-title-wrapper')}>
          <p className={cx('index-actions-title')}>
            {intl.formatMessage(messages.indexActionsBlockTitle)}
          </p>
        </div>

        <div className={cx('form-group-container')}>
          <div className={cx('index-action-description')}>
            {intl.formatMessage(messages.removeIndexDescription)}
          </div>
          <div className={cx('form-group-column')}>
            <GhostButton
              disabled={this.props.indexingRunning || !this.props.appInfo.ANALYZER || disabled}
              onClick={this.removeIndex}
              mobileDisabled
            >
              <span className={cx('index-action-caption')}>
                {intl.formatMessage(messages.removeIndexButtonCaption)}
              </span>
            </GhostButton>
          </div>
        </div>

        <div className={cx('form-group-container')}>
          <div className={cx('index-action-description')}>
            {intl.formatMessage(messages.generateIndexDescription)}
          </div>
          <div className={cx('form-group-column')}>
            <GhostButton
              disabled={this.props.indexingRunning || !this.props.appInfo.ANALYZER || disabled}
              onClick={this.generateIndex}
              title={
                !this.props.appInfo.ANALYZER
                  ? intl.formatMessage(messages.analyzerDisabledButtonTitle)
                  : ''
              }
              mobileDisabled
            >
              <span className={cx('index-action-caption')}>
                {intl.formatMessage(
                  messages[
                    this.props.indexingRunning
                      ? 'generateIndexButtonProgressCaption'
                      : 'generateIndexButtonCaption'
                  ],
                )}
              </span>
            </GhostButton>
          </div>
        </div>
      </Fragment>
    );
  }
}
