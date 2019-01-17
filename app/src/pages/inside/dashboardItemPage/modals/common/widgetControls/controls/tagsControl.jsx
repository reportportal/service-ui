import PropTypes from 'prop-types';
import { ModalField } from 'components/main/modal';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FIELD_LABEL_WIDTH } from './constants';

export const TagsControl = ({ fieldLabel, inputWidth, ...rest }) => (
  <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH}>
    <div style={{ width: inputWidth || 'unset' }}>
      <FieldErrorHint hintType={'top'} {...rest}>
        <InputTagsSearch />
      </FieldErrorHint>
    </div>
  </ModalField>
);
TagsControl.propTypes = {
  fieldLabel: PropTypes.string,
  inputWidth: PropTypes.number,
};
TagsControl.defaultProps = {
  fieldLabel: '',
  inputWidth: null,
};
