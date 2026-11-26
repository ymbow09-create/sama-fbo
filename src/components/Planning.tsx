
import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Clock,
} from 'lucide-react'
import './Planning.css'

type TaskCategory = 'Études' | 'Forever' | 'Personnel'

type Task = {
  id: string
  title: string
  date: string
  time: string
  category: TaskCategory
  completed: boolean
}

const STORAGE_KEY = 'sama-fbo-planning'

function getLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getInitialTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function Planning() {
  const today = new Date()

  const [tasks, setTasks] = useState<Task[]>(getInitialTasks)
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [selectedDate, setSelectedDate] = useState(getLocalDate(today))
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [taskDate, setTaskDate] = useState(getLocalDate(today))
  const [taskTime, setTaskTime] = useState('09:00')
  const [category, setCategory] = useState<TaskCategory>('Études')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    )

    const mondayOffset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate()

    return [
      ...Array.from({ length: mondayOffset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ]
  }, [currentMonth])

  const selectedTasks = tasks
    .filter((task) => task.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.length - completedCount

  function changeMonth(direction: number) {
    setCurrentMonth((previous) =>
      new Date(
        previous.getFullYear(),
        previous.getMonth() + direction,
        1,
      ),
    )
  }

  function openNewTask() {
    setTitle('')
    setTaskDate(selectedDate)
    setTaskTime('09:00')
    setCategory('Études')
    setShowForm(true)
  }

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      date: taskDate,
      time: taskTime,
      category,
      completed: false,
    }

    setTasks((previous) => [...previous, newTask])
    setSelectedDate(taskDate)

    const parsedDate = new Date(`${taskDate}T12:00:00`)
    setCurrentMonth(
      new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1),
    )

    setShowForm(false)
  }

  function toggleTask(id: string) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task,
      ),
    )
  }

  function deleteTask(id: string) {
    setTasks((previous) => previous.filter((task) => task.id !== id))
  }

  function hasTasks(day: number) {
    const date = getLocalDate(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      ),
    )
    return tasks.some((task) => task.date === date)
  }

  return (
    <div className="planning-page">
      <section className="planning-header">
        <div>
          <span className="eyebrow">ORGANISATION PERSONNELLE</span>
          <h1>Mon Planning</h1>
          <p>Organisez votre temps, vos études et vos activités.</p>
        </div>

        <button className="planning-add-button" onClick={openNewTask}>
          <Plus size={18} />
          Nouvelle activité
        </button>
      </section>

      <section className="planning-stats">
        <article className="planning-stat-card">
          <span>Total des activités</span>
          <strong>{tasks.length}</strong>
        </article>
        <article className="planning-stat-card">
          <span>À réaliser</span>
          <strong>{pendingCount}</strong>
        </article>
        <article className="planning-stat-card">
          <span>Terminées</span>
          <strong>{completedCount}</strong>
        </article>
      </section>

      <section className="planning-layout">
        <div className="planning-calendar-panel">
          <div className="planning-month-header">
            <div>
              <CalendarDays size={20} />
              <h2>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
            </div>

            <div className="planning-month-controls">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Mois précédent"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Mois suivant"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <div className="planning-calendar">
            {weekdays.map((day) => (
              <div className="planning-weekday" key={day}>{day}</div>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div className="planning-empty-day" key={`empty-${index}`} />
              }

              const date = getLocalDate(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day,
                ),
              )

              const isToday = date === getLocalDate(today)
              const isSelected = date === selectedDate

              return (
                <button
                  type="button"
                  key={date}
                  className={[
                    'planning-day',
                    isToday ? 'today' : '',
                    isSelected ? 'selected' : '',
                    hasTasks(day) ? 'has-tasks' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{day}</span>
                  {hasTasks(day) && <i />}
                </button>
              )
            })}
          </div>

          <div className="planning-calendar-footer">
            <span><i className="calendar-dot today-dot" /> Aujourd'hui</span>
            <span><i className="calendar-dot activity-dot" /> Activité prévue</span>
          </div>
        </div>

        <div className="planning-tasks-panel">
          <div className="planning-tasks-header">
            <div>
              <span className="eyebrow">PROGRAMME DU JOUR</span>
              <h2>
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  'fr-FR',
                  { day: 'numeric', month: 'long', year: 'numeric' },
                )}
              </h2>
            </div>
            <button
              type="button"
              className="planning-small-add"
              onClick={openNewTask}
              aria-label="Ajouter une activité"
            >
              <Plus size={19} />
            </button>
          </div>

          {selectedTasks.length === 0 ? (
            <div className="planning-empty">
              <CalendarDays size={34} />
              <h3>Aucune activité prévue</h3>
              <p>Ajoutez une activité pour organiser cette journée.</p>
              <button type="button" onClick={openNewTask}>
                Ajouter une activité
              </button>
            </div>
          ) : (
            <div className="planning-task-list">
              {selectedTasks.map((task) => (
                <article
                  className={`planning-task ${task.completed ? 'completed' : ''}`}
                  key={task.id}
                >
                  <button
                    type="button"
                    className="planning-task-check"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? 'Marquer non terminée' : 'Terminer cette activité'}
                  >
                    {task.completed && <Check size={15} />}
                  </button>

                  <div className="planning-task-content">
                    <div className="planning-task-time">
                      <Clock size={13} />
                      {task.time}
                    </div>
                    <h3>{task.title}</h3>
                    <span className={`planning-category ${task.category.toLowerCase()}`}>
                      {task.category}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="planning-delete-button"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Supprimer cette activité"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {showForm && (
        <div className="planning-modal-overlay">
          <form className="planning-form" onSubmit={addTask}>
            <div className="planning-form-header">
              <div>
                <span className="eyebrow">NOUVELLE ORGANISATION</span>
                <h2>Ajouter une activité</h2>
              </div>
              <button
                type="button"
                className="planning-close-button"
                onClick={() => setShowForm(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <label htmlFor="planning-title">Nom de l'activité</label>
            <input
              id="planning-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex : Réviser la comptabilité"
              required
              autoFocus
            />

            <div className="planning-form-row">
              <div>
                <label htmlFor="planning-date">Date</label>
                <input
                  id="planning-date"
                  type="date"
                  value={taskDate}
                  onChange={(event) => setTaskDate(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="planning-time">Heure</label>
                <input
                  id="planning-time"
                  type="time"
                  value={taskTime}
                  onChange={(event) => setTaskTime(event.target.value)}
                  required
                />
              </div>
            </div>

            <label htmlFor="planning-category">Catégorie</label>
            <select
              id="planning-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as TaskCategory)}
            >
              <option value="Études">Études</option>
              <option value="Forever">Activité Forever</option>
              <option value="Personnel">Personnel</option>
            </select>

            <div className="planning-form-actions">
              <button
                type="button"
                className="planning-cancel-button"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </button>
              <button type="submit" className="planning-save-button">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Planning
