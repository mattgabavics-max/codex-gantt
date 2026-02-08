import "./index.css";

const sampleTasks = [
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
];

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <p className="app__eyebrow">Codex Gantt</p>
        <h1>Gantt chart workspace</h1>
        <p className="app__subtitle">
          Frontend and backend are wired in a monorepo. Replace sample data with
          your API feed when ready.
        </p>
      </header>
      <section className="app__card">
        <h2>Sample tasks</h2>
        <ul className="task-list">
          {sampleTasks.map((task) => (
            <li key={task.id} className="task-list__item">
              <div className="task-list__name">{task.name}</div>
              <div className="task-list__dates">
                {task.start} → {task.end}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
