import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-12 h-12 rounded-full
                 bg-secondary hover:bg-accent transition-all duration-300
                 border border-border shadow-sm hover:shadow-md
                 group overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon container with rotation animation */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="relative z-10"
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-foreground" />
        ) : (
          <Sun className="w-5 h-5 text-foreground" />
        )}
      </motion.div>

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.button>
  )
}
