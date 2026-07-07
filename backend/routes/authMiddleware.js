import passport from "passport";

/**
 * Custom middleware to protect routes and provide consistent JSON error responses.
 * This replaces the default passport.authenticate() which can send plain text responses.
 */
export const protectWithJSON = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      // Handle unexpected errors
      return next(err);
    }

    if (!user) {
      // Handle authentication failure
      let errorMessage =
        "Unauthorized: Access is denied due to invalid credentials.";
      if (info?.name === "TokenExpiredError") {
        errorMessage =
          "Unauthorized: Your session has expired. Please log in again.";
      } else if (info) {
        errorMessage = `Unauthorized: ${info.message}`;
      }
      return res.status(401).json({ error: errorMessage });
    }

    req.user = user; // Attach user to the request object
    next();
  })(req, res, next);
};
