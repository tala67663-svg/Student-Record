const fs = require("fs");
const path = require("path");

// 1. Get the average grade of one student
function getAverageGrade(student) {
  if (
    !student ||
    typeof student !== "object" ||
    !Array.isArray(student.grades)
  ) {
    throw new Error(
      "Invalid input: student must be a valid student object."
    );
  }

  if (student.grades.length === 0) {
    return 0;
  }

  const validGrades = student.grades.filter(
    (grade) => typeof grade === "number" && Number.isFinite(grade)
  );

  if (validGrades.length === 0) {
    return 0;
  }

  const total = validGrades.reduce((sum, grade) => sum + grade, 0);

  return total / validGrades.length;
}

// 2. Get the top N students based on average grade
function getTopStudents(students, n) {
  if (!Array.isArray(students)) {
    throw new Error("Invalid input: students must be an array.");
  }

  if (
    typeof n !== "number" ||
    !Number.isFinite(n) ||
    n < 0
  ) {
    throw new Error(
      "Invalid input: n must be a non-negative number."
    );
  }

  const sortedStudents = [...students].sort(
    (a, b) => getAverageGrade(b) - getAverageGrade(a)
  );

  return sortedStudents.slice(0, Math.floor(n));
}

// 3. Group students by course
function groupByCourse(students) {
  if (!Array.isArray(students)) {
    throw new Error("Invalid input: students must be an array.");
  }

  return students.reduce((groups, student) => {
    const course =
      typeof student?.course === "string" && student.course.trim() !== ""
        ? student.course.trim()
        : "Unknown Course";

    if (!groups[course]) {
      groups[course] = [];
    }

    groups[course].push(student);
    return groups;
  }, {});
}

// 4. Count enrolled and not enrolled students
function getEnrolledCount(students) {
  if (!Array.isArray(students)) {
    throw new Error("Invalid input: students must be an array.");
  }

  return students.reduce(
    (count, student) => {
      if (student && student.enrolled === true) {
        count.enrolled += 1;
      } else {
        count.notEnrolled += 1;
      }

      return count;
    },
    {
      enrolled: 0,
      notEnrolled: 0
    }
  );
}

// 5. Find a student by name
function findStudent(students, name) {
  if (!Array.isArray(students)) {
    throw new Error("Invalid input: students must be an array.");
  }

  if (typeof name !== "string" || name.trim() === "") {
    return null;
  }

  const searchName = name.trim().toLowerCase();

  return (
    students.find(
      (student) =>
        typeof student?.name === "string" &&
        student.name.trim().toLowerCase() === searchName
    ) || null
  );
}

// 6. Get average grade for every course
function getCourseAverages(students) {
  if (!Array.isArray(students)) {
    throw new Error("Invalid input: students must be an array.");
  }

  const groupedCourses = students.reduce((groups, student) => {
    const course =
      typeof student?.course === "string" && student.course.trim() !== ""
        ? student.course.trim()
        : "Unknown Course";

    if (!groups[course]) {
      groups[course] = [];
    }

    if (Array.isArray(student?.grades) && student.grades.length > 0) {
      const validGrades = student.grades.filter(
        (grade) => typeof grade === "number" && Number.isFinite(grade)
      );

      if (validGrades.length > 0) {
        groups[course].push(...validGrades);
      }
    }

    return groups;
  }, {});

  return Object.entries(groupedCourses)
    .map(([course, grades]) => {
      if (grades.length === 0) {
        return {
          course,
          averageGrade: 0
        };
      }

      const total = grades.reduce((sum, grade) => sum + grade, 0);

      return {
        course,
        averageGrade: total / grades.length
      };
    })
    .sort((a, b) => b.averageGrade - a.averageGrade);
}

// 7. Export the complete summary
function exportSummary(students) {
  if (!Array.isArray(students)) {
    throw new Error("Invalid input: students must be an array.");
  }

  if (students.length === 0) {
    return {
      totalStudents: 0,
      overallAverageGrade: 0,
      topPerformingStudent: null,
      breakdownByCourse: {},
      enrolledVsNotEnrolled: {
        enrolled: 0,
        notEnrolled: 0
      },
      averageGradeByCourse: []
    };
  }

  const allGrades = students.reduce((grades, student) => {
    if (Array.isArray(student?.grades)) {
      const validGrades = student.grades.filter(
        (grade) => typeof grade === "number" && Number.isFinite(grade)
      );

      return grades.concat(validGrades);
    }

    return grades;
  }, []);

  const overallAverageGrade =
    allGrades.length > 0
      ? allGrades.reduce((sum, grade) => sum + grade, 0) /
        allGrades.length
      : 0;

  const topStudent = getTopStudents(students, 1)[0] || null;

  const topPerformingStudent = topStudent
    ? {
        id: topStudent.id,
        name: topStudent.name,
        year: topStudent.year,
        course: topStudent.course,
        enrolled: topStudent.enrolled,
        averageGrade: getAverageGrade(topStudent)
      }
    : null;

  return {
    totalStudents: students.length,
    overallAverageGrade,
    topPerformingStudent,
    breakdownByCourse: groupByCourse(students),
    enrolledVsNotEnrolled: getEnrolledCount(students),
    averageGradeByCourse: getCourseAverages(students)
  };
}

