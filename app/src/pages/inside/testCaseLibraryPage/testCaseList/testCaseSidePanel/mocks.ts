/*
 * Copyright 2025 EPAM Systems
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

export interface StepData {
  id: string;
  instructions: string;
  expectedResult: string;
}

export const mockedStepsData: StepData[] = [
  {
    id: '1',
    instructions: 'Open the web application login page in a supported browser',
    expectedResult: 'The login page loads correctly with fields for username and password visible',
  },
  {
    id: '2',
    instructions: 'Enter a valid username in the username field',
    expectedResult: 'The username appears in the field as entered, with no input errors',
  },
  {
    id: '3',
    instructions: 'Enter a valid password in the password field',
    expectedResult: '',
  },
  {
    id: '4',
    instructions: "Click the 'Login' button",
    expectedResult:
      'The system processes the input and navigates to the user dashboard if the credentials are correct',
  },
  {
    id: '5',
    instructions: '',
    expectedResult:
      'The user dashboard loads and displays the correct personalized information without errors the basic functionality',
  },
];
