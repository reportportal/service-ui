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

export const state = {
  project: {
    info: {
      configuration: {
        subTypes: {
          TO_INVESTIGATE: [
            {
              locator: 'TI001',
              typeRef: 'TO_INVESTIGATE',
              longName: 'To Investigate',
              shortName: 'TI',
              color: '#ffb743',
            },
          ],
          NO_DEFECT: [
            {
              locator: 'ND001',
              typeRef: 'NO_DEFECT',
              longName: 'No Defect',
              shortName: 'ND',
              color: '#777777',
            },
          ],
          AUTOMATION_BUG: [
            {
              locator: 'AB001',
              typeRef: 'AUTOMATION_BUG',
              longName: 'Automation Bug',
              shortName: 'AB',
              color: '#f7d63e',
            },
            {
              locator: 'ab_1h7inqu51mgys',
              typeRef: 'AUTOMATION_BUG',
              longName: 'NewAB',
              shortName: 'NAB',
              color: '#e6ee9c',
            },
            {
              locator: 'ab_qecoiezu7sc8',
              typeRef: 'AUTOMATION_BUG',
              longName: 'New2AB',
              shortName: 'NAB2',
              color: '#ffcc80',
            },
            {
              locator: 'ab_1k1tyymqtlp46',
              typeRef: 'AUTOMATION_BUG',
              longName: 'New3AB',
              shortName: 'NAB3',
              color: '#ffab91',
            },
          ],
          PRODUCT_BUG: [
            {
              locator: 'PB001',
              typeRef: 'PRODUCT_BUG',
              longName: 'Product Bug',
              shortName: 'PB',
              color: '#ec3900',
            },
          ],
          SYSTEM_ISSUE: [
            {
              locator: 'SI001',
              typeRef: 'SYSTEM_ISSUE',
              longName: 'System Issue',
              shortName: 'SI',
              color: '#0274d1',
            },
          ],
        },
      },
    },
  },
};
