import React, { useState } from "react";

export default function TaskForm({ task, saving, error, onSave, onClose }) {
  const [form, setForm] = useState({
    name: task?.name || "",
    description: task?.description || "",
    subject: task?.subject || "",
    priority: task?.priority || "Medium",
    dueDate: task?.dueDate || "",
    estimatedHours: task?.estimatedHours ?? 1,
  });

  function change(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
      estimatedHours: Number(form.estimatedHours),
    });
  }

  return (
    <div className="overlay">
      <form className="form" onSubmit={submit}>
        <h2>{task ? "Edit task" : "New task"}</h2>
        {error && <p role="alert" className="error-text">{error}</p>}
        <label>
          Name
          <input required value={form.name} disabled={saving} onChange={(e) => change("name", e.target.value)} />
        </label>
        <label>
          Description
          <textarea required rows="3" value={form.description} disabled={saving} onChange={(e) => change("description", e.target.value)} />
        </label>
        <label>
          Subject
          <input required value={form.subject} disabled={saving} onChange={(e) => change("subject", e.target.value)} />
        </label>
        <label>
          Priority
          <select value={form.priority} disabled={saving} onChange={(e) => change("priority", e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <label>
          Due date
          <input type="date" required value={form.dueDate} disabled={saving} onChange={(e) => change("dueDate", e.target.value)} />
        </label>
        <label>
          Estimated hours
          <input type="number" required min="0.5" step="0.5" value={form.estimatedHours} disabled={saving} onChange={(e) => change("estimatedHours", e.target.value)} />
        </label>
        <div className="buttons">
          <button type="submit" disabled={saving || !form.name.trim() || !form.description.trim() || !form.subject.trim()}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" className="secondary" disabled={saving} onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
