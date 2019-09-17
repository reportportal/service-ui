import React, { Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { AttributeListField } from 'components/main/attributeList';
import { validate } from 'common/utils';
import { ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { INITIAL_PARAMS_FORM, INITIAL_PARAMS_FIELD_KEY } from '../constants';
import styles from './uploadCustomBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  initializationParamsLabel: {
    id: 'UploadCustomBlock.initializationParamsLabel',
    defaultMessage: 'Initialization parameters',
  },
});

@reduxForm({
  form: INITIAL_PARAMS_FORM,
  initialValues: {
    initializationParams: [],
  },
  validate: ({ initializationParams }) => ({
    initializationParams: !validate.attributesArray(initializationParams),
  }),
})
@injectIntl
export class UploadCustomBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('upload-custom-block')}>
        <ModalField label={formatMessage(messages.initializationParamsLabel)}>
          <FieldProvider name={INITIAL_PARAMS_FIELD_KEY}>
            <AttributeListField />
          </FieldProvider>
        </ModalField>
      </div>
    );
  }
}
