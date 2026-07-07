import express from "express";
import Course from "../models/Courses.js";
import { protectWithJSON } from "./authMiddleware.js";

const router = express.Router();

router.get("/", protectWithJSON, async (req, res, next) => {
  try {
    // Finds all documents in your "courses" collection
    // .populate() will swap student ObjectIds with their full documents
    // We select '-password' to exclude sensitive password hashes from the response
    const courses = await Course.find({}).populate(
      "enrolledStudents",
      "-password",
    );

    res.status(200).json(courses);
  } catch (error) {
    // Passes any database errors straight to your global handler in server.js
    next(error);
  }
});

export default router;
