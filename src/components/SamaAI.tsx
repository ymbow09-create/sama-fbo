
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import './SamaAI.css'

type Message = {
  role: 'user' | 'model'
  text: string
}

function SamaAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Bonjour ! Je suis SAMA IA. Je peux t’aider dans tes études, ton organisation, ton activité Forever et ton développement personnel. Que souhaites-tu faire aujourd’hui ?',
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const message = input.trim()

    if (!message || loading) return

    const previousMessages = messages.filter(
      (item, index) => !(index === 0 && item.role === 'model'),
    )

    setMessages((current) => [
      ...current,
      { role: 'user', text: message },
    ])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: previousMessages.map((item) => ({
            role: item.role,
            parts: [{ text: item.text }],
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.')
      }

      setMessages((current) => [
        ...current,
        { role: 'model', text: data.reply },
      ])
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Impossible de contacter SAMA IA.'

      setMessages((current) => [
        ...current,
        {
          role: 'model',
          text: `${errorMessage} Vérifie que le serveur est démarré.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="sama-ai-page">
      <div className="sama-ai-heading">
        <span className="sama-ai-eyebrow">VOTRE ASSISTANT INTELLIGENT</span>
        <h1>SAMA IA</h1>
        <p>Un assistant pour réfléchir, apprendre et avancer.</p>
      </div>

      <div className="sama-ai-chat">
        <div className="sama-ai-messages">
          {messages.map((message, index) => (
            <div
              className={`sama-ai-message ${message.role}`}
              key={index}
            >
              <div className="sama-ai-avatar">
                {message.role === 'model' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="sama-ai-bubble">
                <span>{message.role === 'model' ? 'SAMA IA' : 'Vous'}</span>
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="sama-ai-loading">
              SAMA IA prépare une réponse...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="sama-ai-input-area"
          onSubmit={(event) => {
            event.preventDefault()
            void sendMessage()
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Écris ton message à SAMA IA..."
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Envoyer le message"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </section>
  )
}

export default SamaAI
