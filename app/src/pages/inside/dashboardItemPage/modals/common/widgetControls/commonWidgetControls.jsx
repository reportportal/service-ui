import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { validate, isEmptyObject } from 'common/utils';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { ModalField } from 'components/main/modal';
import { FIELD_LABEL_WIDTH } from './controls/constants';
import { DashboardControl } from './controls/dashboardControl';

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
    defaultMessage: 'Enter widget description',
  },
  shareLabel: {
    id: 'CommonWidgetControls.shareLabel',
    defaultMessage: 'Share',
  },
});

const validators = {
  name: (formatMessage, widgets = [], widgetId) => (value) => {
    if (!validate.widgetName(value)) {
      return formatMessage(messages.widgetNameHint);
    } else if (
      widgets.some((widget) => widget.widgetName === value && widget.widgetId !== widgetId)
    ) {
      return formatMessage(messages.widgetNameExistsHint);
    }
    return false;
  },
};

@injectIntl
export class CommonWidgetControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initializeControlsForm: PropTypes.func,
    widgetId: PropTypes.number,
    eventsInfo: PropTypes.object,
    trackEvent: PropTypes.func,
    dashboards: PropTypes.arrayOf(PropTypes.object),
    activeDashboard: PropTypes.object,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    initializeControlsForm: null,
    widgetId: null,
    eventsInfo: {},
    trackEvent: () => {},
    dashboards: [],
    activeDashboard: {},
    onChange: () => {},
    intl: {},
  };

  constructor(props) {
    super(props);
    props.initializeControlsForm && props.initializeControlsForm();
  }

  isShowDashboardsList = () => {
    const { activeDashboard, widgetId } = this.props;
    return activeDashboard && isEmptyObject(activeDashboard) && !widgetId;
  };

  render() {
    const {
      intl: { formatMessage },
      widgetId,
      trackEvent,
      eventsInfo,
      dashboards,
      onChange,
      activeDashboard: { widgets = [] },
    } = this.props;

    return (
      <Fragment>
        <ModalField label={formatMessage(messages.nameLabel)} labelWidth={FIELD_LABEL_WIDTH}>
          <FieldProvider
            name="name"
            validate={validators.name(formatMessage, widgets, widgetId)}
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
        {this.isShowDashboardsList() && (
          <FieldProvider name="selectedDashboard" dashboards={dashboards} onChange={onChange}>
            <DashboardControl />
          </FieldProvider>
        )}
      </Fragment>
    );
  }
}
