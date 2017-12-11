/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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
import { Container } from '@cerebral/react';
import { Controller } from 'cerebral';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import PropTypes from 'prop-types';
import Dropdown from './inputDropdown';
import README from './README.md';

const getState = ({ multiple, selectAll, disabled, isFocus }) => Controller({
  state: {
    form: {
      field: {
        value: multiple ? 'AI,PB,ND' : 'SI',
        displayedValue: multiple ? 'Auto Bug, Product Bug, No Defect' : 'System Issue',
        isFocus,
        disabled,
        multiple,
        selectAll,
        options: ['AI', 'PB', 'SI', 'ND', 'TI'],
        optionsById: {
          AI: {
            text: 'Auto Bug',
            disabled: false,
            active: true,
          },
          PB: {
            text: 'Product Bug',
            disabled: true,
            active: multiple,
          },
          SI: {
            text: 'System Issue',
            disabled: true,
            active: false,
          },
          ND: {
            text: 'No Defect',
            disabled: false,
            active: multiple,
          },
          TI: {
            text: 'To invest',
            disabled: false,
            active: false,
          },
        },
      },
    },
  },
});

getState.propTypes = {
  multiple: PropTypes.bool,
  selectAll: PropTypes.bool,
  disabled: PropTypes.bool,
  isFocus: PropTypes.bool,
};

getState.defaultProps = {
  multiple: false,
  selectAll: false,
  disabled: false,
  isFocus: false,
};

storiesOf('Components/Inputs/InputDropdown', module)
  .addDecorator(host({
    title: 'InputDropdown component',
    align: 'center top',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#ffffff',
    height: 32,
    width: 300,
  }))
  .addDecorator(withReadme(README))
  // Single dropdown
  .add('Single, default state', () => (
    <Container controller={getState({})} >
      <Dropdown formPath={'form'} fieldName={'field'} />
    </Container>
  ))
  .add('Single, disabled', () => (
    <Container controller={getState({ disabled: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} />
    </Container>
  ))
  .add('Single, with actions', () => (
    <Container controller={getState({})} >
      <Dropdown formPath={'form'} fieldName={'field'} onFocus={action('focused')} />
    </Container>
  ))
  .add('Single, focused', () => (
    <Container controller={getState({ isFocus: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} />
    </Container>
  ))
  .add('Single, focused, with actions', () => (
    <Container controller={getState({ isFocus: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} onBlur={action('blured')} />
    </Container>
  ))

  // Multiple dropdown
  .add('Multiple, default state', () => (
    <Container controller={getState({ multiple: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} />
    </Container>
  ))
  .add('Multiple, disabled', () => (
    <Container controller={getState({ multiple: true, disabled: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} />
    </Container>
  ))
  .add('Multiple, with actions', () => (
    <Container controller={getState({ multiple: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} onFocus={action('focused')} />
    </Container>
  ))
  .add('Multiple, focused', () => (
    <Container controller={getState({ multiple: true, isFocus: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} />
    </Container>
  ))
  .add('Multiple, select all, focused', () => (
    <Container controller={getState({ multiple: true, selectAll: true, isFocus: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} />
    </Container>
  ))
  .add('Multiple, focused, with actions', () => (
    <Container controller={getState({ multiple: true, isFocus: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} onBlur={action('blured')} />
    </Container>
  ))
  .add('Multiple, focused, select all, with actions', () => (
    <Container controller={getState({ multiple: true, selectAll: true, isFocus: true })} >
      <Dropdown formPath={'form'} fieldName={'field'} onBlur={action('blured')} />
    </Container>
  ));
