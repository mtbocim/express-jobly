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
