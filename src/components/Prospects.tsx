
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Search,
  UserPlus,
  Phone,
  CalendarDays,
  MessageSquare,
  Users,
  UserCheck,
  Clock,
  Trash2,
} from 'lucide-react'
import './Prospects.css'

type ContactStatus = 'Nouveau' | 'Intéressé' | 'Client' | 'À relancer'

type Contact = {
  id: string
  name: string
  phone: string
  email: string
  city: string
  status: ContactStatus
  source: string
  nextFollowUp: string
  notes: string
  createdAt: string
}

const STORAGE_KEY = 'sama-fbo-contacts'

function loadContacts(): Contact[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function Prospects() {
  const [contacts, setContacts] = useState<Contact[]>(loadContacts)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  }, [contacts])

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.city.toLowerCase().includes(query)

      const matchesFilter = filter === 'Tous' || contact.status === filter

      return matchesSearch && matchesFilter
    })
  }, [contacts, search, filter])

  const stats = {
    total: contacts.length,
    prospects: contacts.filter((contact) =>
      contact.status === 'Nouveau' || contact.status === 'Intéressé',
    ).length,
    clients: contacts.filter((contact) => contact.status === 'Client').length,
    followUps: contacts.filter((contact) => {
      if (!contact.nextFollowUp) return false
      return contact.nextFollowUp <= new Date().toISOString().slice(0, 10)
    }).length,
  }

  function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    const name = String(data.get('name') || '').trim()
    const phone = String(data.get('phone') || '').trim()

    if (!name || !phone) {
      alert('Le nom et le téléphone sont obligatoires.')
      return
    }

    const contact: Contact = {
      id: crypto.randomUUID(),
      name,
      phone,
      email: String(data.get('email') || '').trim(),
      city: String(data.get('city') || '').trim(),
      status: data.get('status') as ContactStatus,
      source: String(data.get('source') || '').trim(),
      nextFollowUp: String(data.get('nextFollowUp') || ''),
      notes: String(data.get('notes') || '').trim(),
      createdAt: new Date().toISOString(),
    }

    setContacts((previous) => [contact, ...previous])
    setShowForm(false)
    form.reset()
  }

  function updateStatus(id: string, status: ContactStatus) {
    setContacts((previous) =>
      previous.map((contact) =>
        contact.id === id ? { ...contact, status } : contact,
      ),
    )

    setSelectedContact((previous) =>
      previous?.id === id ? { ...previous, status } : previous,
    )
  }

  function deleteContact(id: string) {
    if (!window.confirm('Voulez-vous vraiment supprimer ce contact ?')) return

    setContacts((previous) => previous.filter((contact) => contact.id !== id))
    setSelectedContact(null)
  }

  function updateNotes(id: string, notes: string) {
    setContacts((previous) =>
      previous.map((contact) =>
        contact.id === id ? { ...contact, notes } : contact,
      ),
    )

    setSelectedContact((previous) =>
      previous?.id === id ? { ...previous, notes } : previous,
    )
  }

  function updateFollowUp(id: string, date: string) {
    setContacts((previous) =>
      previous.map((contact) =>
        contact.id === id ? { ...contact, nextFollowUp: date } : contact,
      ),
    )

    setSelectedContact((previous) =>
      previous?.id === id ? { ...previous, nextFollowUp: date } : previous,
    )
  }

  return (
    <div className="prospects-page">
      <header className="prospects-header">
        <div>
          <span className="eyebrow">GESTION COMMERCIALE</span>
          <h1>Prospects & Clients</h1>
          <p>Développez votre réseau et suivez chaque relation commerciale.</p>
        </div>

        <button
          className="prospects-add-button"
          onClick={() => setShowForm(!showForm)}
        >
          <UserPlus size={18} />
          Nouveau contact
        </button>
      </header>

      <section className="prospects-stats">
        <article className="prospect-stat">
          <Users size={21} />
          <span>Total contacts</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="prospect-stat">
          <UserPlus size={21} />
          <span>Prospects</span>
          <strong>{stats.prospects}</strong>
        </article>
        <article className="prospect-stat">
          <UserCheck size={21} />
          <span>Clients</span>
          <strong>{stats.clients}</strong>
        </article>
        <article className="prospect-stat">
          <Clock size={21} />
          <span>Relances à effectuer</span>
          <strong>{stats.followUps}</strong>
        </article>
      </section>

      {showForm && (
        <section className="prospects-panel">
          <h2>Ajouter un contact</h2>

          <form className="prospects-form" onSubmit={addContact}>
            <div className="prospects-form-grid">
              <label>
                Nom complet *
                <input name="name" required placeholder="Nom du contact" />
              </label>

              <label>
                Téléphone *
                <input name="phone" type="tel" required placeholder="+221 ..." />
              </label>

              <label>
                Adresse e-mail
                <input name="email" type="email" placeholder="contact@email.com" />
              </label>

              <label>
                Ville
                <input name="city" placeholder="Ex. : Dakar" />
              </label>

              <label>
                Statut
                <select name="status" defaultValue="Nouveau">
                  <option>Nouveau</option>
                  <option>Intéressé</option>
                  <option>Client</option>
                  <option>À relancer</option>
                </select>
              </label>

              <label>
                Source du contact
                <select name="source" defaultValue="">
                  <option value="">Non précisée</option>
                  <option>WhatsApp</option>
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>Recommandation</option>
                  <option>Rencontre directe</option>
                  <option>Autre</option>
                </select>
              </label>

              <label>
                Prochaine relance
                <input name="nextFollowUp" type="date" />
              </label>

              <label className="prospects-full-field">
                Notes
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Besoins, produits recherchés, échanges..."
                />
              </label>
            </div>

            <div className="prospects-form-actions">
              <button type="button" className="prospects-cancel" onClick={() => setShowForm(false)}>
                Annuler
              </button>
              <button type="submit" className="prospects-submit">
                Enregistrer le contact
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="prospects-panel">
        <div className="prospects-toolbar">
          <div>
            <h2>Répertoire des contacts</h2>
            <span>{filteredContacts.length} contact(s) affiché(s)</span>
          </div>

          <div className="prospects-filters">
            <div className="prospects-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un contact..."
              />
            </div>

            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option>Tous</option>
              <option>Nouveau</option>
              <option>Intéressé</option>
              <option>Client</option>
              <option>À relancer</option>
            </select>
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="prospects-empty">
            <Users size={32} />
            <strong>Aucun contact trouvé</strong>
            <p>Ajoutez un contact pour commencer votre suivi commercial.</p>
          </div>
        ) : (
          <div className="prospects-list">
            {filteredContacts.map((contact) => (
              <button
                type="button"
                className="prospect-contact"
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="prospect-avatar">
                  {contact.name.charAt(0).toUpperCase()}
                </div>

                <div className="prospect-main">
                  <strong>{contact.name}</strong>
                  <span><Phone size={13} /> {contact.phone}</span>
                </div>

                <span className={`prospect-status ${contact.status.toLowerCase().replace(' ', '-')}`}>
                  {contact.status}
                </span>

                {contact.nextFollowUp && (
                  <span className="prospect-date">
                    <CalendarDays size={14} />
                    {new Date(`${contact.nextFollowUp}T00:00:00`).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedContact && (
        <section className="prospects-panel prospect-details">
          <div className="prospect-details-header">
            <div>
              <span className="eyebrow">FICHE CONTACT</span>
              <h2>{selectedContact.name}</h2>
            </div>
            <button
              className="prospects-close"
              onClick={() => setSelectedContact(null)}
            >
              Fermer
            </button>
          </div>

          <div className="prospect-details-grid">
            <div>
              <span>Téléphone</span>
              <strong>{selectedContact.phone}</strong>
            </div>
            <div>
              <span>E-mail</span>
              <strong>{selectedContact.email || 'Non renseigné'}</strong>
            </div>
            <div>
              <span>Ville</span>
              <strong>{selectedContact.city || 'Non renseignée'}</strong>
            </div>
            <div>
              <span>Source</span>
              <strong>{selectedContact.source || 'Non précisée'}</strong>
            </div>
          </div>

          <label className="prospect-edit-label">
            Statut commercial
            <select
              value={selectedContact.status}
              onChange={(event) => updateStatus(selectedContact.id, event.target.value as ContactStatus)}
            >
              <option>Nouveau</option>
              <option>Intéressé</option>
              <option>Client</option>
              <option>À relancer</option>
            </select>
          </label>

          <label className="prospect-edit-label">
            Prochaine relance
            <input
              type="date"
              value={selectedContact.nextFollowUp}
              onChange={(event) => updateFollowUp(selectedContact.id, event.target.value)}
            />
          </label>

          <label className="prospect-edit-label">
            <span><MessageSquare size={16} /> Notes et historique des échanges</span>
            <textarea
              rows={4}
              value={selectedContact.notes}
              onChange={(event) => updateNotes(selectedContact.id, event.target.value)}
              placeholder="Ajoutez ici vos observations et échanges..."
            />
          </label>

          <div className="prospect-details-footer">
            <a
              href={`https://wa.me/${selectedContact.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="prospect-whatsapp"
            >
              Contacter sur WhatsApp
            </a>

            <button
              className="prospect-delete"
              onClick={() => deleteContact(selectedContact.id)}
            >
              <Trash2 size={16} />
              Supprimer le contact
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default Prospects
