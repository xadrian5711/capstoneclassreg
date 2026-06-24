import React from "react";

const fakeClasses = [
  {
    id: 1,
    code: "CS 101",
    name: "Intro to Computer Science",
    instructor: "Dr. Smith",
    schedule: "MWF 10:00 AM",
    room: "Lab 4",
  },
  {
    id: 2,
    code: "MATH 201",
    name: "Calculus I",
    instructor: "Prof. Johnson",
    schedule: "TTh 1:00 PM",
    room: "Room 102",
  },
  {
    id: 3,
    code: "ENG 105",
    name: "English Composition",
    instructor: "Ms. Davis",
    schedule: "MW 2:30 PM",
    room: "Room 304",
  },
  {
    id: 4,
    code: "HIST 302",
    name: "Modern History",
    instructor: "Dr. Brown",
    schedule: "TTh 9:30 AM",
    room: "Room 210",
  },
];

export function Signup() {
  return (
    <div className="flex flex-col items-center flex-1 w-full bg-gray-50 dark:bg-neutral-950/90 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white my-2 transition-colors duration-300">
        Select the classes u want to take!
      </h1>
      <input
        type="input"
        className="p-2 pl-4 mb-4 rounded-2xl my-1 border border-transparent bg-neutral-700/50 hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 outline-none transition-all w-1/2"
        placeholder="Search"
      ></input>
      <div className="w-full max-w-5xl overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full text-left text-gray-700 dark:text-neutral-300 border-collapse transition-colors duration-300">
          <thead className="bg-gray-200 dark:bg-neutral-900 text-gray-800 dark:text-neutral-100 uppercase text-sm transition-colors duration-300">
            <tr>
              <th className="px-6 py-4">Course Code</th>
              <th className="px-6 py-4">Course Name</th>
              <th className="px-6 py-4">Instructor</th>
              <th className="px-6 py-4">Schedule</th>
              <th className="px-6 py-4">Room</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800/50 divide-y divide-gray-200 dark:divide-neutral-700/50 transition-colors duration-300">
            {fakeClasses.map((cls) => (
              <tr
                key={cls.id}
                className="hover:bg-gray-100 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {cls.code}
                </td>
                <td className="px-6 py-4">{cls.name}</td>
                <td className="px-6 py-4">{cls.instructor}</td>
                <td className="px-6 py-4">{cls.schedule}</td>
                <td className="px-6 py-4">{cls.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
