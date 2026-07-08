import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaPlus, FaTrash } from "react-icons/fa";

export function Signup() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [rosters, setRosters] = useState({});
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const handleCourseAdded = (event) => {
      const newCourse = event.detail;
      setCourses((prevCourses) => [...prevCourses, newCourse]);
    };
    window.addEventListener("courseAdded", handleCourseAdded);
    return () => window.removeEventListener("courseAdded", handleCourseAdded);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, scheduleRes, userRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/courses`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/auth/my-schedule`, {
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" }),
        ]);

        if (!coursesRes.ok) throw new Error("Failed to fetch courses.");

        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        // If the user is logged in, grab their schedule and profile
        if (scheduleRes.ok && userRes.ok) {
          const scheduleData = await scheduleRes.json();
          const userData = await userRes.json();

          setEnrolledIds(scheduleData.map((course) => course._id));
          setCurrentUser(userData.user); // Save the user to check if they are Admin
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // =====================================
  // STUDENT FUNCTIONS
  // =====================================
  const handleAddCourse = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/add-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || errorData.message || "Failed to add course.",
          );
        } else {
          throw new Error(
            "Server crashed! Check your Node.js backend terminal.",
          );
        }
      }

      setEnrolledIds((prevIds) => [...prevIds, courseId]);
      setCourses((prevCourses) =>
        prevCourses.map((course) => {
          if (course._id === courseId) {
            return {
              ...course,
              enrolledStudents: [
                ...(course.enrolledStudents || []),
                "new-student",
              ],
            };
          }
          return course;
        }),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // =====================================
  // ADMIN FUNCTIONS
  // =====================================
  const handleDeleteCourse = async (courseId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this course?",
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete course");

      // Remove it from the table instantly
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleRoster = async (courseId) => {
    // Make sure the dropdown is open so they can see the roster
    if (expandedRow !== courseId) setExpandedRow(courseId);

    // If it's already fetched and open, just hide it
    if (rosters[courseId]) {
      const newRosters = { ...rosters };
      delete newRosters[courseId];
      setRosters(newRosters);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/courses/${courseId}/students`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to fetch roster");

      const data = await res.json();
      setRosters({ ...rosters, [courseId]: data });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 w-full bg-gray-50 dark:bg-neutral-950/90 px-8 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white my-2 transition-colors duration-300">
        Course Catalog
      </h1>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="p-2 pl-4 mb-4 rounded-2xl my-1 border border-transparent bg-neutral-200 dark:bg-neutral-700/50 hover:bg-gray-300 dark:hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 outline-none transition-all w-1/2 text-gray-900 dark:text-white"
        placeholder="Search by ID or Name..."
      />

      {isLoading && (
        <p className="text-gray-900 dark:text-white mb-4">Loading courses...</p>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!isLoading && !error && (
        <div className="w-full max-w-5xl overflow-x-auto rounded-xl shadow-lg">
          <table className="w-full table-fixed text-left text-gray-700 dark:text-neutral-300 border-collapse transition-colors duration-300">
            <thead className="bg-gray-200 dark:bg-neutral-900 text-gray-800 dark:text-neutral-100 uppercase text-sm transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 w-[15%]">ID</th>
                <th className="px-6 py-4 w-[25%]">Name</th>
                <th className="px-6 py-4 w-[15%]">Classroom</th>
                <th className="px-6 py-4 w-[15%]">Credits</th>
                <th className="px-6 py-4 w-[15%]">Cost</th>
                <th className="px-6 py-4 w-[20%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800/50 divide-y divide-gray-200 dark:divide-neutral-700/50 transition-colors duration-300">
              {courses
                .filter((cls) => {
                  const search = searchQuery.toLowerCase();
                  const name = cls["Course Title"]?.toLowerCase() || "";
                  const id = cls["Course ID"]?.toLowerCase() || "";
                  return name.includes(search) || id.includes(search);
                })
                .map((cls) => (
                  <React.Fragment key={cls._id}>
                    {/* MAIN ROW */}
                    <tr className="hover:bg-gray-100 dark:hover:bg-neutral-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {cls["Course ID"]}
                      </td>
                      <td className="px-6 py-4">{cls["Course Title"]}</td>
                      <td className="px-6 py-4">{cls["Classroom Number"]}</td>
                      <td className="px-6 py-4">{cls["Credit Hours"]}</td>
                      <td className="px-6 py-4">{cls["Tuition Cost"]}</td>

                      {/* ACTIONS COLUMN */}
                      <td className="px-6 py-4 flex gap-3 justify-center items-center">
                        <button
                          onClick={() => toggleRow(cls._id)}
                          className="p-2 cursor-pointer text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full transition-all outline-none"
                          title={
                            expandedRow === cls._id
                              ? "Hide Details"
                              : "Show Details"
                          }
                        >
                          {expandedRow === cls._id ? (
                            <FaChevronUp size={18} />
                          ) : (
                            <FaChevronDown size={18} />
                          )}
                        </button>

                        {/* CONDITIONAL RENDERING: Admin vs Student */}
                        {currentUser?.isAdmin ? (
                          <>
                            <button
                              onClick={() => handleToggleRoster(cls._id)}
                              className="px-3 py-1 text-sm cursor-pointer bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-xl transition-all font-bold"
                            >
                              {rosters[cls._id] ? "Hide Roster" : "Roster"}
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(cls._id)}
                              className="p-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-full transition-all outline-none shadow-md hover:scale-105"
                              title="Delete Course"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        ) : /* Standard User View */
                        enrolledIds.includes(cls._id) ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full text-xs font-bold tracking-wide shadow-sm">
                            Enrolled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddCourse(cls._id)}
                            className="p-2 cursor-pointer bg-rose-900 hover:bg-rose-800 text-white rounded-full transition-all outline-none shadow-md hover:shadow-lg hover:scale-105"
                            title="Add Course"
                          >
                            <FaPlus size={16} />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* DETAILS ROW */}
                    {expandedRow === cls._id && (
                      <tr className="bg-gray-100 dark:bg-neutral-900/60 transition-all">
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-sm border-t border-gray-200 dark:border-neutral-700/50"
                        >
                          <div className="flex flex-col gap-2">
                            <p>
                              <span className="font-bold text-gray-900 dark:text-white">
                                Course Description:{" "}
                              </span>
                              {cls["Course Description"] ||
                                cls.courseDescription ||
                                "No description provided."}
                            </p>
                            <p>
                              <span className="font-bold text-gray-900 dark:text-white">
                                Capacity:{" "}
                              </span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                {cls.enrolledStudents
                                  ? cls.enrolledStudents.length
                                  : 0}
                              </span>{" "}
                              / {cls.capacity || cls["Capacity"] || 30}
                            </p>

                            {/* ADMIN ROSTER VIEW (Appears inside the expanded row) */}
                            {currentUser?.isAdmin && rosters[cls._id] && (
                              <div className="mt-3 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-100 dark:border-neutral-700">
                                  Enrolled Students ({rosters[cls._id].length})
                                </h4>
                                {rosters[cls._id].length > 0 ? (
                                  <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                                    {rosters[cls._id].map((student) => (
                                      <li key={student._id}>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {student.name || student.username}
                                        </span>{" "}
                                        <span className="text-xs text-gray-400">
                                          ({student.email})
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                                    No students currently enrolled.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

              {courses.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
