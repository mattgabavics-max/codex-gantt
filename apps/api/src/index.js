const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/tasks", (req, res) => {
  res.json([
    {
      id: "task-1",
      name: "Research",
      start: "2026-02-10",
      end: "2026-02-14"
    },
    {
      id: "task-2",
      name: "Design",
      start: "2026-02-15",
      end: "2026-02-20"
    },
    {
      id: "task-3",
      name: "Build",
      start: "2026-02-21",
      end: "2026-03-05"
    }
  ]);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
