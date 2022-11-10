"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, ForbiddenError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (!res.locals.user) throw new UnauthorizedError();
  return next();
}


/** Middleware to verify if user has admin priveleges
 *
 * If not, raise Forbidden.
 */ //TODO: Add ensureLoggedIn logic
function ensureAdmin(req, res, next) {
  if (!res.locals.user.isAdmin === true) throw new ForbiddenError();
  return next();

}

/** Middleware to verify if user has edit privelege (admin or ownership)
 *
 * If not, raise Forbidden
*/ //TODO: CHANGE TITLE Add ensureLoggedIn logic
function ensureOwner(req, res, next) {
  if (res.locals.user.username === req.params.username ||
    res.locals.user.isAdmin === true) { return next(); }
  else { // CHANGE FORBIDDEN ERROR TO UNAUTHORIZED (everywhere)
    throw new ForbiddenError();
  }

}





module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin, ensureOwner
};
