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

  //TODO:Show that a single word doesn't get translated

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

  //TODO: Test that this *shouldn't* work!! Change function behaviour
  test("work: no values provided to keys for jsToSql", function () {
    const data = { firstName: "Michael" };
    const jsToSql = { firstName: '' };

    const queryData = sqlForPartialUpdate(data, jsToSql);
    expect(queryData).toEqual({ setCols: '"firstName"=$1', values: ['Michael'] });

  });

});
