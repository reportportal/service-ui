/*
 * Copyright 2020 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import Parser from 'html-react-parser';
import { reduxForm, formValueSelector } from 'redux-form';
import Link from 'redux-first-router-link';
import { GhostButton } from 'components/buttons/ghostButton';
import { BigButton } from 'components/buttons/bigButton';
import { NavigationTabs } from 'components/main/navigationTabs';
import { NoCasesBlock } from 'components/main/noCasesBlock';
import { ItemList } from 'components/main/itemList';
import { ModalLayout, ModalField } from 'components/main/modal';
import { showModalAction } from 'controllers/modal';
import { fetch } from 'common/utils/fetch';
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  isAdminSelector,
} from 'controllers/user';
import {
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
  PROJECT_SETTINGS_TAB_PAGE,
  pluginRouteSelector,
} from 'controllers/pages';
import PlusIcon from 'common/img/plus-button-inline.svg';
import RemoveIcon from 'common/img/trashcan-inline.svg';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import ErrorIcon from 'common/img/error-inline.svg';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputRadio } from 'components/inputs/inputRadio';
import { URLS } from 'common/urls';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { SimpleBreadcrumbs } from 'components/main/simpleBreadcrumbs';
import {
  projectMembersSelector,
  projectInfoSelector,
  fetchProjectAction,
  projectInfoLoadingSelector,
} from 'controllers/project';
import { Grid } from 'components/main/grid';
import { InputSearch } from 'components/inputs/inputSearch';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { ProjectName } from 'pages/admin/projectsPage/projectName';
import { debounce } from 'common/utils/debounce';
import { DotsMenuButton } from 'components/buttons/dotsMenuButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { MultiActionButton } from 'components/buttons/multiActionButton';
import { ToggleButton } from 'components/buttons/toggleButton';
import { SingleAutocomplete } from 'components/inputs/autocompletes/singleAutocomplete';
import { MultipleAutocomplete } from 'components/inputs/autocompletes/multipleAutocomplete';
import { WithAsyncLoading } from 'components/inputs/autocompletes/withAsyncLoading';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputDropdownSorting } from 'components/inputs/inputDropdownSorting';
import { InputSlider } from 'components/inputs/inputSlider';
import { InputRadioGroup } from 'components/inputs/inputRadioGroup';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { InputTimeDateRange } from 'components/inputs/inputTimeDateRange';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { AbsRelTime } from 'components/main/absRelTime';
import { MarkdownEditor, MarkdownViewer } from 'components/main/markdown';
import { createGlobalNamedIntegrationsSelector } from '../selectors';

const BUTTONS = {
  GhostButton,
  BigButton,
  ToggleButton,
  DotsMenuButton,
  GhostMenuButton,
  MultiActionButton,
};

const INPUTS = {
  Input,
  InputDropdown,
  InputRadio,
  InputRadioGroup,
  InputBigSwitcher,
  InputDropdownSorting,
  InputSearch,
  InputSlider,
  InputSwitcher,
  InputTextArea,
  InputTimeDateRange,
  SingleAutocomplete,
  MultipleAutocomplete,
  WithAsyncLoading,
};

export const createImportProps = (pluginName) => ({
  lib: { React, useSelector, useDispatch, moment, Parser, reduxForm, formValueSelector },
  components: {
    ...BUTTONS,
    ...INPUTS,
    NavigationTabs,
    NoCasesBlock,
    ItemList,
    SpinningPreloader,
    ModalLayout,
    ModalField,
    FieldProvider,
    FieldErrorHint,
    SimpleBreadcrumbs,
    Link,
    Grid,
    PaginationToolbar,
    ProjectName,
    ScrollWrapper,
    AbsRelTime,
    MarkdownEditor,
    MarkdownViewer,
  },
  constants: { PLUGIN_UI_EXTENSION_ADMIN_PAGE, PROJECT_SETTINGS_TAB_PAGE },
  actions: { showModalAction, showSuccessNotification, showErrorNotification, fetchProjectAction },
  selectors: {
    pluginRouteSelector,
    activeProjectSelector,
    globalIntegrationsSelector: createGlobalNamedIntegrationsSelector(pluginName),
    projectMembersSelector,
    projectInfoSelector,
    activeProjectRoleSelector,
    projectInfoLoadingSelector,
    isAdminSelector,
  },
  icons: { PlusIcon, RemoveIcon, CrossIcon, ErrorIcon },
  utils: { fetch, URLS, debounce },
});
