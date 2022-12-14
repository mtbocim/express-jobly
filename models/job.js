"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const jsonschema = require("jsonschema");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSearchSchema = require("../schemas/jobFilterSearch.json");

/**Related functions for jobs */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be {title, salary, equity, companyHandle}
     *
     * Returns {id, title, salary, equity, companyHandle}
     *
     * Throws BadRequestError title empty, salary < 0, equity > 1.0.
     * Throws BadRequestError company handle not in database.
     * (violates foreign key reference)
     *
     */

    static async create({ title, salary, equity, companyHandle }) {
        const validator = jsonschema.validate(
            { title, salary, equity, companyHandle },
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
            [companyHandle]);

        console.log("companyCheck>>>>>>>>>>>>>>>>>>", companyCheck);
        if (!companyCheck.rows[0]) {
            throw new BadRequestError(`Invalid company: ${companyHandle}`);
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
            companyHandle]);

        const job = result.rows[0];
        return job;

    }

    /**
     * Find all jobs.
     *
     * Returns [{id, title, salary, equity, companyHandle}, ...]
     */
    static async findAll() {
        const jobsRes = await db.query(
            `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
            FROM jobs
            ORDER BY company_handle`);
        return jobsRes.rows;
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
        const { where, values } = Job._sqlForFilteredSearch(queryParams);

        const query =
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            WHERE ${where}
            ORDER BY company_handle` ;

        const jobsRes = await db.query(query, values);

        return jobsRes.rows;

    }

    /**
     * Given a job ID, return data about the job.
     *
     * Returns {id, title, salary, equity, handle}
     *
     * Throws NotFoundError if not found.
     */

    static async get(id) {
        if (typeof (id) !== 'number') {
            throw new BadRequestError(`No job: ${id}`); //update msg
        };

        const jobRes = await db.query(
            `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [id]);

        const job = jobRes.rows[0];
        console.log('job>>>>>>>>>>>>>>>>>>>>>>>', job);

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;

    }

    /**
    * Update job data with 'data'.
    *
    * This is a "partial update" --- it's fine if data doesn't contain all the
    * fields; this only changes provided ones.
    *
    * Data can include: {title, salary, equity}
    *
    * Returns {id, title, salary, equity, companyHandle}
    *
    * Throws NotFoundError if not found.
    */


    static async update(id, data) {
        if (data.title === null) {
            throw new BadRequestError("Title field cannot be null");
        }

        const validator = jsonschema.validate(
            data,
            jobUpdateSchema,
            { required: true }
        );
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        //columns to update are already sql friendly
        const { setCols, values } = sqlForPartialUpdate(
            data, {});

        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `
            UPDATE jobs
            SET ${setCols}
              WHERE id = ${handleVarIdx}
              RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;


    }

    /**
     * Delete given job from the DB, returns undefined.
     *
     * Throws NotFoundError if company not found.
     */

    static async remove(id) {
        const result = await db.query(
            `DELETE
                 FROM jobs
                 WHERE id = $1
                 RETURNING id`,
            [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
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
        const dataKeys = Object.keys(dataToFilter);
        if (dataKeys.length === 0) throw new BadRequestError("No Data for filter");

        const validator = jsonschema.validate(
            dataToFilter,
            jobFilterSearchSchema,
            { required: true }
        );
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const values = [];
        const where = [];

        if (dataToFilter.title !== undefined) {
            values.push(`%${dataToFilter.title}%`);
            where.push(`title ILIKE $${values.length}`);
        }
        if (dataToFilter.minSalary !== undefined) {
            values.push(dataToFilter.minSalary);
            where.push(`salary >= $${values.length}`);
        }
        if (dataToFilter.hasEquity === true) {
            where.push(`equity > 0`);
        }

        return ({ where: where.join(' AND '), values });

    }
}

module.exports = Job;


//SELECT title, salary, equity FROM jobs WHERE equity>0;