import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { showModalAction } from 'controllers/modal';
import { appInfoSelector } from 'controllers/appInfo/selectors';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { projectAnalyzerConfigSelector } from 'controllers/project';
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
    indexing_running: projectAnalyzerConfigSelector(state).indexing_running,
    appInfo: appInfoSelector(state),
  }),
  { showModalAction },
)
@injectIntl
export class IndexActionsBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    indexing_running: PropTypes.bool,
    appInfo: PropTypes.object,
    showModalAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    indexing_running: false,
    appInfo: {},
    showModalAction: () => {},
  };

  showRemoveIndexModal = () => this.props.showModalAction({ id: 'removeIndexModal' });

  showGenerateIndexModal = () => this.props.showModalAction({ id: 'generateIndexModal' });

  render() {
    const { intl } = this.props;
    return (
      <React.Fragment>
        <div className={cx('index-actions-title-wrapper')}>
          <p className={cx('index-actions-title')}>
            {intl.formatMessage(messages.indexActionsBlockTitle)}
          </p>
        </div>

        <div className={cx('form-group-container', 'index-actions-group-container')}>
          <div className={cx('form-group-column', 'index-action-description')}>
            {intl.formatMessage(messages.removeIndexDescription)}
          </div>
          <div className={cx('form-group-column')}>
            <GhostButton
              disabled={this.props.indexing_running || !this.props.appInfo.ANALYZER}
              onClick={this.showRemoveIndexModal}
              mobileDisabled
            >
              <span className={cx('index-action-caption')}>
                {intl.formatMessage(messages.removeIndexButtonCaption)}
              </span>
            </GhostButton>
          </div>
        </div>

        <div className={cx('form-group-container', 'index-actions-group-container')}>
          <div className={cx('form-group-column', 'index-action-description')}>
            {intl.formatMessage(messages.generateIndexDescription)}
          </div>
          <div className={cx('form-group-column')}>
            <GhostButton
              disabled={this.props.indexing_running || !this.props.appInfo.ANALYZER}
              onClick={this.showGenerateIndexModal}
              title={
                !this.props.appInfo.ANALYZER
                  ? intl.formatMessage(messages.analyzerDisabledButtonTitle)
                  : ''
              }
              mobileDisabled
            >
              <span className={cx('index-action-caption')}>
                {this.props.indexing_running
                  ? intl.formatMessage(messages.generateIndexButtonProgressCaption)
                  : intl.formatMessage(messages.generateIndexButtonCaption)}
              </span>
            </GhostButton>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
