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

import { TOKEN_KEY } from 'controllers/auth';

export function addTokenToImagePath(path) {
  const [, token] = (localStorage.getItem(TOKEN_KEY) || '').split(' ');

  if (token) {
    const sep = path.indexOf('?') !== -1 ? '&' : '?';
    return `${path}${sep}access_token=${token}`;
  }

  return path;
}
