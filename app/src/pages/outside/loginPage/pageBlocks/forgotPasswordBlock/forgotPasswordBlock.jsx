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

import { defineMessages } from 'react-intl';
import { PageBlockContainer } from 'pages/outside/common/pageBlockContainer';
import { ForgotPasswordForm } from './forgotPasswordForm';

const messages = defineMessages({
  forgotPass: {
    id: 'ForgotPasswordBlock.forgotPass',
    defaultMessage: 'Forgot password?',
  },
  enterEmail: {
    id: 'ForgotPasswordBlock.enterEmail',
    defaultMessage: 'enter your email to restore',
  },
});

export const ForgotPasswordBlock = () => (
  <PageBlockContainer header={messages.forgotPass} hint={messages.enterEmail}>
    <ForgotPasswordForm />
  </PageBlockContainer>
);
