export const convertQueryForRequest = (query = {}) => {
  const result = { ...query };
  if (result.order) {
    const [sort, order] = query.order.split(',');
    result.sort = sort;
    result.order = order;
  }
  return result;
};
