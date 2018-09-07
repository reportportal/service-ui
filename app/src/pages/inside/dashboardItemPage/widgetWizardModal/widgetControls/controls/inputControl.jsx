import PropTypes from 'prop-types';
import { ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FIELD_LABEL_WIDTH } from './constants';

export const InputControl = ({ fieldLabel, inputWidth, tip, ...rest }) => (
  <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH} tip={tip}>
    <div style={{ width: inputWidth || 'unset' }}>
      <FieldErrorHint {...rest}>
        <Input />
      </FieldErrorHint>
    </div>
  </ModalField>
);
InputControl.propTypes = {
  fieldLabel: PropTypes.string,
  tip: PropTypes.string,
  inputWidth: PropTypes.number,
};
InputControl.defaultProps = {
  fieldLabel: '',
  tip: '',
  inputWidth: null,
};
