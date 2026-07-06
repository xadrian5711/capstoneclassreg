import React, { useState } from "react";
// Assuming you have access to your `currentUser` object from context/auth
// const { currentUser } = useAuth();

export function CourseCard({ course, currentUser, setCourses }) {
  const [roster, setRoster] = useState([]);
  const [showRoster, setShowRoster] = useState(false);

  // Function to delete the course (Admin only)
  const handleDeleteCourse = async (courseId) => {
    if (
      !window.confirm(
        "Delete this course permanently? This removes it from all schedules.",
      )
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:3002/api/admin/courses/${courseId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to delete course");

      // Remove it from the local UI
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Function to fetch enrolled students (Admin only)
  const handleViewRoster = async (courseId) => {
    if (showRoster) {
      setShowRoster(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3002/api/admin/courses/${courseId}/students`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      setRoster(data);
      setShowRoster(true);
    } catch (err) {
      alert("Failed to fetch roster");
    }
  };

  // Function for students to enroll
  const handleEnroll = async (courseId) => {
    // Your existing enroll logic...
  };

  return (
    <div className="border p-4 rounded-xl mb-4 bg-white dark:bg-neutral-900">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{course["Course Title"]}</h3>
          <p className="text-sm text-gray-500">{course["Course ID"]}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* CONDITIONAL RENDER: Admin sees X, Student sees + */}
          {currentUser?.isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewRoster(course._id)}
                className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg"
              >
                {showRoster ? "Hide Roster" : "View Roster"}
              </button>

              {/* Admin 'X' button to delete course */}
              <button
                onClick={() => handleDeleteCourse(course._id)}
                className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 font-bold"
                title="Delete Course"
              >
                X
              </button>
            </div>
          ) : (
            /* Student '+' button to enroll */
            <button
              onClick={() => handleEnroll(course._id)}
              className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 font-bold"
              title="Enroll in Course"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Admin Roster Dropdown */}
      {showRoster && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
          <h4 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-300">
            Enrolled Students: {roster.length}
          </h4>
          {roster.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {roster.map((student) => (
                <li key={student._id}>
                  {student.name || student.username} ({student.email})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-gray-500">
              No students enrolled yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
