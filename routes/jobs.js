"use strict";

/** Routes for jobs */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobFilterSchema = require("../schemas/jobFilterSearch.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json")

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login, admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
    const validator = jsonschema.validate(
        req.body,
        jobNewSchema,
        { required: true }
    );
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
});


/** GET /  =>
*   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
*
* Can filter on provided search filters:
* - title
* - minSalary
* - hasEquity
*
* Authorization required: none
*/

router.get("/", async function (req, res, next) {
    const query = req.query;
    
    if (query.salary !== undefined) {
        query.salary = +query.salary;
    }

    const queryKeys = Object.keys(query);
    if (queryKeys.length !== 0) {
        const validator = jsonschema.validate(
            query,
            jobFilterSchema,
            { required: true }
        );
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const jobs = await Job.findFiltered(query);
        return res.json({ jobs });
    } else {
        const jobs = await Job.findAll();
        return res.json({ jobs });
    }
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
    
    const params = req.params;
    if (params.id !== undefined) {
        params.id = +params.id;
    }
    if(isNaN(params.id)){
        throw new BadRequestError("id must be an integer")
    }

    const job = await Job.get(params.id);
    return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
*
* Patches job data.
*
* fields can be: { title, salary, equity }
*
* Returns { id, title, salary, equity, companyHandle }
*
* Authorization required: login, admin
*/

router.patch(
    "/:id",
    ensureLoggedIn,
    ensureAdmin,
    async function (req, res, next) {
        const params = req.params;
        if (params.id !== undefined) {
            params.id = +params.id;
        }
        if(isNaN(params.id)){
            throw new BadRequestError("id must be an integer")
        }
        const validator = jsonschema.validate(
            req.body,
            jobUpdateSchema,
            { required: true }
        );
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(params.id, req.body);
        return res.json({ job });
    }
);

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login, admin
 */

router.delete(
    "/:id",
    ensureLoggedIn,
    ensureAdmin,
    async function (req, res, next) {

        const params = req.params;
        if (params.id !== undefined) {
            params.id = +params.id;
        }
        if(isNaN(params.id)){
            throw new BadRequestError("id must be an integer")
        }
        await Job.remove(params.id);
        return res.json({ deleted: params.id });
    }
);

module.exports = router;