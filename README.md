# RepoWise Frontend

Modern React-based frontend for exploring and querying open-source repository documentation, governance, commits, and issues.

## Features

- **Intelligent Search Interface**: Ask natural language questions about any GitHub repository
- **Multi-Source Answers**: Get answers from documentation, commits, and issues
- **Light/Dark Theme**: Perplexity-inspired clean design with theme toggle
- **Real-Time Indexing**: Watch as repositories are indexed in real-time
- **Source Attribution**: See which documents were used to generate answers
- **Suggested Questions**: Smart follow-up questions based on context
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Framework**: React 18 with Vite
- **UI Library**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: react-markdown with GitHub-flavored markdown
- **Code Highlighting**: highlight.js
- **HTTP Client**: TanStack Query (React Query) + Axios

## Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running (see [backend repository](https://github.com/RepoWise/backend))

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RepoWise/frontend.git
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Usage

### Adding a Repository

1. Enter a GitHub repository URL in the header input (e.g., `https://github.com/facebook/react`)
2. Click "Add Repo"
3. Wait for the indexing to complete (you'll see real-time progress)

### Curated Example Repositories

First-time visitors see a set of quick-select cards with vetted repositories so you can try RepoWise instantly:

- `google/meridian` – Meridian is an MMM framework that enables advertisers to set up and run their own in-house models.
- `microsoft/lisa` – LISA is developed and maintained by Microsoft, to empower Linux validation.
- `netflix/hollow` – Hollow is a java library and toolset for disseminating in-memory datasets from a single producer to many consumers for high performance read-only access.
- `apple/pkl` – A configuration as code language with rich validation and tooling.

These examples are chosen because they:

- Are public and fully open-source
- Contain governance, contribution, and automation-focused documentation that exercises every RAG step (summaries, reformulations, etc.)
- Are actively maintained so users see realistic indexing performance and commit/issue histories

### Querying a Repository

1. Once a repository is indexed, you'll see suggested questions
2. Click a suggested question or type your own
3. View the AI-generated answer with source attribution
4. Explore related documents in the Sources tab

### Theme Toggle

Click the sun/moon icon in the header to switch between light and dark themes.

## Development

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── Dashboard.jsx
│   │   └── ThemeToggle.jsx
│   ├── contexts/        # React contexts
│   │   └── ThemeContext.jsx
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles and Tailwind
├── public/              # Static assets
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## Key Components

### App.jsx

Main application component containing:
- Repository management (add/remove)
- Query interface
- Chat history
- Loading states
- Error handling

### ThemeToggle.jsx

Animated theme toggle button with:
- Sun/moon icon transitions
- Smooth rotation animations
- Hover effects

### ThemeContext.jsx

Global theme management:
- React Context for theme state
- localStorage persistence
- Light/dark mode switching

### Dashboard.jsx

(Coming Soon) Analytics dashboard for repository insights.

## Styling

The application uses Tailwind CSS with a custom design system:

### Color Palette

- **Primary**: Emerald/Teal gradient
- **Background**: Dynamic (white in light, dark gray in dark mode)
- **Text**: High contrast for readability
- **Borders**: Subtle, theme-aware

### Theme Variables

Defined in `src/index.css`:
- Light theme: Clean whites and grays
- Dark theme: Rich blacks and subtle colors

## API Integration

The frontend communicates with the backend via REST API:

### Endpoints Used

- `POST /api/projects/add` - Add repository
- `GET /api/projects` - List projects
- `POST /api/query` - Query repository
- `DELETE /api/projects/:id` - Remove repository

### Query Client Setup

TanStack Query provides:
- Automatic request deduplication
- Background refetching
- Optimistic updates
- Error handling

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deployment Platforms

Compatible with:
- **Vercel** (recommended for Vite apps)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**

### Environment Variables

Set `VITE_API_BASE_URL` to your production backend URL in your deployment platform.

### Netlify Example

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Deploy:
```bash
netlify deploy --prod
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Optimizations

- Code splitting with React.lazy
- Image optimization
- Minified production builds
- Tree shaking
- Gzip compression

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- High contrast ratios
- Screen reader support

## Troubleshooting

### Common Issues

1. **API connection errors**: Verify `VITE_API_BASE_URL` is correct and backend is running
2. **Build failures**: Clear `node_modules` and reinstall dependencies
3. **Theme not persisting**: Check browser localStorage is enabled
4. **Slow performance**: Enable React production mode and check for console warnings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Code Style

- Use functional components with hooks
- Follow Airbnb React style guide
- Use Tailwind utility classes
- Prefer composition over inheritance
- Write self-documenting code

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/RepoWise/frontend/issues
- Documentation: https://github.com/RepoWise/frontend/wiki

## Related Projects

- [RepoWise Backend](https://github.com/RepoWise/backend) - Backend API service
