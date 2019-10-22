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

import { getTicketUrlId } from './getTicketUrlId';

describe('getTicketUrlId', () => {
  test('should parsed correctly', () => {
    expect(getTicketUrlId('ticket_id:http://some.ticket.url/path')).toEqual({
      id: 'ticket_id',
      url: 'http://some.ticket.url/path',
    });
    expect(getTicketUrlId('ticket_id:https://some.ticket.url/path')).toEqual({
      id: 'ticket_id',
      url: 'https://some.ticket.url/path',
    });
  });

  test("shouldn't parsed correctly", () => {
    expect(getTicketUrlId('ticket_id:')).toEqual(null);
    expect(getTicketUrlId(':http://some.ticket.url/path')).toEqual(null);
    expect(getTicketUrlId('any:other_string')).toEqual(null);
  });
});
