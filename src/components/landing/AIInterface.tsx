import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'

type Mode = 'text' | 'image' | 'video'

const modes: { id: Mode; label: string; icon: string }[] = [
  { id: 'text', label: 'Текст', icon: 'MessageSquare' },
  { id: 'image', label: 'Картинка', icon: 'Image' },
  { id: 'video', label: 'Видео', icon: 'Video' },
]

interface AIInterfaceProps {
  onClose: () => void
}

export default function AIInterface({ onClose }: AIInterfaceProps) {
  const [mode, setMode] = useState<Mode>('text')
  const [prompt, setPrompt] = useState('')

  const placeholder =
    mode === 'text'
      ? 'Отправить сообщение...'
      : mode === 'image'
      ? 'Опишите картинку, которую хотите создать...'
      : 'Опишите сцену для видео...'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-40 bg-black flex items-center justify-center px-4"
    >
      <button
        onClick={onClose}
        className="absolute top-6 left-6 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
      >
        <Icon name="ArrowLeft" size={20} />
        <span className="text-sm">Назад</span>
      </button>

      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl font-semibold text-white text-center"
        >
          Чем могу помочь?
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-1 bg-neutral-900/80 border border-neutral-800 rounded-full p-1"
        >
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                mode === m.id
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon name={m.icon} size={16} />
              {m.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full"
        >
          <div className="relative bg-neutral-900/80 border border-neutral-800 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-neutral-600 transition-colors">
            <AnimatePresence mode="wait">
              <motion.input
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-white placeholder:text-neutral-500 outline-none text-base"
              />
            </AnimatePresence>
            <button
              disabled={!prompt.trim()}
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
            >
              <Icon name="ArrowUp" size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
