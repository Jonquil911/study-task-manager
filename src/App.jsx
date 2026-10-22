import React, { useEffect, useState } from "react";
import { getItemsList, getItem, createItem, updateItem, deleteItem } from "./api/fakeApi.js";
import TaskForm from "./components/TaskForm.jsx";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [listError, setListError] = useState("");
  const [reload, setReload] = useState(0);

  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");
  const [detailError, setDetailError] = useState("");
  const [detailFor, setDetailFor] = useState(null);
  const [retryDetails, setRetryDetails] = useState(0);

  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let ignore = false;
    setListStatus("loading");

    getItemsList("?limit=1000")
      .then((result) => {
        if (ignore) return;
        setTasks(result.data);
        setListStatus("success");
      })
      .catch((error) => {
        if (ignore) return;
        setListError(error.message);
        setListStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [reload]);

  useEffect(() => {
    let ignore = false;
    setDetails(null);
    setDetailFor(selectedId);

    if (selectedId === null) {
      setDetailStatus("idle");
      return () => {
        ignore = true;
      };
    }

    setDetailStatus("loading");
    getItem(selectedId)
      .then((item) => {
        if (ignore) return;
        setDetails(item);
        setDetailStatus("success");
      })
      .catch((error) => {
        if (ignore) return;
        setDetailError(error.message);
        setDetailStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [selectedId, retryDetails]);

  function refreshList() {
    setReload((previous) => previous + 1);
  }

  async function saveTask(form) {
    if (saving || !modal) return;
    const editingId = modal.task?.id ?? null;
    setSaving(true);
    setNotice(null);

    if (editingId === null) {
      let createdId = null;
      try {
        const created = await createItem({ name: form.name, description: form.description });
        createdId = created.id;
        await updateItem(createdId, {
          subject: form.subject,
          priority: form.priority,
          dueDate: form.dueDate,
          estimatedHours: form.estimatedHours,
          status: "To Do",
        });
        setNotice({ type: "success", text: "Task created." });
        setModal(null);
        setSelectedId(createdId);
        refreshList();
      } catch (error) {
        if (createdId !== null) {
          setModal(null);
          setSelectedId(createdId);
          refreshList();
          setNotice({ type: "error", text: "Task was created, but some fields were not saved. Please use Edit to complete them." });
        } else {
          setNotice({ type: "error", text: error.message });
        }
      } finally {
        setSaving(false);
      }
      return;
    }

    try {
      const updated = await updateItem(editingId, form);
      setDetails((current) => current?.id === editingId ? updated : current);
      setModal(null);
      setNotice({ type: "success", text: "Task updated." });
      refreshList();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function completeTask() {
    if (saving || !details || details.id !== selectedId) return;
    const id = details.id;
    const status = details.status === "Completed" ? "To Do" : "Completed";
    setSaving(true);
    setNotice(null);

    try {
      const updated = await updateItem(id, { status });
      setDetails((current) => current?.id === id ? updated : current);
      setTasks((current) => current.map((task) => task.id === id ? updated : task));
      setNotice({ type: "success", text: "Status updated." });
      refreshList();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function removeTask() {
    if (saving || !details || details.id !== selectedId) return;
    const id = details.id;
    if (!window.confirm("Delete this task?")) return;
    setSaving(true);
    setNotice(null);

    try {
      await deleteItem(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      setSelectedId((current) => current === id ? null : current);
      setNotice({ type: "success", text: "Task deleted." });
      refreshList();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  const showDetails = detailStatus === "success" && details?.id === selectedId;
  const showDetailError = detailStatus === "error" && detailFor === selectedId;

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>Study Task Manager</h1>
          <p>Manage your study assignments.</p>
        </div>
        <button disabled={saving} onClick={() => { setNotice(null); setModal({ task: null }); }}>+ Add task</button>
      </header>

      {notice && (
        <div className={`notice ${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button className="text-button" onClick={() => setNotice(null)}>Close</button>
        </div>
      )}

      <div className="layout">
        <section className="panel">
          <div className="panel-title">
            <h2>Tasks</h2>
            <button className="secondary" onClick={refreshList}>Reload</button>
          </div>

          {listStatus === "loading" && <p className="muted">Loading tasks...</p>}
          {listStatus === "error" && (
            <div role="alert">
              <p className="error-text">{listError}</p>
              <button className="secondary" onClick={refreshList}>Try again</button>
            </div>
          )}
          {listStatus === "success" && tasks.length === 0 && <p className="muted">No tasks yet. Click Add task.</p>}
          {listStatus === "success" && tasks.map((task) => (
            <button
              key={task.id}
              className={`task ${selectedId === task.id ? "selected" : ""}`}
              onClick={() => setSelectedId(task.id)}
            >
              <strong>{task.name}</strong>
              <small>{task.subject || "General"} · {task.status || "To Do"}</small>
            </button>
          ))}
        </section>

        <section className="panel">
          <div className="panel-title"><h2>Details</h2></div>
          {selectedId === null && <p className="muted">Select a task to see its details.</p>}
          {selectedId !== null && (!showDetails && !showDetailError) && <p className="muted">Loading details...</p>}
          {selectedId !== null && showDetailError && (
            <div role="alert">
              <p className="error-text">{detailError}</p>
              <button className="secondary" onClick={() => setRetryDetails((previous) => previous + 1)}>Try again</button>
            </div>
          )}
          {selectedId !== null && showDetails && (
            <>
              <h3>{details.name}</h3>
              <p className="description">{details.description || "No description"}</p>
              <dl className="fields">
                <div><dt>Subject</dt><dd>{details.subject || "Not set"}</dd></div>
                <div><dt>Priority</dt><dd>{details.priority || "Not set"}</dd></div>
                <div><dt>Due date</dt><dd>{details.dueDate || "Not set"}</dd></div>
                <div><dt>Estimated hours</dt><dd>{details.estimatedHours ?? "Not set"}</dd></div>
                <div><dt>Status</dt><dd>{details.status || "To Do"}</dd></div>
              </dl>
              <div className="buttons">
                <button disabled={saving} onClick={completeTask}>{saving ? "Please wait..." : details.status === "Completed" ? "Reopen" : "Complete"}</button>
                <button className="secondary" disabled={saving} onClick={() => { setNotice(null); setModal({ task: details }); }}>Edit</button>
                <button className="danger" disabled={saving} onClick={removeTask}>Delete</button>
              </div>
            </>
          )}
        </section>
      </div>

      {modal && (
        <TaskForm
          key={modal.task?.id ?? "new"}
          task={modal.task}
          saving={saving}
          error={notice?.type === "error" ? notice.text : ""}
          onSave={saveTask}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}
