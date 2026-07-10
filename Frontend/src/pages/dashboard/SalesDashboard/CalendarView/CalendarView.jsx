// CalendarView.jsx
import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaSave,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../salesApi";
import { toast } from "react-hot-toast";
import styles from "./CalendarView.module.css";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const emptyForm = {
  title: "",
  date: "",
  time: "",
  type: "meeting",
  description: "",
};

const defaultEvents = [
  {
    _id: "1",
    title: "Demo with Shine Bright",
    date: "2026-06-18",
    time: "10:00 AM",
    type: "meeting",
    description: "",
  },
  {
    _id: "2",
    title: "Follow-up call - Fabricatorz",
    date: "2026-06-18",
    time: "2:00 PM",
    type: "call",
    description: "",
  },
  {
    _id: "3",
    title: "Proposal review - Inky",
    date: "2026-06-20",
    time: "11:00 AM",
    type: "meeting",
    description: "",
  },
  {
    _id: "4",
    title: "Contract signing — Shine Bright",
    date: "2026-06-25",
    time: "3:30 PM",
    type: "important",
    description: "",
  },
];

const typeColors = {
  meeting: "#3498db",
  call: "#f59e0b",
  important: "#e74c3c",
  followup: "#10b981",
};

const CalendarView = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState(defaultEvents);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEv = async () => {
      try {
        const res = await getEvents({ month: month + 1, year });
        if (res.data?.data?.length > 0) setEvents(res.data.data);
      } catch {}
    };
    fetchEv();
  }, [month, year]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const getDateStr = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const eventsForDay = (day) =>
    events.filter((e) => e.date === getDateStr(day));
  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : [];
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const openAdd = (day) => {
    const dateStr = day ? getDateStr(day) : "";
    setForm({ ...emptyForm, date: dateStr });
    setEditEvent(null);
    setModalOpen(true);
  };
  const openEdit = (ev) => {
    setForm({ ...ev });
    setEditEvent(ev);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditEvent(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date)
      return toast.error("Title and date are required");
    setLoading(true);
    try {
      if (editEvent) {
        const res = await updateEvent(editEvent._id, form);
        const updated = res.data?.data || { ...editEvent, ...form };
        setEvents((prev) =>
          prev.map((e) => (e._id === editEvent._id ? updated : e)),
        );
        toast.success("Event updated");
      } else {
        const res = await createEvent(form);
        const newEv = res.data?.data || { ...form, _id: Date.now().toString() };
        setEvents((prev) => [...prev, newEv]);
        toast.success("Event added");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success("Event removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const isToday = (day) => {
    const d = new Date();
    return (
      d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <FaCalendarAlt /> Calendar
        </h2>
        <button className={styles.primaryBtn} onClick={() => openAdd(null)}>
          <FaPlus /> Add Event
        </button>
      </div>

      <div className={styles.calGrid}>
        {/* Upcoming Sidebar */}
        <div className={styles.sidebar}>
          <h3>Upcoming Events</h3>
          <div className={styles.eventList}>
            {upcomingEvents.length === 0 && (
              <p className={styles.noEvents}>No upcoming events</p>
            )}
            {upcomingEvents.map((ev) => (
              <div
                key={ev._id}
                className={styles.eventItem}
                style={{
                  borderLeft: `4px solid ${typeColors[ev.type] || "#810b38"}`,
                }}
              >
                <div className={styles.evDate}>
                  {ev.date?.split("-").slice(1).join("/")}
                </div>
                <div className={styles.evBody}>
                  <span className={styles.evTime}>{ev.time}</span>
                  <span className={styles.evTitle}>{ev.title}</span>
                </div>
                <div className={styles.evActions}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => openEdit(ev)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.delBtn}`}
                    onClick={() => handleDelete(ev._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Day events panel */}
          {selectedDay && (
            <div className={styles.dayPanel}>
              <div className={styles.dayPanelHeader}>
                <h4>
                  {MONTHS[month]} {selectedDay}
                </h4>
                <button
                  className={styles.addDayBtn}
                  onClick={() => openAdd(selectedDay)}
                >
                  <FaPlus />
                </button>
              </div>
              {selectedDayEvents.length === 0 ? (
                <p className={styles.noEvents}>No events — click + to add</p>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className={styles.dayEvent}
                    style={{
                      borderLeft: `3px solid ${typeColors[ev.type] || "#810b38"}`,
                    }}
                  >
                    <span className={styles.evTime}>{ev.time}</span>
                    <span className={styles.evTitle}>{ev.title}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Calendar Main */}
        <div className={styles.calMain}>
          <div className={styles.calHeader}>
            <button className={styles.navBtn} onClick={prevMonth}>
              <FaChevronLeft />
            </button>
            <h3>
              {MONTHS[month]} {year}
            </h3>
            <button className={styles.navBtn} onClick={nextMonth}>
              <FaChevronRight />
            </button>
          </div>
          <div className={styles.weekRow}>
            {DAYS.map((d) => (
              <div key={d} className={styles.weekDay}>
                {d}
              </div>
            ))}
          </div>
          <div className={styles.daysGrid}>
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e-${i}`} className={styles.emptyCell} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayEvs = eventsForDay(day);
              return (
                <div
                  key={day}
                  className={`${styles.dayCell} ${isToday(day) ? styles.today : ""} ${selectedDay === day ? styles.selected : ""} ${dayEvs.length > 0 ? styles.hasEvent : ""}`}
                  onClick={() =>
                    setSelectedDay(selectedDay === day ? null : day)
                  }
                >
                  <span className={styles.dayNum}>{day}</span>
                  {dayEvs.length > 0 && (
                    <div className={styles.dots}>
                      {dayEvs.slice(0, 3).map((ev, i) => (
                        <span
                          key={i}
                          className={styles.dot}
                          style={{
                            background: typeColors[ev.type] || "#810b38",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className={styles.legend}>
            {Object.entries(typeColors).map(([type, color]) => (
              <span key={type} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: color }}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editEvent ? "Edit Event" : "New Event"}</h3>
              <button className={styles.modalClose} onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Event Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Event title"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Time</label>
                  <input
                    value={form.time}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, time: e.target.value }))
                    }
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    {Object.keys(typeColors).map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={3}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                <FaSave />{" "}
                {loading
                  ? "Saving..."
                  : editEvent
                    ? "Update Event"
                    : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
