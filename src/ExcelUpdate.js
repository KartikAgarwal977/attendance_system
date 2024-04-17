const fs = require('fs');
const { StudentData } = require("../models");

async function updateCSVFile() {
    try {
        // Retrieve data from the database
        const students = await StudentData.findAll();

        // Create header for CSV
        let csvContent = "Student id,Enrollment No.,Student Name, Attendance\n";

        // Iterate over each student and append their data to CSV
        students.forEach(student => {
            csvContent += `${student.id},${student.Student_enroll},${student.StudentName}, ${student.attendence}\n`;
        });

        // Write CSV content to file
        fs.writeFileSync('D:/uem html/miniproject/student_updates/Data/students.csv', csvContent);

        console.log('CSV file updated successfully');
    } catch (err) {
        console.error('Error updating CSV file:', err);
    }
}

module.exports = updateCSVFile;
