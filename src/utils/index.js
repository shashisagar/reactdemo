export const splitProductSku = (param) => {
    let productPK = {};
    productPK.id = param.split(/-(.+)/)[0];
    productPK.sku = param.split(/-(.+)/)[1];
    return productPK;
}

export const joinProductSku = (param) => {
    return `${param.id}-${param.sku}`;
}
