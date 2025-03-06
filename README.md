School Management API Setup Guide
Prerequisites

Node.js installed
MySQL server installed and running
npm (Node Package Manager)

Setup Instructions
1. Create Project Folder and Initialize
bashCopymkdir school-management-api
cd school-management-api
npm init -y
2. Install Required Dependencies
bashCopynpm install express mysql2 body-parser express-validator
3. Create MySQL Database
sqlCopyCREATE DATABASE school_management;
USE school_management;
4. Run the Application
bashCopynode app.js
The server will start on port 3000 (or the port specified in your environment variables).
API Documentation
1. Add School API
Endpoint: /addSchool
Method: POST
Content-Type: application/json
Request Body:
jsonCopy{
  "name": "ABC School",
  "address": "123 Education St, City",
  "latitude": 40.7128,
  "longitude": -74.0060
}
Success Response:
jsonCopy{
  "message": "School added successfully",
  "schoolId": 1
}
Error Response:
jsonCopy{
  "errors": [
    {
      "location": "body",
      "msg": "School name is required",
      "param": "name"
    }
  ]
}
2. List Schools API
Endpoint: /listSchools
Method: GET
Parameters:

latitude (float): User's latitude
longitude (float): User's longitude

Example Request:
CopyGET /listSchools?latitude=40.7128&longitude=-74.0060
Success Response:
jsonCopy{
  "count": 2,
  "schools": [
    {
      "id": 1,
      "name": "ABC School",
      "address": "123 Education St, City",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "distance": 0
    },
    {
      "id": 2,
      "name": "XYZ School",
      "address": "456 Learning Ave, Town",
      "latitude": 40.7300,
      "longitude": -74.0200,
      "distance": 2.1532
    }
  ]
}
Testing the API
Using cURL

Add a school:

bashCopycurl -X POST http://localhost:3000/addSchool \
  -H "Content-Type: application/json" \
  -d '{"name":"Central High School","address":"100 Main St, Cityville","latitude":40.7128,"longitude":-74.0060}'

List schools by proximity:

bashCopycurl "http://localhost:3000/listSchools?latitude=40.7000&longitude=-74.0000"
Using Postman

For adding a school:

Set method to POST
Enter URL: http://localhost:3000/addSchool
In Headers tab, add Content-Type: application/json
In Body tab, select "raw" and enter JSON with school details
Click Send


For listing schools:

Set method to GET
Enter URL: http://localhost:3000/listSchools?latitude=40.7000&longitude=-74.0000
Click Send