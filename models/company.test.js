"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    description: "New Description",
    numEmployees: 1,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.create(newCompany);
    expect(company).toEqual(newCompany);

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        num_employees: 1,
        logo_url: "http://new.img",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Company.create(newCompany);
      await Company.create(newCompany);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });
});

/************************************** findFiltered */

describe("findFiltered", function () {
  test("works: finds filtered set of companies", async function () {
    let companies = await Company.findFiltered({ name: "C1" });
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      }
    ]);
  });
  test("works: finds filtered set of companies", async function () {
    let companies = await Company.findFiltered({ name: "C" });
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });

  test("works: finds filtered set of companies, 2 params", async function () {
    let companies = await Company.findFiltered({ name: "C", minEmployees: 2 });
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });

  test("fail: bad search param passed", async function () {
    try {
      await Company.findFiltered({ cheese: "cheddar" });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


test("works: finds none", async function () {
  const companies = await Company.findFiltered({ name: "asdfasdfasdf" });
  expect(companies).toEqual([]);
});

test("fail: min greater than max", async function () {
  try {
    await Company.findFiltered({ minEmployees: 10, maxEmployees: 5 });
    throw new Error("fail test, you shouldn't get here");
  } catch (err) {
    console.log(err);
    expect(err instanceof BadRequestError).toBeTruthy();
  }
});



/************************************** get */

describe("get", function () {
  test("works", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    const company = await Company.update("c1", updateData);
    expect(company).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    const company = await Company.update("c1", updateDataSetNulls);
    expect(company).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove("c1");
    const res = await db.query(
      "SELECT handle FROM companies WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** sqlFilteredSearch */
describe("tests for sqlFilteredSearch", function () {
  test("work: with single valid inputs", function () {
    const data = { minEmployees: 5 };
    //const jsToSql = { minEmployees: "min_employees" };

    const queryData = Company._sqlForFilteredSearch(data);
    expect(queryData).toEqual({
      "values": [5],
      "where": "num_employees >= $1"
    });
  });

  test("work: two valid inputs", function () {
    const data = { minEmployees: 5, name: "bob" };

    const queryData = Company._sqlForFilteredSearch(data);
    expect(queryData).toEqual(
      {
        "values": ["%bob%", 5],
        "where": "name ILIKE $1 AND num_employees >= $2"
      }

    );
  });

  test("work: three valid inputs", function () {
    const data = { minEmployees: 5, maxEmployees: 10, name: "bob" };

    const queryData = Company._sqlForFilteredSearch(data);
    expect(queryData).toEqual(
      {
        "values": ["%bob%", 5, 10],
        "where": "name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3"
      }
    );
  });

  test("does not work: no keys provided for dataToFilter", function () {
    const data = {};

    try {
      const queryData = Company._sqlForFilteredSearch(data);
      throw new Error("shouldn't ever get here");
    }
    catch (errs) {
      expect(errs instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request: incorrects keys provided for dataToFilter", function () {
    const data = { monkey: "silly" };

    try {
      const queryData = Company._sqlForFilteredSearch(data);
      throw new Error("shouldn't ever get here");
    }
    catch (errs) {
      expect(errs instanceof BadRequestError).toBeTruthy();
    }
  });


  test("does not work: no values provided to keys for dataToFilter", function () {
    const data = { name: "" };

    try {
      const queryData = Company._sqlForFilteredSearch(data);

      throw new Error("shouldn't ever get here");
    }
    catch (errs) {

      expect(errs instanceof BadRequestError).toBeTruthy();
    }
  });
});