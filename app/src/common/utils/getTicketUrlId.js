export function getTicketUrlId(str) {
  const pattern = /(http|https):\/\/[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-.,@?^=%&;:/~+#]*[a-z0-9\-@?^=%&;/~+#])?/i;
  const index = str.search(pattern);
  const id = str.slice(0, index - 1);
  const url = str.slice(index);

  return index > 0 && id ? { id, url } : null;
}
