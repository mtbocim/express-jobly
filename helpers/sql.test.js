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


// /************************************** sqlFilteredSearch */
// describe("tests for sqlFilteredSearch", function () {
//   test("work: with single valid inputs", function () {
//     const data = { minEmployees: 5 };
//     //const jsToSql = { minEmployees: "min_employees" };

//     const queryData = sqlForFilteredSearch(data);
//     expect(queryData).toEqual({
//       "values": ["5"],
//       "where": "num_employees >= $1"
//     });
//   });

//   test("work: two valid inputs", function () {
//     const data = { minEmployees: 5, name: "bob" };

//     const queryData = sqlForFilteredSearch(data);
//     expect(queryData).toEqual(
//       {
//         "values": ["%bob%", "5"],
//         "where": "name ILIKE $1 AND num_employees >= $2"
//       }

//     );
//   });

//   test("work: three valid inputs", function () {
//     const data = { minEmployees: 5, maxEmployees: 10, name: "bob" };

//     const queryData = sqlForFilteredSearch(data);
//     expect(queryData).toEqual(
//       {
//         "values": ["%bob%", "5", "10"],
//         "where": "name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3"
//       }
//     );
//   });

//   test("does not work: no keys provided for dataToFilter", function () {
//     const data = {};

//     try {
//       const queryData = sqlForFilteredSearch(data);
//       throw new Error("shouldn't ever get here");
//     }
//     catch (errs) {
//       expect(errs instanceof BadRequestError).toBeTruthy();
//     }
//   });

//   test("does not work: incorrects keys provided for dataToFilter", function () {
//     const data = { monkey: "silly" };

//     try {
//       const queryData = sqlForFilteredSearch(data);
//       throw new Error("shouldn't ever get here");
//     }
//     catch (errs) {
//       expect(errs instanceof BadRequestError).toBeTruthy();
//     }
//   });


//   test("does not work: no values provided to keys for dataToFilter", function () {
//     const data = { name: "" };

//     try {
//       const queryData = sqlForFilteredSearch(data);

//       throw new Error("shouldn't ever get here");
//     }
//     catch (errs) {
    
//       expect(errs instanceof BadRequestError).toBeTruthy();
//     }
//   });

