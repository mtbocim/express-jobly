"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const Job = require("./job.js");
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

//make a sample const to add for testing

//create single
//duplicate and get different id

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 1000,
    equity: .1,
    handle: "c1"
  };

  test("works", async function () {

    const job = await Job.create(newJob);
    // expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE title = 'new'`);

    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1"
      }
    ]);
  });

  test("works with duplicate job info", async function () {

    const job = await Job.create(newJob);
    const job2 = await Job.create(newJob);

    // expect(job).toEqual(newJob);
    // expect(job2).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE title = 'new'`);

    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "new",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1"
      }
    ]);
  });

  test("bad request: missing title", async function () {
    const badJob = {
      salary: 1000,
      equity: .1,
      handle: "c1"
    };

    try {
      const job = await Job.create(badJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }


  });

  test("bad request: missing handle", async function () {
    const badJob = {
      title: "new",
      salary: 1000,
      equity: .1
    };

    try {
      const job = await Job.create(badJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }

  });


  test("works: missing salary & equity", async function () {
    const newJob2 = {
      title: "new",
      handle: "c1"
    };


    const job = await Job.create(newJob2);
    // expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE title = 'new'`);

    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: null,
        equity: null,
        companyHandle: "c1"
      }
    ]);

  });

});











/************************************** findAll */

//find all with no filter


/************************************** findFiltered */

//find with 1 filter
//find with 2 filters
//find with all filters
//fail if bad params
//works if none returned

/************************************** get (single) */

//find company by id
//not found if no matching id


/************************************** update */

//works for string
//works for int
//works for bool
//works for nulls in salary and equity
//fails for null in title
//fails not found for given id
//fails if bad data: bad request




/************************************** remove */

//works for given id
//fails for given id

/************************************** sqlFilteredSearch */

//works for one param
//works for two params
//works for three params
//fails for no keys
//fails for incorrect keys
//fails for keys with no values
