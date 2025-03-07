# School Management API

This is a REST API for managing schools, including adding new schools and retrieving a list of schools based on user location.

## Base URL
https://school-managment-1-sqsz.onrender.com

## Endpoints

### 1. Add a School
**Endpoint:**
```
POST /addSchool
```

**Description:** Adds a new school to the database.

**Request Headers:**
- Content-Type: multipart/form-data

**Request Parameters (Form Data):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | Yes | Name of the school |
| address | String | Yes | Address of the school |
| latitude | Float | Yes | Latitude coordinate (-90 to 90) |
| longitude | Float | Yes | Longitude coordinate (-180 to 180) |

**Example Request:**
```bash
curl -X POST "https://school-managment-1-sqsz.onrender.com/addSchool" \
     -H "Content-Type: multipart/form-data" \
     -F "name=ABC School" \
     -F "address=123 Main St, City" \
     -F "latitude=40.7128" \
     -F "longitude=-74.0060"
```

**Response:**
```json
{
  "message": "School added successfully",
  "schoolId": 1
}
```

### 2. List Schools
**Endpoint:**
```
GET /listSchools
```

**Description:** Retrieves a list of schools sorted by proximity to the given location.

**Request Headers:**
- Content-Type: application/x-www-form-urlencoded

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | Float | Yes | User's current latitude (-90 to 90) |
| longitude | Float | Yes | User's current longitude (-180 to 180) |

**Example Request:**
```bash
curl -X GET "https://school-managment-1-sqsz.onrender.com/listSchools?latitude=40.7128&longitude=-74.0060"
```

**Response:**
```json
{
  "count": 2,
  "schools": [
    {
      "id": 1,
      "name": "ABC School",
      "address": "123 Main St, City",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "distance": 0.0
    },
    {
      "id": 2,
      "name": "XYZ School",
      "address": "456 Elm St, City",
      "latitude": 40.7328,
      "longitude": -74.0160,
      "distance": 2.3
    }
  ]
}
```

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/school-management.git
cd school-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in a `.env` file

4. Run the server:
```bash
node app.js
```

## Technologies Used
- Node.js
- Express.js
- MySQL2
- Body-parser
- Express-validator

## Author
Mohd Farhan Khan