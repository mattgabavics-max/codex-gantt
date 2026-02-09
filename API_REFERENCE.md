# API Reference

## Authentication
### POST /api/auth/register
**Body**
```
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**
```
{ "token": "jwt" }
```

### POST /api/auth/login
**Body**
```
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**
```
{ "token": "jwt" }
```

## Projects
### GET /api/projects
**Query**
```
page=1&pageSize=20
```
**Response**
```
{
  "data": [Project],
  "page": 1,
  "pageSize": 20,
  "total": 42
}
```

### POST /api/projects
**Body**
```
{ "name": "Project name", "isPublic": false }
```
**Response**
```
{ "project": Project }
```

### GET /api/projects/:id
**Response**
```
{ "project": Project, "tasks": [Task] }
```

### PUT /api/projects/:id
**Body**
```
{ "name": "Updated name", "isPublic": true }
```
**Response**
```
{ "project": Project }
```

### DELETE /api/projects/:id
**Response**
```
204 No Content
```

## Versions
### GET /api/projects/:id/versions
**Query**
```
page=1&pageSize=20
```
**Response**
```
{
  "data": [ProjectVersion],
  "page": 1,
  "pageSize": 20,
  "total": 10
}
```

### POST /api/projects/:id/versions
**Body**
```
{ "snapshotData": { "note": "manual" } }
```
**Response**
```
{ "version": ProjectVersion }
```

## Tasks
### POST /api/projects/:projectId/tasks
**Body**
```
{
  "name": "Task name",
  "startDate": "2026-02-10",
  "endDate": "2026-02-12",
  "color": "#5c7cfa",
  "position": 1,
  "snapshot": false,
  "snapshotData": {}
}
```
**Response**
```
{ "task": Task }
```

### PUT /api/tasks/:id
**Body**
```
{
  "name": "Updated name",
  "startDate": "2026-02-11",
  "endDate": "2026-02-13"
}
```
**Response**
```
{ "task": Task }
```

### DELETE /api/tasks/:id
**Response**
```
204 No Content
```

### PATCH /api/tasks/:id/position
**Body**
```
{ "position": 2 }
```
**Response**
```
{ "task": Task }
```

### PATCH /api/projects/:projectId/tasks/bulk
**Body**
```
{
  "tasks": [
    { "id": "task-1", "position": 1 },
    { "id": "task-2", "startDate": "2026-02-12" }
  ],
  "snapshot": true
}
```
**Response**
```
{ "tasks": [Task] }
```

## Share Links
### POST /api/projects/:id/share
**Body**
```
{ "accessType": "readonly", "expiresIn": 3600 }
```
**Response**
```
{ "link": ShareLink }
```

### GET /api/share/:token
**Response**
```
{ "accessType": "readonly", "project": Project, "tasks": [Task] }
```

### DELETE /api/projects/:id/share/:linkId
**Response**
```
204 No Content
```

