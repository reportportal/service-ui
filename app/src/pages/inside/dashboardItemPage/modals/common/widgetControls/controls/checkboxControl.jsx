/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { useTracking } from 'react-tracking';
import { ModalField } from 'components/main/modal';
import { FIELD_LABEL_WIDTH } from './constants';

export function CheckboxControl({ fieldLabel, text, eventInfo, onChange, ...rest }) {
  const { trackEvent } = useTracking();
  const onChangeCheckbox = (e) => {
    if (eventInfo.onChangeCheckboxEvent) {
      trackEvent(eventInfo.onChangeCheckboxEvent(e.target.checked));
    }
    onChange(e);
  };

  return (
    <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH}>
      <InputCheckbox {...rest} onChange={onChangeCheckbox}>
        {text}
      </InputCheckbox>
    </ModalField>
  );
}

CheckboxControl.propTypes = {
  fieldLabel: PropTypes.string,
  text: PropTypes.string,
  eventInfo: PropTypes.object,
  onChange: PropTypes.func,
};
CheckboxControl.defaultProps = {
  fieldLabel: '',
  text: 'null',
  eventInfo: {},
  onChange: () => {},
};
