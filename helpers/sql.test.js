'use strict';

const { sqlForPartialUpdate, sqlForFilteredSearch } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {


  test("works: with one valid input", function () {

    const data = { firstName: "trevor" };
    const jsToSql = { firstName: "first_name" };

    const queryData = sqlForPartialUpdate(data, jsToSql);

    expect(queryData).toEqual({ setCols: '"first_name"=$1', values: ['trevor'] });


  });

  test("works: with multiple valid inputs", function () {
    const data = { firstName: "trevor", lastName: "hudson" };
    const jsToSql = { firstName: "first_name", lastName: "last_name" };

    const queryData = sqlForPartialUpdate(data, jsToSql);

    expect(queryData).toEqual(
      {
        setCols: '"first_name"=$1, "last_name"=$2',
        values: ['trevor', 'hudson']
      });

  });

  /** Function will construct query string values regardless of database schema.    */
  test("work: defaults to data col name if not matched in jsToSql", function () {
    const data = { firstName: "trevor" };
    const jsToSql = { lastName: "last_name" };

    const queryData = sqlForPartialUpdate(data, jsToSql);
    expect(queryData).toEqual({ setCols: '"firstName"=$1', values: ['trevor'] });

  });

  test("work: no keys provided for jsToSql", function () {
    const data = { firstName: "Michael" };
    const jsToSql = {};

    const queryData = sqlForPartialUpdate(data, jsToSql);
    expect(queryData).toEqual({ setCols: '"firstName"=$1', values: ['Michael'] });

  });

  test("does not work: no keys provided for dataToUpdate", function () {
    const data = {};
    const jsToSql = { firstName: "first_name" };

    try {
      const queryData = sqlForPartialUpdate(data, jsToSql);
      throw new Error("shouldn't ever get here");
    }
    catch (errs) {
      expect(errs instanceof BadRequestError).toBeTruthy();
    }
  });


  test("work: no values provided to keys for dataToUpdate", function () {
    const data = { firstName: "" };
    const jsToSql = { firstName: "first_name" };

    const queryData = sqlForPartialUpdate(data, jsToSql);
    expect(queryData).toEqual({ setCols: '"first_name"=$1', values: [''] });

  });

  test("work: no values provided to keys for jsToSql", function () {
    const data = { firstName: "Michael" };
    const jsToSql = { firstName: '' };

    const queryData = sqlForPartialUpdate(data, jsToSql);
    expect(queryData).toEqual({ setCols: '"firstName"=$1', values: ['Michael'] });

  });

});


/************************************** sqlFilteredSearch */
describe("tests for sqlFilteredSearch", function () {
  test("work: with single valid inputs", function () {
    const data = { minEmployees: 5 };
    const jsToSql = { minEmployees: "min_employees" };

    const queryData = sqlForFilteredSearch(data, jsToSql);
    expect(queryData).toEqual({ setCols: '"min_employees"=$1', values: [5] });
  });

  test("work: multiple valid inputs", function () {
    const data = { minEmployees: 5, name: "bob" };
    const jsToSql = { minEmployees: "min_employees", name: "name" };

    const queryData = sqlForFilteredSearch(data, jsToSql);
    expect(queryData).toEqual(
      {
        setCols: '"min_employees"=$1,"name"=$2',
        values: [5, "bob"]
      }
    );
  });

  test("work: defaults to data col?? name if not matched in jsToSql", function () {
    const data = { minEmployees: 5, name: "bob" };
    const jsToSql = { maxEmployees: "max_employees" };

    const queryData = sqlForFilteredSearch(data, jsToSql);
    expect(queryData).toEqual(
      {
        setCols: '"minEmployees"=$1,"name"=$2',
        values: [5, "bob"]
      }
    );
  });

  test("work: no keys provided for jsToSql", function () {
    const data = { name: "Michael" };
    const jsToSql = {};

    const queryData = sqlForFilteredSearch(data, jsToSql);
    expect(queryData).toEqual(
      {
        setCols: '"name"=$1',
        values: ['Michael']
      }
    );

  });

  test("does not work: no keys provided for dataToFilter???", function () {
    const data = {};
    const jsToSql = { name: "name" };

    try {
      const queryData = sqlForFilteredSearch(data, jsToSql);
      throw new Error("shouldn't ever get here");
    }
    catch (errs) {
      expect(errs instanceof BadRequestError).toBeTruthy();
    }
  });


  test("work: no values provided to keys for dataToFilter???", function () {
    const data = { name: "" };
    const jsToSql = { name: "name" };

    const queryData = sqlForFilteredSearch(data, jsToSql);
    expect(queryData).toEqual({ setCols: '"name"=$1', values: [''] });

  });

  test("work: no values provided to keys for jsToSql", function () {
    const data = { name: "Michael" };
    const jsToSql = { name: '' };

    const queryData = sqlForPartialUpdate(data, jsToSql);
    expect(queryData).toEqual({ setCols: '"name"=$1', values: ['Michael'] });

  });
});