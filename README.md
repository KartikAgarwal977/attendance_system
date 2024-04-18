# Project Setup

## Requirements : 
* Node.js
* XAMPP (or any other MySQL server)
* npm (Node Package Manager)

## Setup Steps:

1. Install Node.js :
   * Download and install Node.js from the <a href="https://nodejs.org/">official website</a>
2. Install XAMPP:
   * Download and install XAMPP from the <a href="https://www.apachefriends.org/download.html">official website.
   * Start the Apache and MySQL services in XAMPP control panel.
3. Clone the Repository:
   ``` bash
   git clone  https://github.com/KartikAgarwal977/attendance_system.git
   cd attendance_system
   ```
4. Install Dependencies:
   ``` bash
    npm install
   ```
5. Database Setup
   * Open Xampp control panel and start MySQL service.
   * Create a new database in phpMyAdmin or any other MySQL client.
6. Configure Sequelize:
   * Open config/config.json file.
   * Update the database configuration with your MySQL database credentials.
7. Run Migrations:

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```
Usage:

* After completing the setup, you can run the project using:
```bash
npm start
```
* Access the application in your web browser at http://localhost:3000.
### Additional Notes:

* Make sure your XAMPP server is running before starting the application.
* You may need to adjust firewall settings to allow connections to the MySQL server.
* For production deployment, consider configuring environment variables and securing sensitive information.
* Refer to the project documentation or source code for any further customization or usage instructions.

