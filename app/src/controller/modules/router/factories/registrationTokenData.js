/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { state } from 'cerebral/tags';
import { set, when } from 'cerebral/operators';

import getRegistrationTokenInfo from '../../user/actions/getRegistrationTokenInfo';
import setRegistrationTokenInfo from '../../user/actions/setRegistrationTokenInfo';
import setEmailField from '../../user/modules/registrationForm/actions/setEmailField';

const registrationTokenData = continueSequence => [
  when(state`user.registrationTokenData.isReady`), {
    true: continueSequence,
    false: [
      set(state`user.registrationTokenData.isLoad`, true),
      getRegistrationTokenInfo,
      set(state`user.registrationTokenData.isLoad`, false),
      setRegistrationTokenInfo,
      set(state`user.registrationTokenData.isReady`, true),
      when(state`user.registrationTokenData.isTokenActive`), {
        true: [
          setEmailField,
        ],
        false: [
          set(state`user.registrationTokenData.isReady`, true),
        ],
      },
      continueSequence,
    ],
  },
];

export default registrationTokenData;
