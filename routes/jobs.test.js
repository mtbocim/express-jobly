"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "newJob",
        salary: 50000,
        equity: .25,
        companyHandle: "c1"
    };

    test("ok for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "newJob",
                salary: 50000,
                equity: "0.25",
                companyHandle: "c1"
            },
        });
    });

    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);

    });

    test("bad request with missing data for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "missing data"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("unauth with missing data non-admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                handle: "new",
                numEmployees: 10,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with invalid data for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "newJob",
                salary: 50000,
                equity: ".25",
                companyHandle: "nope"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("unauth with invalid data for non-admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "newJob",
                salary: 50000,
                equity: ".25",
                companyHandle: "nope"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** GET /jobs */
describe("GET /jobs", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        "id": expect.any(Number),
                        "title": "j1",
                        "salary": 5000,
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
                ]
        });
    });

    test("ok for anon: filtered", async function () {
        const resp = await request(app).get("/jobs?title=j1");
        expect(resp.body).toEqual(
            {
                jobs:
                    [
                        {
                            "id": expect.any(Number),
                            "title": "j1",
                            "salary": 5000,
                            "equity": "0",
                            "companyHandle": "c1",
                        }
                    ]
            }
        );
    });

    test("ok for anon: filtered", async function () {
        const resp = await request(app).get("/jobs?minSalary=50000");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        "id": expect.any(Number),
                        "title": "j2",
                        "salary": 1000000,
                        "equity": "0.5",
                        "companyHandle": "c2",
                    }
                ]
        });
    });

    test("ok for anon: filtered", async function () {
        const resp = await request(app)
            .get("/jobs?hasEquity=true");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        "id": expect.any(Number),
                        "title": "j2",
                        "salary": 1000000,
                        "equity": "0.5",
                        "companyHandle": "c2",
                    }
                ]
        });
    });

    test("not work: invalid query params on filtered search", async function () {
        const resp = await request(app).get("/jobs?eith=C1");
        expect(resp.body).toEqual({
            "error": {
                "message": [
                    "instance is not allowed to have the additional property \"eith\""
                ],
                "status": 400
            }
        });
    });

    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
        const resp = await request(app).get(`/jobs/1`);
        expect(resp.body).toEqual({
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
        });
    });

    test("works for anon: company w/o jobs", async function () {
        const resp = await request(app).get(`/companies/c2`);
        expect(resp.body).toEqual({
            company: {
                handle: "c2",
                name: "C2",
                description: "Desc2",
                numEmployees: 2,
                logoUrl: "http://c2.img",
            },
        });
    });

    test("not found for no such company", async function () {
        const resp = await request(app).get(`/companies/nope`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** GET /jobs/:id */

/************************************** PATCH /jobs/:id */

/************************************** DELETE /jobs/:id */