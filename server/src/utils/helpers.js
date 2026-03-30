function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

function formatUserPayload(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    sellerId: row.seller_id || null,
    sellerApproved: row.approved === 1,
  };
}

function groupBy(array, getKey) {
  return array.reduce((accumulator, item) => {
    const key = getKey(item);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(item);
    return accumulator;
  }, {});
}

module.exports = {
  formatUserPayload,
  groupBy,
  roundMoney,
};

