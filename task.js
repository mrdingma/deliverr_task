/**
 * Question 1:
 * https://merchant.wish.com/documentation/api/v2#list-all-product
 * This api limits the results to 250 per network call. If there are more than 250 products,
 * then multiple network calls are necessary to retrieve everything.
 *
 * Potential increase in efficiency:
 * 1) if we knew how many products we had, we could send out multiple network requests at once
 * and process via Promise.all
 * 2) another alternative is to use their batch download API to get a CSV of all products:
 * https://merchant.wish.com/documentation/api/v2#product-create-download-job
 *
 * Question 2: see below dataParser function
 *
 */

const axios = require("axios");

const database = {};

async function getProducts(offset, limit = 250) {
  try {
    const url = "https://merchant.wish.com/api/v2/product/multi-get";

    if (limit > 250) {
      limit = 250;
    }

    if (limit < 1) {
      limit = 1;
    }

    const response = await axios({
      url,
      method: "get",
      params: {
        limit,
        start: offset,
        access_token: an_example_access_token,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
  }
}

async function getAllProducts() {
  try {
    let response = await getProducts(0);
    let count = 0;
    dataParser(response);

    while (response.paging.next) {
      count++;
      response = await getAllProducts(count * 250);
      dataParser(response);
    }
  } catch (err) {
    console.log(error);
  }
}

function dataParser(res) {
  res.data.forEach((obj) => {
    const { Product } = obj;
    const { variants } = Product;

    for (let { Variant } of variants) {
      const { id, color, sku } = Variant;

      database[id] = { productId: id, sku, title: `${Product.name}-${color}` };
    }
  });
}

/**
 * customer use Wish marketplace to sell
 * Deliverr ship those items to buyers
 *
 * in order to identify items sent to Deliverr:
 * 1) Deliverr needs to download customer's product catalog (all the
 * items Deliverr may be asked to ship in future)
 * 2) Deliverr will also need to update inventory for those items so Wish knows when item is OOS
 *
 *
 *
 *
 * Constraints:
 * 1) only want to import items that have physical inventory (no digital item)
 * 2) don't care about state of item
 * 3) if different colors, we want to import 2 items (1 for red, 1 for blue)
 * 4) productId should be same identifier used to update inventory for that item
 * 5) every item must have a unique productId
 * 6) sku is free text (any value)
 * 7) title: short, human readable item descr
 * 8) ignore warehouse parameters
 */
