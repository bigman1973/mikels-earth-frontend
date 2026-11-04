// Public/admin contract: reuse displayOrder (WebProduct.display_order).
// Missing, NULL and legacy non-positive positions follow all positive ranks.
export const MAX_CATALOGUE_POSITION = 2147483647;
export const getCataloguePosition = (product = {}) => (
  Number.isInteger(product.displayOrder) && product.displayOrder > 0 && product.displayOrder <= MAX_CATALOGUE_POSITION
    ? product.displayOrder : null
);

export const sortCatalogueProducts = (products = []) => (
  products.map((product, index) => ({ product, index })).sort((a, b) => {
    const aPosition = getCataloguePosition(a.product);
    const bPosition = getCataloguePosition(b.product);
    if (aPosition !== bPosition) {
      if (aPosition === null) return 1;
      if (bPosition === null) return -1;
      return aPosition - bPosition;
    }
    // Match server tie-break when IDs exist; otherwise preserve incoming order.
    if (Number.isInteger(a.product.id) && Number.isInteger(b.product.id) && a.product.id !== b.product.id) {
      return a.product.id - b.product.id;
    }
    return a.index - b.index;
  }).map(({ product }) => product)
);

export const positionEditorValue = (product = {}) => getCataloguePosition(product)?.toString() ?? '';
export const positionOnlyPayload = (value) => {
  if (value === '' || value === null) return { displayOrder: null };
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) throw new Error('La posición debe ser un entero positivo o quedar vacía.');
  const position = Number(value);
  if (!Number.isInteger(position) || position < 1 || position > MAX_CATALOGUE_POSITION) throw new Error('La posición debe ser un entero positivo o quedar vacía.');
  return { displayOrder: position };
};
