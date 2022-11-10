const { BadRequestError } = require("../expressError");

/** Function for generating a database query with dynamic keys.
 * Takes in two objects, one object with the data to update and another
 * for the javascript to SQL name translation.
 *
 * - dataToUpdate Accepts: {"firstName" : "trevor"}
 * - jsToSql Accepts: {"firstName" : "first_name"}
 * - Returns: { setCols: '"first_name"=$1', values: [ 'trevor' ] }
 *
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const dataKeys = Object.keys(dataToUpdate);
  if (dataKeys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = dataKeys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Function for generating a WHERE clause for database query.
 *  Accepts 1-3 valid search terms:
 *   minEmployees : type(int), maxEmployees : type(int), name : type(string)
 *
 * - Accepts: Object like:
 *      {name : Apple, "minEmployees" : 5, maxEmployees : 10}
 * - Returns: Object like:
 *      {
 *        'name ILIKE $1 AND num_employees > $2 AND num_employees < $3',
 *        [%Apple%, 5, 10]
 *      }
 */
function sqlForFilteredSearch(dataToFilter) {
  const dataKeys = Object.keys(dataToFilter);
  if (dataKeys.length === 0) throw new BadRequestError("No Data for filter");

  const values = [];
  const where = [];

  if (dataToFilter.name) {
    values.push(`%${dataToFilter.name}%`);
    where.push(`name ILIKE $${values.length}`);
  }

  if (dataToFilter.minEmployees) {
    values.push(`${dataToFilter.minEmployees}`);
    where.push(`num_employees >= $${values.length}`);
  }

  if (dataToFilter.maxEmployees) {
    values.push(`${dataToFilter.maxEmployees}`);
    where.push(`num_employees <= $${values.length}`);
  };

  if (values.length === 0) {
    throw new BadRequestError("Insufficient search parameters");
  }

  return ({ where: where.join(' AND '), values });


}
module.exports = { sqlForPartialUpdate, sqlForFilteredSearch };
