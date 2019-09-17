import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { formValueSelector } from 'redux-form';
import { showModalAction } from 'controllers/modal';
import { fetchPluginsAction } from 'controllers/plugins';
import { GhostButton } from 'components/buttons/ghostButton';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import ImportIcon from 'common/img/import-inline.svg';
import { URLS } from 'common/urls';
import { MODAL_TYPE_UPLOAD_PLUGIN } from 'pages/common/modals/importModal/constants';
import { UPLOAD, INITIAL_PARAMS_FORM, INITIAL_PARAMS_FIELD_KEY } from './constants';
import { UploadCustomBlock } from './uploadCustomBlock';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);
const initialParamsFormSelector = formValueSelector(INITIAL_PARAMS_FORM);

const messages = defineMessages({
  [UPLOAD]: {
    id: 'PluginsPage.upload',
    defaultMessage: 'Upload',
  },
  modalTitle: {
    id: 'PluginsPage.modalTitle',
    defaultMessage: 'Upload plugin',
  },
  uploadButton: {
    id: 'PluginsPage.uploadButton',
    defaultMessage: 'Upload',
  },
  uploadTip: {
    id: 'PluginsPage.tip',
    defaultMessage:
      'Drop only <b>.jar</b> file under 128 MB to upload or <span>click</span> to add it',
  },
  incorrectFileSize: {
    id: 'PluginsPage.incorrectFileSize',
    defaultMessage: 'File size is more than 128 Mb',
  },
  incorrectFileVersion: {
    id: 'PluginsPage.incorrectFileVersion',
    defaultMessage: 'Plugin version should be specified',
  },
  incorrectFileManifest: {
    id: 'PluginsPage.incorrectFileManifest',
    defaultMessage: 'Cannot find the manifest path',
  },
});

@connect(
  (state) => ({
    initialParamsValues: initialParamsFormSelector(state, INITIAL_PARAMS_FIELD_KEY),
  }),
  {
    showModalAction,
    fetchPluginsAction,
  },
)
@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showModalAction: PropTypes.func.isRequired,
    fetchPluginsAction: PropTypes.func.isRequired,
    initialParamsValues: PropTypes.array,
  };
  static defaultProps = {
    initialParamsValues: [],
  };

  prepareInitialParamsValue = (initialParamsValues) =>
    JSON.stringify(
      initialParamsValues.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}),
    );

  appendInitialParamsValue = (formData) => {
    const { initialParamsValues } = this.props;

    if (initialParamsValues && initialParamsValues.length) {
      formData.append(
        INITIAL_PARAMS_FIELD_KEY,
        this.prepareInitialParamsValue(initialParamsValues),
      );
    }
    return formData;
  };

  openUploadModal = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'importModal',
      data: {
        type: MODAL_TYPE_UPLOAD_PLUGIN,
        onImport: this.props.fetchPluginsAction,
        title: formatMessage(messages.modalTitle),
        importButton: formatMessage(messages.uploadButton),
        tip: formatMessage(messages.uploadTip),
        incorrectFileSize: formatMessage(messages.incorrectFileSize),
        url: URLS.plugin(),
        customBlock: <UploadCustomBlock />,
        appendCustomBlockValue: this.appendInitialParamsValue,
        singleImport: true,
        eventsInfo: {
          okBtn: PLUGINS_PAGE_EVENTS.OK_BTN_UPLOAD_MODAL,
          cancelBtn: PLUGINS_PAGE_EVENTS.CANCEL_BTN_UPLOAD_MODAL,
          closeIcon: PLUGINS_PAGE_EVENTS.CLOSE_ICON_UPLOAD_MODAL,
        },
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const ACTION_BUTTONS = [
      {
        key: UPLOAD,
        icon: ImportIcon,
        onClick: this.openUploadModal,
      },
    ];
    return (
      <div className={cx('action-buttons')}>
        {ACTION_BUTTONS.map(({ key, icon, onClick }) => (
          <div className={cx('action-button')} key={key}>
            <GhostButton icon={icon} onClick={onClick}>
              {formatMessage(messages[key])}
            </GhostButton>
          </div>
        ))}
      </div>
    );
  }
}
