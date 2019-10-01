import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Parser from 'html-react-parser';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import { fetch, validate } from 'common/utils';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
  userIdSelector,
} from 'controllers/user';
import { formatItemName } from 'controllers/testItem';
import { SectionHeader } from 'components/main/sectionHeader';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MarkdownEditor, MarkdownViewer } from 'components/main/markdown';
import { AttributeListField } from 'components/main/attributeList';
import { AccordionContainer } from 'components/main/accordionContainer';
import { SUITES_PAGE_EVENTS } from 'components/main/analytics/events/suitesPageEvents';
import { canEditLaunch } from 'common/utils/permissions';
import styles from './editItemModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  attributesLabel: {
    id: 'EditItemModal.attributesLabel',
    defaultMessage: 'Attributes',
  },
  descriptionPlaceholder: {
    id: 'EditItemModal.descriptionPlaceholder',
    defaultMessage: 'Enter {type} description',
  },
  modalHeader: {
    id: 'EditItemModal.modalHeader',
    defaultMessage: 'Edit {type}',
  },
  launch: {
    id: 'EditItemModal.launch',
    defaultMessage: 'launch',
  },
  item: {
    id: 'EditItemModal.item',
    defaultMessage: 'item',
  },
  contentTitle: {
    id: 'EditItemModal.contentTitle',
    defaultMessage: '{type} details',
  },
  launchUpdateSuccess: {
    id: 'EditItemModal.launchUpdateSuccess',
    defaultMessage: 'Launch has been updated',
  },
  itemUpdateSuccess: {
    id: 'EditItemModal.itemUpdateSuccess',
    defaultMessage: 'Completed successfully!',
  },
  launchWarning: {
    id: 'EditItemModal.launchWarning',
    defaultMessage:
      'Change of description and attributes can affect your filtering results, widgets, trends',
  },
  codeRef: {
    id: 'TestItemDetailsModal.codeRef',
    defaultMessage: 'Code reference:',
  },
  description: {
    id: 'TestItemDetailsModal.description',
    defaultMessage: 'Description:',
  },
});

@withModal('editItemModal')
@injectIntl
@track()
@reduxForm({
  form: 'editItemForm',
  validate: ({ attributes }) => ({
    attributes: !validate.attributesArray(attributes),
  }),
})
@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
    userAccountRole: userAccountRoleSelector(state),
    userProjectRole: activeProjectRoleSelector(state),
    userId: userIdSelector(state),
  }),
  {
    showNotification,
  },
)
export class EditItemModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object,
      parentLaunch: PropTypes.object,
      type: PropTypes.string,
      fetchFunc: PropTypes.func,
    }).isRequired,
    userProjectRole: PropTypes.string,
    userAccountRole: PropTypes.string,
    userId: PropTypes.string,
    initialize: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    currentProject: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    userProjectRole: '',
    userAccountRole: '',
    userId: '',
  };

  componentDidMount() {
    this.props.initialize({
      description: this.props.data.item.description || '',
      attributes: this.props.data.item.attributes || [],
    });
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  getAttributeKeyURLCreator = () => {
    const {
      data: { type },
    } = this.props;
    return type === LAUNCH_ITEM_TYPES.launch
      ? URLS.launchAttributeKeysSearch
      : this.testItemAttributeKeyURLCreator;
  };

  getAttributeValueURLCreator = () => {
    const {
      data: { type },
    } = this.props;
    return type === LAUNCH_ITEM_TYPES.launch
      ? URLS.launchAttributeValuesSearch
      : this.testItemAttributeValueURLCreator;
  };

  updateItemAndCloseModal = (closeModal) => (formData, dispatch, props) => {
    if (props.data.item.description !== formData.description) {
      this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.EDIT_ITEM_DESCRIPTION);
    }
    this.props.dirty && this.updateItem(formData);
    closeModal();
  };

  updateItem = (data) => {
    const {
      intl: { formatMessage },
      currentProject,
      data: { item, type, fetchFunc },
    } = this.props;

    fetch(URLS.launchesItemsUpdate(currentProject, item.id, type), {
      method: 'put',
      data,
    }).then(() => {
      this.props.showNotification({
        message: formatMessage(messages[`${type}UpdateSuccess`]),
        type: NOTIFICATION_TYPES.SUCCESS,
      });
      fetchFunc();
    });
  };

  testItemAttributeKeyURLCreator = (projectId) => {
    const {
      data: { item },
    } = this.props;
    return URLS.testItemAttributeKeysSearch(projectId, item.launchId || item.id);
  };

  testItemAttributeValueURLCreator = (projectId, key) => {
    const {
      data: { item },
    } = this.props;
    return URLS.testItemAttributeValuesSearch(projectId, item.launchId || item.id, key);
  };

  render() {
    const {
      intl: { formatMessage },
      data: { item, parentLaunch, type },
      handleSubmit,
      userAccountRole,
      userProjectRole,
      userId,
      tracking,
    } = this.props;
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: (closeModal) => {
        tracking.trackEvent(SUITES_PAGE_EVENTS.SAVE_BTN_EDIT_ITEM_MODAL);
        handleSubmit(this.updateItemAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: SUITES_PAGE_EVENTS.CANCEL_BTN_EDIT_ITEM_MODAL,
    };

    const editable = canEditLaunch(
      userAccountRole,
      userProjectRole,
      item.owner ? userId === item.owner : userId === parentLaunch.owner,
    );

    return (
      <ModalLayout
        title={formatMessage(messages.modalHeader, { type: formatMessage(messages[type]) })}
        okButton={editable ? okButton : undefined}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={SUITES_PAGE_EVENTS.CLOSE_ICON_EDIT_ITEM_MODAL}
        warningMessage={
          type === LAUNCH_ITEM_TYPES.launch && editable && formatMessage(messages.launchWarning)
        }
      >
        <form>
          <ModalField>
            <SectionHeader
              text={formatMessage(messages.contentTitle, {
                type: formatMessage(messages[type]),
              })}
            />
          </ModalField>
          <ModalField>
            <div title={item.name} className={cx('item-name')}>
              {formatItemName(item.name)}
              {type === LAUNCH_ITEM_TYPES.launch && ` #${item.number}`}
            </div>
          </ModalField>
          <ModalField label={formatMessage(messages.attributesLabel)}>
            <FieldProvider name="attributes">
              <AttributeListField
                keyURLCreator={this.getAttributeKeyURLCreator()}
                valueURLCreator={this.getAttributeValueURLCreator()}
                disabled={!editable}
              />
            </FieldProvider>
          </ModalField>
          {item.codeRef && (
            <ModalField label={formatMessage(messages.codeRef)}>
              <div className={cx('code-ref')} title={item.codeRef}>
                {item.codeRef}
                <CopyToClipboard text={item.codeRef} className={cx('copy')}>
                  {Parser(IconDuplicate)}
                </CopyToClipboard>
              </div>
            </ModalField>
          )}
          {editable ? (
            <ModalField>
              <FieldProvider name="description">
                <MarkdownEditor
                  placeholder={formatMessage(messages.descriptionPlaceholder, {
                    type: formatMessage(messages[type]),
                  })}
                />
              </FieldProvider>
            </ModalField>
          ) : (
            <Fragment>
              <div className={cx('label')}>{formatMessage(messages.description)}</div>
              <ModalField>
                <AccordionContainer maxHeight={170}>
                  {({ setupRef, className }) => (
                    <div ref={setupRef} className={className}>
                      <MarkdownViewer value={item.description} />
                    </div>
                  )}
                </AccordionContainer>
              </ModalField>
            </Fragment>
          )}
        </form>
      </ModalLayout>
    );
  }
}
