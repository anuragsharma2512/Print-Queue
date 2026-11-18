/**
 * Campus printing rates based on NIT Jamshedpur campus shop price list:
 * - Xerox: ₹2
 * - Colour Xerox: ₹5
 * - Black & White Printout: ₹3
 * - Colour Printout: ₹8
 */
export const PRINTING_RATES = {
  'Xerox': 2,
  'Colour Xerox': 5,
  'Black & White Printout': 3,
  'Colour Printout': 8,
};

/**
 * Returns the price per page for a given printing type.
 * Throws an error if printing type is invalid.
 */
export const getPricePerPage = (printingType) => {
  const rate = PRINTING_RATES[printingType];
  if (rate === undefined) {
    throw new Error(`Invalid printing type: ${printingType}. Allowed types: ${Object.keys(PRINTING_RATES).join(', ')}`);
  }
  return rate;
};

/**
 * Calculates total pages and estimated amount based on pages, copies, and printing type.
 * Formula:
 *   Total Pages = PDF Page Count × Number of Copies
 *   Estimated Amount = Total Pages × Price Per Page
 */
export const calculateOrderPrice = (printingType, pageCount, copies = 1) => {
  const pages = Number(pageCount);
  const numCopies = Number(copies);

  if (!Number.isInteger(pages) || pages <= 0) {
    throw new Error('Page count must be a positive integer.');
  }

  if (!Number.isInteger(numCopies) || numCopies <= 0) {
    throw new Error('Number of copies must be a positive integer.');
  }

  const pricePerPage = getPricePerPage(printingType);
  const totalPages = pages * numCopies;
  const estimatedAmount = totalPages * pricePerPage;

  return {
    printingType,
    pageCount: pages,
    copies: numCopies,
    totalPages,
    pricePerPage,
    estimatedAmount,
  };
};
