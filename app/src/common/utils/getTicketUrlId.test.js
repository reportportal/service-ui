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
