import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { validate } from 'common/utils';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { ModalField } from 'components/main/modal';
import { activeDashboardItemSelector } from 'controllers/dashboard';
import { FIELD_LABEL_WIDTH } from './controls/constants';

const messages = defineMessages({
  widgetNameHint: {
    id: 'CommonWidgetControls.widgetNameHint',
    defaultMessage: 'Widget name should have size from 3 to 128',
  },
  widgetNameExistsHint: {
    id: 'CommonWidgetControls.widgetNameExistsHint',
    defaultMessage: 'This name is already in use',
  },
  nameLabel: {
    id: 'CommonWidgetControls.nameLabel',
    defaultMessage: 'Widget name',
  },
  namePlaceholder: {
    id: 'CommonWidgetControls.namePlaceholder',
    defaultMessage: 'Enter widget name',
  },
  descriptionLabel: {
    id: 'CommonWidgetControls.descriptionLabel',
    defaultMessage: 'Description',
  },
  descriptionPlaceholder: {
    id: 'CommonWidgetControls.descriptionPlaceholder',
    defaultMessage: 'Add some description to widget',
  },
  shareLabel: {
    id: 'CommonWidgetControls.shareLabel',
    defaultMessage: 'Share',
  },
});

const validators = {
  name: (formatMessage, widgets = [], addWidgetMode) => (value) => {
    if (!validate.widgetName(value)) {
      return formatMessage(messages.widgetNameHint);
    } else if (addWidgetMode && widgets.some((widget) => widget.widgetName === value)) {
      return formatMessage(messages.widgetNameExistsHint);
    }
    return false;
  },
};

@connect((state) => ({
  activeDashboardItem: activeDashboardItemSelector(state),
}))
@injectIntl
export class CommonWidgetControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initializeControlsForm: PropTypes.func,
    eventsInfo: PropTypes.object,
    trackEvent: PropTypes.func,
    activeDashboardItem: PropTypes.object.isRequired,
    addWidgetMode: PropTypes.bool,
  };

  static defaultProps = {
    initializeControlsForm: null,
    eventsInfo: {},
    trackEvent: () => {},
    addWidgetMode: false,
  };

  constructor(props) {
    super(props);
    props.initializeControlsForm && props.initializeControlsForm();
  }

  render() {
    const {
      intl: { formatMessage },
      trackEvent,
      eventsInfo,
      activeDashboardItem: { widgets },
      addWidgetMode,
    } = this.props;

    return (
      <Fragment>
        <ModalField label={formatMessage(messages.nameLabel)} labelWidth={FIELD_LABEL_WIDTH}>
          <FieldProvider
            name="name"
            validate={validators.name(formatMessage, widgets, addWidgetMode)}
            placeholder={formatMessage(messages.namePlaceholder)}
          >
            <FieldErrorHint>
              <Input maxLength="128" />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
        <ModalField label={formatMessage(messages.descriptionLabel)} labelWidth={FIELD_LABEL_WIDTH}>
          <FieldProvider
            name="description"
            placeholder={formatMessage(messages.descriptionPlaceholder)}
            onChange={() => trackEvent(eventsInfo.changeDescription)}
          >
            <InputTextArea />
          </FieldProvider>
        </ModalField>
        <ModalField label={formatMessage(messages.shareLabel)} labelWidth={FIELD_LABEL_WIDTH}>
          <FieldProvider
            name="share"
            format={Boolean}
            parse={Boolean}
            onChange={() => trackEvent(eventsInfo.shareWidget)}
          >
            <InputBigSwitcher />
          </FieldProvider>
        </ModalField>
      </Fragment>
    );
  }
}
