'use strict';

const { sqlForPartialUpdate } = require("./sql");
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


  test("does not work: no keys provided for dataToUpdate", function () {


  });

  test("does not work: no keys provided for jsToSql", function () {


  });

  test("does not work: no values provided to keys for dataToUpdate", function () {


  });

  test("does not work: no values provided to keys for jsToSql", function () {


  });









});