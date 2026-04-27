import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'
import func2url from '../../../backend/func2url.json'

type Mode = 'text' | 'image' | 'video'

const modes: { id: Mode; label: string; icon: string }[] = [
  { id: 'text', label: 'Текст', icon: 'MessageSquare' },
  { id: 'image', label: 'Картинка', icon: 'Image' },
  { id: 'video', label: 'Видео', icon: 'Video' },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIInterfaceProps {
  onClose: () => void
}

export default function AIInterface({ onClose }: AIInterfaceProps) {
  const [mode, setMode] = useState<Mode>('text')
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const placeholder =
    mode === 'text'
      ? 'Отправить сообщение...'
      : mode === 'image'
      ? 'Опишите картинку, которую хотите создать...'
      : 'Опишите сцену для видео...'

  const handleSend = async () => {
    const trimmed = prompt.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setPrompt('')
    setLoading(true)

    try {
      const res = await fetch(func2url['ai-chat'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed, mode }),
      })
      const data = await res.json()
      const answer =
        data.answer || data.error || 'Не удалось получить ответ. Попробуй ещё раз.'
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ошибка соединения. Проверь интернет и попробуй ещё раз.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasChat = messages.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-40 bg-black flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <Icon name="ArrowLeft" size={20} />
          <span className="text-sm">Назад</span>
        </button>
        {hasChat && (
          <button
            onClick={() => setMessages([])}
            className="text-sm text-neutral-500 hover:text-white transition-colors"
          >
            Новый чат
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        {!hasChat ? (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-semibold text-white text-center"
            >
              Чем могу помочь?
            </motion.h1>

            <ModeSwitcher mode={mode} setMode={setMode} />
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              placeholder={placeholder}
              onSend={handleSend}
              onKeyDown={handleKey}
              loading={loading}
            />
          </div>
        ) : (
          <div className="w-full max-w-2xl h-full flex flex-col">
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-neutral-800 text-white'
                        : 'bg-neutral-900 text-neutral-100 border border-neutral-800'
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-neutral-400 text-sm flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                </div>
              )}
            </div>
            <div className="py-4 space-y-3">
              <ModeSwitcher mode={mode} setMode={setMode} compact />
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                placeholder={placeholder}
                onSend={handleSend}
                onKeyDown={handleKey}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ModeSwitcher({
  mode,
  setMode,
  compact = false,
}: {
  mode: Mode
  setMode: (m: Mode) => void
  compact?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: compact ? 0 : 0.2 }}
      className={`flex items-center gap-1 bg-neutral-900/80 border border-neutral-800 rounded-full p-1 ${
        compact ? 'self-center' : ''
      }`}
    >
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
            mode === m.id ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Icon name={m.icon} size={16} />
          {m.label}
        </button>
      ))}
    </motion.div>
  )
}

function PromptInput({
  prompt,
  setPrompt,
  placeholder,
  onSend,
  onKeyDown,
  loading,
}: {
  prompt: string
  setPrompt: (v: string) => void
  placeholder: string
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  loading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full"
    >
      <div className="relative bg-neutral-900/80 border border-neutral-800 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-neutral-600 transition-colors">
        <AnimatePresence mode="wait">
          <motion.input
            key={placeholder}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder:text-neutral-500 outline-none text-base disabled:opacity-60"
          />
        </AnimatePresence>
        <button
          onClick={onSend}
          disabled={!prompt.trim() || loading}
          className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
        >
          <Icon
            name={loading ? 'Loader2' : 'ArrowUp'}
            size={18}
            className={loading ? 'animate-spin' : ''}
          />
        </button>
      </div>
    </motion.div>
  )
}
