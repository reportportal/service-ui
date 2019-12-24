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

import React from 'react';
import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { action } from '@storybook/addon-actions';

import { ModalLayout } from './modalLayout';
import README from './README.md';

const okButton = {
  text: 'Submit',
  danger: false,
  onClick: action('submit'),
};

const cancelButton = {
  text: 'Cancel',
};

const dangerOkButton = {
  text: 'Submit',
  danger: true,
  onClick: action('danger submit'),
};

storiesOf('Components/Main/ModalLayout', module)
  .addDecorator(
    host({
      title: 'Modal layout component',
      align: 'top middle',
      backdrop: '#ffffff',
      background: '#E9E9E9',
      height: 'auto',
      width: '100%',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <ModalLayout />)
  .add('with buttons', () => <ModalLayout okButton={okButton} cancelButton={cancelButton} />)
  .add('with danger okButton', () => (
    <ModalLayout okButton={dangerOkButton} cancelButton={cancelButton} />
  ))
  .add('with warningMessage', () => (
    <ModalLayout
      warningMessage="You are not launch owner!"
      okButton={okButton}
      cancelButton={cancelButton}
    />
  ))
  .add('with header title', () => (
    <ModalLayout
      title="Storybook modal"
      warningMessage="You are not launch owner!"
      okButton={okButton}
      cancelButton={cancelButton}
    />
  ))
  .add('with children', () => (
    <ModalLayout
      title="Storybook modal"
      warningMessage="You are not launch owner!"
      okButton={okButton}
      cancelButton={cancelButton}
    >
      <p>
        <span>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus ad animi aperiam
          accusamus adipisci alias aspernatur delectus dolores eius enim, eum id itaque, labore
          laudantium magni minima minus necessitatibus perferendis quae quas ratione reiciendis
          temporibus ut vero, voluptate.
        </span>
        <span>
          Ducimus eius eligendi incidunt iusto perspiciatis placeat saepe. Assumenda dolor iusto
          maiores sequi voluptates. A, cupiditate esse eveniet id illum ipsam nam neque nostrum
          nulla pariatur praesentium quis sunt ut.
        </span>
      </p>
    </ModalLayout>
  ));
