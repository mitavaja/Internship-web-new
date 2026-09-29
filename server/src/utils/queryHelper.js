/**
 * Advanced query helper for Mongoose
 * Handles pagination, search (regex), filter operators (gte, gt, lte, lt), and sorting
 */
const applyQuery = async (model, reqQuery, options = {}) => {
  const {
    searchFields = [],
    defaultSort = '-createdAt',
    populate = [],
    baseFilter = {},
    select = '',
  } = options;

  const queryObj = { ...reqQuery, ...baseFilter };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Advanced filtering: replace gte, gt, lte, lt, in with MongoDB operators
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|ne)\b/g, (match) => `$${match}`);
  const parsedFilter = JSON.parse(queryStr);

  // Search feature across multiple fields
  if (reqQuery.search && searchFields.length > 0) {
    const searchRegex = { $regex: reqQuery.search.trim(), $options: 'i' };
    parsedFilter.$or = searchFields.map((field) => ({ [field]: searchRegex }));
  }

  // Build query
  let query = model.find(parsedFilter);

  // Sorting
  if (reqQuery.sort) {
    const sortBy = reqQuery.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort(defaultSort);
  }

  // Field limiting
  if (reqQuery.fields) {
    const fields = reqQuery.fields.split(',').join(' ');
    query = query.select(fields);
  } else if (select) {
    query = query.select(select);
  }

  // Populate references
  if (populate && populate.length > 0) {
    populate.forEach((pop) => {
      query = query.populate(pop);
    });
  }

  // Pagination
  const page = Math.max(1, parseInt(reqQuery.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(reqQuery.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Execute count and query
  const total = await model.countDocuments(parsedFilter);
  const totalPages = Math.ceil(total / limit);

  query = query.skip(skip).limit(limit);
  const results = await query;

  return {
    results,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  applyQuery,
};
