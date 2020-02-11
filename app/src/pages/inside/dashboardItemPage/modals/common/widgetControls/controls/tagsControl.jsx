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
import { ModalField } from 'components/main/modal';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { AsyncMultipleAutocomplete } from 'components/inputs/autocompletes/asyncMultipleAutocomplete';
import { FIELD_LABEL_WIDTH } from './constants';

export const TagsControl = ({ fieldLabel, inputWidth, multi, ...rest }) => (
  <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH}>
    <div style={{ width: inputWidth || 'unset' }}>
      {multi ? (
        <AsyncMultipleAutocomplete showDynamicSearchPrompt {...rest} />
      ) : (
        <AsyncAutocomplete showDynamicSearchPrompt {...rest} />
      )}
    </div>
  </ModalField>
);

TagsControl.propTypes = {
  fieldLabel: PropTypes.string,
  inputWidth: PropTypes.number,
  multi: PropTypes.bool,
};

TagsControl.defaultProps = {
  fieldLabel: '',
  inputWidth: null,
  multi: false,
};
