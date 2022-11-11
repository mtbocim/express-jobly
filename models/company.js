"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const jsonschema = require("jsonschema");
const companyFilterSchema = require("../schemas/companyFilterSearch.json");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */ //TODO: ADD TEST FOR NON-NULL NAME, NON-NULL EMPLOYEES

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate company: ${handle}`);
    }

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /**Find companies by filter
   *
   * Accepts an object containing search values.
   * Valid filter keywords:
   *  -minEmployees
   *  -maxEmployees
   *  -name
   * { name: 'name', minEmployees: 1, maxEmployees: 1000 }
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   */

  static async findFiltered(queryParams) {
    const { minEmployees, maxEmployees } = queryParams;

    if (minEmployees > maxEmployees) {
      throw new BadRequestError("minEmployees must be less than maxEmployees.");
    }

    const { where, values } = Company._sqlForFilteredSearch(queryParams);
    //console.log(">>>>>>>WHERE", where);
    //console.log(">>>>>>>VALUES", values);

    const query =
      `SELECT
        handle,
        name,
        description,
        num_employees AS "numEmployees",
        logo_url AS "logoUrl"

        FROM companies
        WHERE ${where}
        ORDER BY name` ;

    const companiesRes = await db.query(query, values);

    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
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
  static _sqlForFilteredSearch(dataToFilter) {
    const dataKeys = Object.keys(dataToFilter);
    if (dataKeys.length === 0) throw new BadRequestError("No Data for filter");

    const validator = jsonschema.validate(
      dataToFilter,
      companyFilterSchema,
      { required: true }
    );
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const values = [];
    const where = [];

    if (dataToFilter.name !== undefined) {
      values.push(`%${dataToFilter.name}%`);
      where.push(`name ILIKE $${values.length}`);
    }

    if (dataToFilter.minEmployees !== undefined) {
      values.push(`${dataToFilter.minEmployees}`);
      where.push(`num_employees >= $${values.length}`);
    }

    if (dataToFilter.maxEmployees !== undefined) {
      values.push(`${dataToFilter.maxEmployees}`);
      where.push(`num_employees <= $${values.length}`);
    };

    return ({ where: where.join(' AND '), values });
  }
}


module.exports = Company;
