const fs = require('fs');
const path = require("path");
const { StudentData } = require("../models");

async function updateCSVFile(userId) {
    try {
        // Retrieve data from the database for the specific user
        const students = await StudentData.findAll({
            where: { userId } // Filter students based on the userId
        });

        // Create header for CSV
        let csvContent = "Student id,Enrollment No.,Student Name,Attendance\n";

        // Iterate over each student and append their data to CSV
        students.forEach(student => {
            csvContent += `${student.id},${student.Student_enroll},${student.StudentName},${student.attendence}\n`;
        });
        const filePath = path.join(__dirname, '../public/Data', `students_${userId}.csv`)
        // Write CSV content to file
        fs.writeFileSync(filePath, csvContent);

        console.log('CSV file updated successfully');
    } catch (err) {
        console.error('Error updating CSV file:', err);
    }
}

module.exports = updateCSVFile;