// Main program
function main() {
  try {
    const studentsFile = path.join(__dirname, "students.json");
    const reportFile = path.join(__dirname, "report.json");

    // Read students.json
    let data;

    try {
      data = fs.readFileSync(studentsFile, "utf8");
    } catch (error) {
      throw new Error(
        `Unable to read students.json: ${error.message}`
      );
    }

    // Parse JSON
    let students;

    try {
      students = JSON.parse(data);
    } catch (error) {
      throw new Error(
        `Invalid JSON in students.json: ${error.message}`
      );
    }

    if (!Array.isArray(students)) {
      throw new Error(
        "Invalid data: students.json must contain an array of students."
      );
    }

    // Call all seven required functions
    const topStudents = getTopStudents(students, 3);
    const groupedByCourse = groupByCourse(students);
    const enrolledCount = getEnrolledCount(students);

    const searchName =
      students.length > 0 && typeof students[0].name === "string"
        ? students[0].name
        : "";

    const searchedStudent = findStudent(students, searchName);
    const courseAverages = getCourseAverages(students);
    const summary = exportSummary(students);

    // Display report
    console.log("========================================");
    console.log("       STUDENT RECORDS REPORT");
    console.log("========================================");
    console.log();

    console.log(`Total Students: ${summary.totalStudents}`);
    console.log(
      `Overall Average Grade: ${summary.overallAverageGrade.toFixed(2)}`
    );
    console.log();

    console.log("Top-Performing Students:");

    if (topStudents.length === 0) {
      console.log("No students available.");
    } else {
      topStudents.forEach((student, index) => {
        console.log(
          `${index + 1}. ${student.name} - ${getAverageGrade(student).toFixed(2)}`
        );
      });
    }

    console.log();
    console.log("Students Grouped by Course:");

    const courseNames = Object.keys(groupedByCourse);

    if (courseNames.length === 0) {
      console.log("No courses available.");
    } else {
      courseNames.forEach((course) => {
        console.log(`${course}:`);

        groupedByCourse[course]
          .map((student) => student.name)
          .forEach((studentName) => {
            console.log(`- ${studentName}`);
          });

        console.log();
      });
    }

    console.log("Enrolled vs Not Enrolled:");
    console.log(`Enrolled: ${enrolledCount.enrolled}`);
    console.log(`Not Enrolled: ${enrolledCount.notEnrolled}`);
    console.log();

    console.log("Student Search:");

    if (searchedStudent) {
      console.log(`Student Name: ${searchedStudent.name}`);
      console.log(
        `Average Grade: ${getAverageGrade(searchedStudent).toFixed(2)}`
      );
      console.log(`Course: ${searchedStudent.course}`);
      console.log(`Year: ${searchedStudent.year}`);
      console.log(`Enrolled: ${searchedStudent.enrolled}`);
    } else {
      console.log("No student found.");
    }

    console.log();
    console.log("Average Grade by Course:");

    if (courseAverages.length === 0) {
      console.log("No course averages available.");
    } else {
      courseAverages.forEach((course, index) => {
        console.log(
          `${index + 1}. ${course.course} - ${course.averageGrade.toFixed(2)}`
        );
      });
    }

    console.log();
    console.log("Complete Summary:");
    console.log(JSON.stringify(summary, null, 2));

    // Write report.json
    try {
      fs.writeFileSync(
        reportFile,
        JSON.stringify(summary, null, 2),
        "utf8"
      );
    } catch (error) {
      throw new Error(
        `Unable to write report.json: ${error.message}`
      );
    }

    console.log();
    console.log("========================================");
    console.log("Report successfully saved to report.json");
    console.log("========================================");
  } catch (error) {
    console.error();
    console.error("ERROR:");
    console.error(error.message);
    console.error();
  }
}

main();