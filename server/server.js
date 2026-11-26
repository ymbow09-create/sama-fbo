
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { GoogleGenAI } = require('@google/genai')

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('Erreur : clé API Gemini manquante dans le fichier .env')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey })

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SAMA IA est prêt.' })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message invalide.' })
    }

    const contents = [
      ...history,
      { role: 'user', parts: [{ text: message }] },
    ]

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction:
          'Tu es SAMA IA, assistant intelligent de SAMA FBO. ' +
          'Tu aides l’utilisateur dans ses études, son organisation, ' +
          'la gestion de son activité Forever et son développement personnel. ' +
          'Tu réponds en français clair, avec des explications simples et pratiques.',
      },
    })

    res.json({ reply: response.text || 'Je n’ai pas pu générer de réponse.' })
  } catch (error) {
    console.error('Erreur Gemini :', error.message)
    res.status(500).json({
      error: 'Impossible de contacter Gemini. Vérifie la clé API et réessaie.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`SAMA IA est prêt sur http://localhost:${PORT}`)
})
