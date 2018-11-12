import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal, ModalLayout } from 'components/main/modal';
import { LogMessage } from 'components/main/logMessage';
import { fetchAPI } from 'common/utils/fetch';
import { tokenSelector } from 'controllers/auth';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { MarkdownViewer } from 'components/main/markdown';
import { getDuration } from 'common/utils/timeDateUtils';
import { AccordionContainer } from 'components/main/accordionContainer';
import { TestParameters } from './testParameters';
import { LabeledSection } from './labeledSection';
import styles from './testItemDetailsModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  modalTitle: {
    id: 'TestItemDetailsModal.title',
    defaultMessage: 'Test item details',
  },
  testCaseId: {
    id: 'TestItemDetailsModal.testCaseId',
    defaultMessage: 'Unique test case id:',
  },
  duration: {
    id: 'TestItemDetailsModal.duration',
    defaultMessage: 'Duration:',
  },
  tags: {
    id: 'TestItemDetailsModal.tags',
    defaultMessage: 'Tags:',
  },
  description: {
    id: 'TestItemDetailsModal.description',
    defaultMessage: 'Description:',
  },
  stacktrace: {
    id: 'TestItemDetailsModal.stacktrace',
    defaultMessage: 'Stacktrace:',
  },
});

@withModal('testItemDetails')
@connect((state) => ({
  activeProject: activeProjectSelector(state),
  token: tokenSelector(state),
}))
@injectIntl
export class TestItemDetailsModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object,
    }).isRequired,
    activeProject: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
  };

  state = {
    logItem: null,
    loading: true,
  };

  componentDidMount() {
    const {
      activeProject,
      data: { item },
    } = this.props;
    fetchAPI(URLS.logItem(activeProject, item.id, 'ERROR'), this.props.token)
      .then((data) => data.content[0])
      .then((logItem) => this.setState({ logItem, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  render() {
    const {
      intl,
      data: { item },
    } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.OK),
      onClick: (closeModal) => closeModal(),
    };
    return (
      <ModalLayout title={intl.formatMessage(messages.modalTitle)} okButton={okButton}>
        <div className={cx('name')}>{item.name}</div>
        <div className={cx('row')}>
          <LabeledSection label={intl.formatMessage(messages.testCaseId)}>
            {item.uniqueId}
          </LabeledSection>
        </div>
        <div className={cx('row')}>
          <LabeledSection label={intl.formatMessage(messages.duration)}>
            {getDuration(item.start_time, item.end_time)}
          </LabeledSection>
          {item.tags &&
            item.tags.length > 0 && (
              <LabeledSection className={cx('tags')} label={intl.formatMessage(messages.tags)}>
                {item.tags.map((tag) => (
                  <span key={tag} className={cx('tag')}>
                    {tag}
                  </span>
                ))}
              </LabeledSection>
            )}
        </div>
        {item.parameters && (
          <div className={cx('row')}>
            <TestParameters parameters={item.parameters} />
          </div>
        )}
        {item.description && (
          <div className={cx('row')}>
            <AccordionContainer maxHeight={170}>
              {({ setupRef, className }) => (
                <div ref={setupRef} className={className}>
                  <LabeledSection label={intl.formatMessage(messages.description)} vertical>
                    <MarkdownViewer value={item.description} />
                  </LabeledSection>
                </div>
              )}
            </AccordionContainer>
          </div>
        )}
        {this.state.loading && (
          <div className={cx('row')}>
            <SpinningPreloader />
          </div>
        )}
        {this.state.logItem && (
          <div className={cx('row')}>
            <AccordionContainer maxHeight={170}>
              {({ setupRef, className }) => (
                <div className={className} ref={setupRef}>
                  <LabeledSection label={intl.formatMessage(messages.stacktrace)}>
                    <LogMessage item={this.state.logItem} />
                  </LabeledSection>
                </div>
              )}
            </AccordionContainer>
          </div>
        )}
      </ModalLayout>
    );
  }
}
