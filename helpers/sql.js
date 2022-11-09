const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
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

module.exports = { sqlForPartialUpdate };
