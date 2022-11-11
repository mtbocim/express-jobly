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

  test("works: missing salary & equity", async function () {
    const newJob2 = {
      title: "new",
      handle: "not-real"
    };

    try {
      const job = await Job.create(newJob2);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }

  });

});











/************************************** findAll */

//find all with no filter
describe("find all", function () {
  test("works: returns *all* job listings", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        "id": expect.any(Number),
        "title": "j1",
        "salary": 1000,
        "equity": "0",
        "companyHandle": "c1",
      },
      {
        "id": expect.any(Number),
        "title": "j2",
        "salary": 1000000,
        "equity": "0.5",
        "companyHandle": "c2",
      }
    ]);
  });
});


/************************************** findFiltered */

//find with 1 filter
describe("findFiltered", function () {

  test("works: finds filtered set of jobs (1 filter)", async function () {
    let jobs = await Job.findFiltered({ title: "j" });
    expect(jobs).toEqual([
      {
        "id": expect.any(Number),
        "title": "j1",
        "salary": 1000,
        "equity": "0",
        "companyHandle": "c1",
      },
      {
        "id": expect.any(Number),
        "title": "j2",
        "salary": 1000000,
        "equity": "0.5",
        "companyHandle": "c2",
      }
    ]);
  });

  test("works: finds filtered set of jobs (1 filter)", async function () {
    let jobs = await Job.findFiltered({ title: "j1" });
    expect(jobs).toEqual([
      {
        "id": expect.any(Number),
        "title": "j1",
        "salary": 1000,
        "equity": "0",
        "companyHandle": "c1",
      },
    ]);
  });

  //find with 2 filters
  test("works: finds filtered set of jobs (2 filters)", async function () {
    let jobs = await Job.findFiltered({ title: "j", minSalary: 50000 });
    expect(jobs).toEqual([
      {
        "companyHandle": "c2",
        "equity": "0.5",
        "id": expect.any(Number),
        "salary": 1000000,
        "title": "j2",
      }
    ]);
  });

  //find with all filters
  test("works: finds filtered set of jobs (3 filters)", async function () {
    let jobs = await Job.findFiltered({ title: "j", minSalary: 50000, hasEquity: true });
    expect(jobs).toEqual([
      {
        "id": expect.any(Number),
        "title": "j2",
        "salary": 1000000,
        "equity": "0.5",
        "companyHandle": "c2",
      }
    ]);
  });

  test("works: finds filtered set of jobs (3 filters)", async function () {
    let jobs = await Job.findFiltered({ title: "j", minSalary: 50000, hasEquity: false });
    expect(jobs).toEqual([
      {
        "id": expect.any(Number),
        "title": "j2",
        "salary": 1000000,
        "equity": "0.5",
        "companyHandle": "c2",
      }
    ]);
  });

  test("fail: bad search param passed", async function () {
    try {
      await Job.findFiltered({ cheese: "cheddar" });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("works: finds none", async function () {
    const jobs = await Job.findFiltered({ title: "asdfasdfasdf" });
    expect(jobs).toEqual([]);
  });

});

/************************************** get (single) */

//find company by id

describe("get", function () {

  test("works", async function () {
    let job = await Job.get(1);
    console.log(' test job>>>>>>>>>>>>>>>>>>>>>>>', job);

    expect(job).toEqual({
      "id": expect.any(Number),
      "title": "j1",
      "salary": 1000,
      "equity": "0",
      "companyHandle": "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(100);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("bad request if passed non-integer id", async function () {
    try {
      await Job.get('100');
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


/************************************** update */

describe("update", function () {

  test("works with one field: title", async function () {
    const updateData = {
      title: "New"
    };
    const job = await Job.update(1, updateData);
    expect(job).toEqual({
      "id": expect.any(Number),
      "title": "New",
      "salary": 1000,
      "equity": "0",
      "companyHandle": "c1",
    });
  });

  test("works with one field: salary", async function () {
    const updateData = {
      salary: 5000
    };
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      "id": expect.any(Number),
      "title": "j1",
      "salary": 5000,
      "equity": "0",
      "companyHandle": "c1",
    });
  });

  test("works with one field: equity", async function () {
    const updateData = {
      equity: "0.5"
    };
    const job = await Job.update(1, updateData);
    expect(job).toEqual({
      "id": expect.any(Number),
      "title": "j1",
      "salary": 1000,
      "equity": "0.5",
      "companyHandle": "c1",
    });
  });

  test("works with *all* fields", async function () {
    const updateData = {
      title: "New",
      salary: 5000,
      equity: "0.5"
    };

    const job = await Job.update(1, updateData);


    expect(job).toEqual({
      "id": expect.any(Number),
      "title": "New",
      "salary": 5000,
      "equity": "0.5",
      "companyHandle": "c1",
    });
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };
    const job = await Job.update(1, updateDataSetNulls);

    expect(job).toEqual({
      "id": expect.any(Number),
      "title": "New",
      "salary": null,
      "equity": null,
      "companyHandle": "c1",
    });
  });

  test("bad request: null title field", async function () {
    const updateDataSetNulls = {
      title: null
    };
    try {
      const job = await Job.update(1, updateDataSetNulls);
      throw new Error("fail test, you shouldn't get here");
    }
    catch (err) {
      console.log('error >>>>>>>>>', err);
      expect(err instanceof BadRequestError).toBeTruthy();
    }

  });

  test("not found if no such job", async function () {
    const updateData = {
      title: "New",
      salary: 5000,
      equity: "0.5"
    };
    try {
      await Job.update(100, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });


});

/************************************** remove */

//works for given id
//fails for given id

/************************************** sqlFilteredSearch */
describe("tests for jobs/sqlFilteredSearch", function () {
  //works for one param
  test("works: single valid input", function () {
    const data = { hasEquity: true };

    const queryData = Job._sqlForFilteredSearch(data);
    expect(queryData).toEqual(
      {
        "values": [],
        "where": "equity > 0"
      }
    );
  });

  //works for two params
  test("works: two valid input", function () {
    const data = { minSalary: 50000, hasEquity: true };

    const queryData = Job._sqlForFilteredSearch(data);
    expect(queryData).toEqual(
      {
        "values": [50000],
        "where": "salary >= $1 AND equity > 0"
      }
    );
  });
  //works for three params
  test("works: all valid input", function () {
    const data = { title: "title", minSalary: 50000, hasEquity: true };

    const queryData = Job._sqlForFilteredSearch(data);
    expect(queryData).toEqual(
      {
        "values": ['%title%', 50000],
        "where": "title ILIKE $1 AND salary >= $2 AND equity > 0"
      }
    );
  });

  test("works: all valid input", function () {
    const data = { title: "title", minSalary: 50000, hasEquity: false };

    const queryData = Job._sqlForFilteredSearch(data);
    expect(queryData).toEqual(
      {
        "values": ['%title%', 50000],
        "where": "title ILIKE $1 AND salary >= $2"
      }
    );
  });

  //fails for no keys
  test("bad request: no data passed", function () {
    const data = {};

    try {
      const queryData = Job._sqlForFilteredSearch(data);
      throw new Error("shouldn't ever get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  //fails for incorrect keys
  test("bad request: incorrects keys provided for dataToFilter", function () {
    const data = { monkey: "silly" };

    try {
      const queryData = Job._sqlForFilteredSearch(data);
      throw new Error("shouldn't ever get here");
    }
    catch (errs) {
      expect(errs instanceof BadRequestError).toBeTruthy();
    }
  });

  //fails for keys with no values
  test("bad request: no values provided to keys for dataToFilter", function () {
    const data = { name: "" };

    try {
      const queryData = Job._sqlForFilteredSearch(data);

      throw new Error("shouldn't ever get here");
    }
    catch (errs) {

      expect(errs instanceof BadRequestError).toBeTruthy();
    }
  });

});