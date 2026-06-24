import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      trim: true,
    },
    courseTitle: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    courseDescription: {
      type: String,
      trim: true,
    },
    classroomNumber: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 30,
    },
    creditHours: {
      type: Number,
    },
    tuitionCost: {
      type: String,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References your User model if you track registrations
      },
    ],
  },
  { timestamps: true },
);

// Mongoose automatically looks for the plural lowercase version of the model name.
// Specifying "courses" explicitly ensures it targets your exact existing collection.
const Course = mongoose.model("Course", courseSchema, "courses");
export default Course;
