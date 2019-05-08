import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { validate } from 'common/utils';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { SectionHeader } from 'components/main/sectionHeader';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { messages } from './../messages';

const LABEL_WIDTH = 105;

@withModal('addProjectModal')
@injectIntl
@reduxForm({
  form: 'addProjectForm',
  validate: ({ projectName }) => ({
    projectName: (!projectName || !validate.projectName(projectName)) && 'projectNameLengthHint',
  }),
})
@track()
export class AddProjectModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    tracking: PropTypes.shape({
      getTrackingData: PropTypes.func,
    }).isRequired,
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func,
    change: PropTypes.func,
  };

  static defaultProps = {
    data: {},
    handleSubmit: () => {},
    change: () => {},
  };

  render() {
    const { onSubmit } = this.props.data;
    const { intl, handleSubmit } = this.props;
    return (
      <ModalLayout
        title={intl.formatMessage(messages.addProject)}
        okButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.ADD),
          danger: false,
          onClick: () => {
            handleSubmit((values) => {
              onSubmit(values);
            })();
          },
        }}
        cancelButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        }}
      >
        <form>
          <ModalField>
            <SectionHeader text={intl.formatMessage(messages.addProjectTitle)} />
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.projectNameLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="projectName" type="text">
              <FieldErrorHint>
                <Input maxLength="256" />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
