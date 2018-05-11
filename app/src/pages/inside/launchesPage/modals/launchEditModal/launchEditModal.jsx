import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import { ModalLayout, withModal, ModalField, ModalContentHeading } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MarkdownEditor } from 'components/main/markdown';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { activeProjectSelector } from 'controllers/user';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import styles from './launchEditModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  tags: {
    id: 'EditLaunchDialog.tagsLabel',
    defaultMessage: 'Tags',
  },
  tagsPlaceholder: {
    id: 'EditLaunchDialog.tagPlaceholder',
    defaultMessage: 'Enter tag name',
  },
  tagsHint: {
    id: 'EditLaunchDialog.tagsHint',
    defaultMessage: 'Please enter 1 or more characters',
  },
  descriptionPlaceholder: {
    id: 'EditLaunchDialog.descriptionPlaceholder',
    defaultMessage: 'Enter launch description',
  },
  editLaunchHeader: {
    id: 'EditLaunchDialog.editLaunchHeader',
    defaultMessage: 'Edit launch',
  },
  contentTitle: {
    id: 'EditLaunchDialog.contentTitle',
    defaultMessage: 'Launch details',
  },
  warningMessage: {
    id: 'EditLaunchDialog.warningMessage',
    defaultMessage:
      'Change of description and tags can affect your filtering results, widgets, trends',
  },
});

@withModal('launchEditModal')
@injectIntl
@reduxForm({
  form: 'launchEditForm',
})
@connect((state) => ({
  tagsSearchUrl: URLS.launchTagsSearch(activeProjectSelector(state)),
}))
export class FilterEditModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      launch: PropTypes.object,
      onEdit: PropTypes.func,
    }).isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    tagsSearchUrl: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
  };
  componentDidMount() {
    this.props.initialize(this.props.data.launch);
  }
  saveLaunchAndCloseModal = (closeModal) => (launch) => {
    this.props.data.onEdit(launch);
    closeModal();
  };
  formatTags = (tags) =>
    tags && !!tags.length ? tags.map((tag) => ({ value: tag, label: tag })) : [];
  parseTags = (options) => options.map((option) => option.value);

  render() {
    const { intl, handleSubmit, tagsSearchUrl, data } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: (closeModal) => {
        handleSubmit(this.saveLaunchAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    return (
      <ModalLayout
        title={intl.formatMessage(messages.editLaunchHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
        warningMessage={intl.formatMessage(messages.warningMessage)}
      >
        <form>
          <ModalField>
            <ModalContentHeading text={intl.formatMessage(messages.contentTitle)} />
          </ModalField>
          <ModalField>
            <div className={cx('launch-name')}>{`${data.launch.name} #${data.launch.number}`}</div>
          </ModalField>
          <ModalField label={intl.formatMessage(messages.tags)}>
            <FieldProvider name="tags" format={this.formatTags} parse={this.parseTags}>
              <FieldErrorHint>
                <InputTagsSearch
                  placeholder={intl.formatMessage(messages.tagsPlaceholder)}
                  focusPlaceholder={intl.formatMessage(messages.tagsHint)}
                  minLength={1}
                  async
                  uri={tagsSearchUrl}
                  makeOptions={this.formatTags}
                  creatable
                  showNewLabel
                  multi
                  removeSelected
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField>
            <FieldProvider name="description">
              <MarkdownEditor placeholder={intl.formatMessage(messages.descriptionPlaceholder)} />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
