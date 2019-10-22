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

export const LOGIN_PAGE = 'login';
export const LOGIN_PAGE_EVENTS = {
  CLICK_TWITTER_LINK: {
    category: LOGIN_PAGE,
    action: 'Click on twitter link',
    label: 'Open twitter link',
  },
  CLICK_GITHUB_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Github on Welcome screen',
    label: 'Transition to Github',
  },
  CLICK_FACEBOOK_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Facebook on Welcome screen',
    label: 'Transition to Facebook',
  },
  CLICK_TWEETER_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Tweeter on Welcome screen',
    label: 'Transition to Tweeter',
  },
  CLICK_YOUTUBE_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon YouTube on Welcome screen',
    label: 'Transition to YouTube',
  },
  CLICK_VK_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon VK on Welcome screen',
    label: 'Transition to VK',
  },
  CLICK_SLACK_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Slack on Welcome screen',
    label: 'Transition to Slack',
  },
  CLICK_MAIL_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Mail on Welcome screen',
    label: 'Arise Mail window',
  },
};
