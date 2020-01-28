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

import { PROJECT_MANAGER, CUSTOMER, MEMBER, OPERATOR } from 'common/constants/projectRoles';
import { USER, ADMINISTRATOR } from 'common/constants/accountRoles';

export const mockData = {
  content: [
    {
      userId: '.elogin.new',
      email: 'elogin@gmaile.com',
      fullName: 'test',
      accountType: 'INTERNAL',
      userRole: ADMINISTRATOR,
      lastLogin: 1506685504247,
      photoLoaded: true,
      defaultProject: 'last',
      assignedProjects: {
        _elogin_new_personal: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
        'demo-project': {
          projectRole: CUSTOMER,
          proposedRole: CUSTOMER,
          entryType: 'INTERNAL',
        },
        last: { projectRole: MEMBER, proposedRole: MEMBER, entryType: 'INTERNAL' },
      },
    },
    {
      userId: 'autotest',
      email: 'autotest@example.com',
      fullName: 'autotest',
      accountType: 'INTERNAL',
      userRole: USER,
      lastLogin: 1467362347319,
      photoLoaded: true,
      defaultProject: 'autotest_personal',
      assignedProjects: {
        autotest_personal: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
        default_project: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'INTERNAL',
        },
        tester_personal: {
          projectRole: OPERATOR,
          proposedRole: MEMBER,
          entryType: 'PERSONAL',
        },
      },
    },
    {
      userId: 'customer-krns',
      email: 'customer-krns@yandex.by',
      fullName: 'TEST USER',
      accountType: 'INTERNAL',
      userRole: USER,
      lastLogin: 1500458177511,
      photoLoaded: true,
      defaultProject: 'gnu',
      assignedProjects: {
        'customer-krns_personal': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
        gnu: { projectRole: CUSTOMER, proposedRole: CUSTOMER, entryType: 'INTERNAL' },
        tester_personal: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'PERSONAL',
        },
      },
    },
    {
      userId: 'default',
      email: 'string000@gmale.com',
      photoId: '59c375979194be0001795d1f',
      fullName: 'tester',
      accountType: 'INTERNAL',
      userRole: USER,
      lastLogin: 1519033663525,
      photoLoaded: true,
      defaultProject: 'uservcevkjblbk_personal',
      assignedProjects: {
        11111: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        '1111_1111': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'ahml-sup': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'UPSA',
        },
        aircraft: { projectRole: MEMBER, proposedRole: MEMBER, entryType: 'INTERNAL' },
        ak_2_personal_project: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        alex_personal: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'PERSONAL',
        },
        artem: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'artem-test': {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'INTERNAL',
        },
        'bcsl-bqs': { projectRole: MEMBER, proposedRole: MEMBER, entryType: 'UPSA' },
        copy: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'ddn-repl': { projectRole: MEMBER, proposedRole: MEMBER, entryType: 'UPSA' },
        default_personal: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
        default_project: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'INTERNAL',
        },
        demo4: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        email: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'epm-pro': { projectRole: MEMBER, proposedRole: MEMBER, entryType: 'UPSA' },
        'epm-upsa': { projectRole: MEMBER, proposedRole: MEMBER, entryType: 'UPSA' },
        extra: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        flacky: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        gnu: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        grow: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        hhh_hhh: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        hhh_jjj: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        hhhh: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        import: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        jobs: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        lexecon_personal: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
        nebo_project1: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'INTERNAL',
        },
        nebo_project2: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'INTERNAL',
        },
        nebo_standart: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'INTERNAL',
        },
        'new-project': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'new-project-new': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'new-yana-project': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        newa: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        peppastar: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'pr-1': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'pr-2': { projectRole: MEMBER, proposedRole: MEMBER, entryType: 'INTERNAL' },
        'pr-custom-1': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'project-qa': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        project365: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        qwerty: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'reportportal-user_personal': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
        rp_autotest_proj: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        single_personal: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'PERSONAL',
        },
        superadmin_personal: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'PERSONAL',
        },
        tester_personal: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
        testvovan: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        trend: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        tttttttt: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        user105_personal: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        userdiaul7nhzj_personal: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'PERSONAL',
        },
        uservcevkjblbk_personal: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'PERSONAL',
        },
        'yana-test': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        yana_new_project_jjj: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        yana_project: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
      },
    },
    {
      userId: 'demo-3',
      email: 'frmp.test@gmaile.com',
      fullName: 'DME',
      accountType: 'INTERNAL',
      userRole: USER,
      lastLogin: 1509011649245,
      photoLoaded: true,
      defaultProject: 'demo-3_personal',
      assignedProjects: {
        'demo-3_personal': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
      },
    },
    {
      userId: 'member-01',
      email: 'member.test@gmail.com',
      fullName: MEMBER,
      accountType: 'INTERNAL',
      userRole: USER,
      lastLogin: 1515768434280,
      photoLoaded: true,
      defaultProject: 'member-01_personal',
      assignedProjects: {
        default_project: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'INTERNAL',
        },
        'member-01_personal': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
      },
    },
    {
      userId: 'member-user1',
      email: 'test.stop@gmail.com',
      fullName: 'Member-user1',
      accountType: 'INTERNAL',
      userRole: USER,
      lastLogin: 1507539222051,
      photoLoaded: true,
      defaultProject: 'member-user1_personal',
      assignedProjects: {
        default_project: {
          projectRole: MEMBER,
          proposedRole: MEMBER,
          entryType: 'INTERNAL',
        },
        'member-user1_personal': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
      },
    },
    {
      userId: 'new-user10',
      email: 'testuser0@gmail.com',
      fullName: 'User0',
      accountType: 'INTERNAL',
      userRole: USER,
      lastLogin: 1475678006576,
      photoLoaded: true,
      defaultProject: 'new-user10_personal',
      assignedProjects: {
        'new-user10_personal': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
      },
    },
    {
      userId: 'new-user3',
      email: 'test.new.user@gmail.com',
      fullName: 'NEW-USER3',
      accountType: 'INTERNAL',
      userRole: USER,
      lastLogin: 1477575142558,
      photoLoaded: true,
      defaultProject: 'new-user3_personal',
      assignedProjects: {
        aircraft: {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'INTERNAL',
        },
        'new-user3_personal': {
          projectRole: PROJECT_MANAGER,
          proposedRole: PROJECT_MANAGER,
          entryType: 'PERSONAL',
        },
      },
    },
  ],
  page: { number: 1, size: 10, totalElements: 52, totalPages: 6 },
};
