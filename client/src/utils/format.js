export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function sellerGroups(items) {
  return items.reduce((groups, item) => {
    const key = item.seller_id || item.sellerId;
    if (!groups[key]) {
      groups[key] = {
        sellerId: key,
        sellerName: item.seller_name || item.sellerName,
        items: [],
      };
    }
    groups[key].items.push(item);
    return groups;
  }, {});
}

export function stockStatus(stock) {
  const amount = Number(stock || 0);
  if (amount <= 0) return "Out of Stock";
  if (amount <= 5) return "Low Stock";
  return "In Stock";
}
