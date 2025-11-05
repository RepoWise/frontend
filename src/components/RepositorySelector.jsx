import { motion } from 'framer-motion'
import { Github, ChevronDown, Plus } from 'lucide-react'

export default function RepositorySelector({
  projects,
  selectedProject,
  onProjectChange,
  onAddRepository
}) {
  const currentProject = projects?.find(p => p.id === selectedProject)

  return (
    <div className="flex items-center gap-3">
      {/* Repository Dropdown */}
      <div className="relative">
        <select
          value={selectedProject}
          onChange={(e) => onProjectChange(e.target.value)}
          className="appearance-none bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.owner}/{project.repo})
            </option>
          ))}
        </select>

        {/* Github Icon */}
        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

        {/* Chevron Icon */}
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {/* Add Repository Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddRepository}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
      >
        <Plus className="w-4 h-4" />
        Add Repository
      </motion.button>

      {/* Current Project Info */}
      {currentProject && (
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 ml-2">
          <span className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
            {currentProject.foundation}
          </span>
        </div>
      )}
    </div>
  )
}
