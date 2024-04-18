const express = require("express")
const app = express()
const path = require("path");
const { user, StudentData, AttendanceRecord } = require("./models")
app.set("view engine", "ejs")
const session = require("express-session")
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const { where } = require("sequelize")
const updateCSVFile = require('./src/ExcelUpdate');
app.use(
    session({
      secret: "there_is_a_secret_977",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      },
      resave: true,
      saveUninitialized: true,
    })
  );
app.use(express.static(path.join(__dirname, "public")));
app.use(flash())
app.use(function (req, res, next) {
    res.locals.messages = req.flash();
    next();
})
setInterval(updateCSVFile, 3600000);
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.get("/", async (request, res) => {
    console.log(request.session.user)
    if (request.session.user) {
        updateCSVFile(request.session.user.id)
        const student = await StudentData.findAll({
            where:{
                userId: request.session.user.id
            }
        });
        if (request.accepts("html")) {
            res.render("index", {student,
            userId: request.session.user.id})
        }
    }
    else{
        res.redirect('/login')
    }

})
app.get("/login", (req, res) => {
    res.render("auth", {
        title: "Login",
        ishidden:true ,
        action: "/login",
        buttonname: "login",
        account_status: "Don't Have a Account?New User",
        ref: "/signup"
    })
})

app.post("/login", async (req, res) => {
    if (req.body.email == "") {
        req.flash("error", "Email is required");
        return res.redirect("/login");
    }
    if (req.body.password == "") {
        req.flash("error", "Password is required");
        return res.redirect("/login");
    } 
    try { 
        const User = await user.findOne({
            where: {
                email: req.body.email,
                password: req.body.password
            }
        });
        if (User) {
            req.session.user = User;
            return res.redirect("/");
        } else {
            req.flash("error", "Login failed");
            return res.redirect("/login");
        }
    } catch (err) {
        req.flash("error", "An error occurred");
        console.error(err);
        return res.redirect("/login");
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            res.redirect('/login');
        }
    });
});


app.get("/signup", (req, res) => {
    res.render("auth", {
        title: "Signup",
        ishidden: false,
        action: "/signup",
        buttonname: "signup",
        account_status: "Already Have a Account?",
        ref: "/login"
    })
})
app.post("/signup", async (request, response) => {
    console.log(request.body.name)
    if (request.body.name == "") {
        request.flash("error", "Name is required")
        return response.redirect("/signup");
    }
    if (request.body.email == "") {
        request.flash("error", "email is required")
        return response.redirect("/signup");
    }
    if (request.body.password == "") {
        request.flash("error", "passwordk is required")
        return response.redirect("/signup");
    }
    try {
        const User = await user.create({
            fullName: request.body.name,
            email: request.body.email,
            password: request.body.password
        })
        if (User) {
            request.session.user = User;
            response.redirect("/")
        }
    }
    catch (err) {
        request.flash("error", "Email already exist");
        console.error(err)
        return response.redirect('/signup')
    }
})
app.get("/add_student", (req,res) => {
    if (req.session.user) {
    res.render("addUser", {
        title: "Add Student"
    })
}
else {
    res.redirect("/login")
}
})
app.post("/Student_Data", async (req, res) => {
    if(req.body.studentEnroll === "") {
        req.flash("error", "Enrollment is required");
        return res.redirect("/");
    }
    if(req.body.studentName === "") {
        req.flash("error", "Name is required");
        return res.redirect("/");
    }
    try {
        const existingStudent = await StudentData.findOne({
            where: {
                Student_enroll: req.body.studentEnroll,
                userId: req.session.user.id
            }
        });
    
        // If a student with the same enrollment number exists, display an error
        if (existingStudent) {
            req.flash("error", "Student with this enrollment already exists");
            return res.redirect("/add_student");
        }
        
        var user = req.session.user.id;
        const student = await StudentData.create({
            Student_enroll: req.body.studentEnroll,
            StudentName: req.body.studentName,
            userId: user
        });
        
        req.flash("success", "Student added successfully");
        updateCSVFile();
        console.log("success")
        return res.redirect("/");
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            req.flash("error", "Student with this enrollment already exists");
            console.log("already exists")
            return res.redirect("/add_student");
        }
        
        console.error(error);
        req.flash("error", "Failed to add student");
        console.log("failed")
        return res.redirect("/add_student");
    }
});
app.get("/add_attendence", async (req, res) => {
    if (req.session.user) {
    const students = await StudentData.findAll(
        {
            where:{
                userId: req.session.user.id
            }
        }
    )
    res.render("addAttendence", {
        title : "Add Attendence",
        students
    })
}
else{
    res.redirect("/login")
}
})
app.post("/add_attendence", async (req, res) => {
    try {
        // Validate input
        if (!req.body.attendenceDate) {
            req.flash("error", "Date is required");
            return res.redirect("/add_attendence");
        }
        if (new Date(req.body.attendenceDate) > new Date()){
            req.flash("error", "Date should be present or past only")
            return res.redirect("/add_attendence")
        }

        // Retrieve student details
        const students = await StudentData.findAll();

        // Iterate over students and create attendance records
        for (const student of students) {
            const attendanceStatus = req.body[`status_${student.Student_enroll}`];
            const attendanceRecord = await AttendanceRecord.create({
                Student_enroll: student.Student_enroll,
                date: req.body.attendenceDate,
                status: attendanceStatus || "Absent"
            });

            // Update student's attendance in StudentData table if present
            if (attendanceStatus === "Present") {
                await StudentData.update(
                    { attendence: student.attendence + 1 }, // Increment attendance
                    { where: { Student_enroll: student.Student_enroll, 
                            userId: req.session.user.id 
                    }}
                );
            }
        }

        req.flash("success", "Attendance recorded successfully");
        res.redirect("/");
    } catch (err) {
        console.error("Error recording attendance:", err);
        req.flash("error", "Failed to record attendance");
        res.redirect("/add_attendence");
    }
});

app.get("/checkClass", async (req, res) =>{
    if (req.session.user) {
    try {
        // Find all attendance records with distinct dates
        const attendanceRecord = await AttendanceRecord.findAll({
            attributes: ['date', 'createdAt'],
            group: ['date', 'createdAt'],
            order: [['date', 'ASC']], // Order by date in ascending order
            raw: true // Get raw data instead of instances
        });

        res.render("checkClass", {
            title: "Check Class",
            attendanceRecord
        });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        req.flash("error", "Failed to fetch attendance records");
        res.redirect("/checkClass");
    }
}
else{
    res.redirect("/login");
}
});

module.exports = app