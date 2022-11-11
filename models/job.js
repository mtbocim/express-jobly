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
     * Throws BadRequestError if company_handle doesn't exist
     * (violates foreign key reference)
     */

    static async create({ title, salary, equity, handle }) {

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

    static async update(id, data){

    }

    /**
     * Delete given job from the DB, returns undefined.
     * 
     * Throws NotFoundError if company not found.
     */

    static async remove(id){

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

    static _sqlForFilteredSearch(dataToFilter){
        
    }
}

module.exports = Job;