/*
 * Copyright 2022 EPAM Systems
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

import { defineMessages } from 'react-intl';
import {
  AUTOMATION_BUG,
  NO_DEFECT,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';

export const defectTypesLocalization = defineMessages({
  [PRODUCT_BUG]: {
    id: 'DefectTypes.PRODUCT_BUG',
    defaultMessage: 'Product bug',
  },
  [AUTOMATION_BUG]: {
    id: 'DefectTypes.AUTOMATION_BUG',
    defaultMessage: 'Automation bug',
  },
  [SYSTEM_ISSUE]: {
    id: 'DefectTypes.SYSTEM_ISSUE',
    defaultMessage: 'System issue',
  },
  [TO_INVESTIGATE]: {
    id: 'DefectTypes.TO_INVESTIGATE',
    defaultMessage: 'To investigate',
  },
  [NO_DEFECT]: {
    id: 'DefectTypes.NO_DEFECT',
    defaultMessage: 'No defect',
  },

  PRODUCT_BUG_TOTAL: {
    id: 'DefectTypes.PRODUCT_BUG_TOTAL',
    defaultMessage: 'Product bugs group',
  },
  AUTOMATION_BUG_TOTAL: {
    id: 'DefectTypes.AUTOMATION_BUG_TOTAL',
    defaultMessage: 'Automation bugs group',
  },
  SYSTEM_ISSUE_TOTAL: {
    id: 'DefectTypes.SYSTEM_ISSUE_TOTAL',
    defaultMessage: 'System issues group',
  },
  TO_INVESTIGATE_TOTAL: {
    id: 'DefectTypes.TO_INVESTIGATE_TOTAL',
    defaultMessage: 'To investigate group',
  },
  NO_DEFECT_TOTAL: {
    id: 'DefectTypes.NO_DEFECT_TOTAL',
    defaultMessage: 'No defects group',
  },
  Defect_Type_AB001: {
    id: 'DefectTypes.Defect_Type_AB001',
    defaultMessage: 'Automation bug',
  },
  Defect_Type_PB001: {
    id: 'DefectTypes.Defect_Type_PB001',
    defaultMessage: 'Product bug',
  },
  Defect_Type_SI001: {
    id: 'DefectTypes.Defect_Type_SI001',
    defaultMessage: 'System issue',
  },
  Defect_Type_TI001: {
    id: 'DefectTypes.Defect_Type_TI001',
    defaultMessage: 'To investigate',
  },
  Defect_Type_ND001: {
    id: 'DefectTypes.Defect_Type_ND001',
    defaultMessage: 'No defect',
  },
});
