"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const jsonschema = require("jsonschema");
const jobNewSchema = require("../schemas/jobNew.json");

/**Related functions for jobs */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be {title, salary, equity, handle}
     *
     * Returns {id, title, salary, equity, handle}
     *
     * Throws BadRequestError title empty, salary < 0, equity > 1.0.
     * Throws BadRequestError company handle not in database.
     * (violates foreign key reference)
     *
     */

    static async create({ title, salary, equity, handle }) {
        console.log("HANDLE>>>>>>>>>>>>>>>>>>", handle);
        const validator = jsonschema.validate(
            { title, salary, equity, handle },
            jobNewSchema,
            { required: true }
        );
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const companyCheck = await db.query(
            `SELECT handle
                FROM companies
                WHERE handle = $1`,
            [handle]);

        console.log("companyCheck>>>>>>>>>>>>>>>>>>", companyCheck);
        if (!companyCheck.rows[0]) {
            throw new BadRequestError(`Invalid company: ${handle}`);
        }


        const result = await db.query(`
            INSERT INTO jobs(title,
                            salary,
                            equity,
                            company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING   id,
                        title,
                        salary,
                        equity,
                        company_handle AS "companyHandle"
        `, [title,
            salary,
            equity,
            handle]);

        const job = result.rows[0];
        return job;

    }

    /**
     * Find all jobs.
     *
     * Returns [{id, title, salary, equity, handle}, ...]
     */
    static async findAll() {

    }

    /**
     * Find jobs by filter
     *
     * Accepts an object containing search values.
     * Valid filter keywords:
     *  -title (partial or full)(case insensitive)
     *  -minSalary (integer)
     *  -hasEquity (T/F)
     * {title:"programmer", minSalary:"1000000", hasEquity:true}
     *
     *
     * Returns [{id, title, salary, equity, handle}, ...]
     */

    static async findFiltered(queryParams) {

    }

    /**
     * Given a job ID, return data about the job.
     *
     * Returns {id, title, salary, equity, handle}
     *
     * Throws NotFoundError if not found.
     */

    static async get(id) {

    }

    /**
    * Update job data with 'data'.
    *
    * This is a "partial update" --- it's fine if data doesn't contain all the
    * fields; this only changes provided ones.
    *
    * Data can include: {title, salary, equity, handle}
    *
    * Returns {id, title, salary, equity, handle}
    *
    * Throws NotFoundError if not found.
    */

    static async update(id, data) {

    }

    /**
     * Delete given job from the DB, returns undefined.
     *
     * Throws NotFoundError if company not found.
     */

    static async remove(id) {

    }

    /**
     * Function for generating a WHERE clause for database query.
     * Accepts 1-3 valid search terms:
     * title: type(string)
     * minSalary: type(integer)
     * hasEquity: type(boolean)
     *
     * Accepts:
     *  {title:"programmer", minSalary:"1000000", hasEquity:true}
     *
     * Returns:
     *  TBD
     *
     */

    static _sqlForFilteredSearch(dataToFilter) {

    }
}

module.exports = Job;