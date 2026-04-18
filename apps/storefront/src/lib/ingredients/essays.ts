import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export interface Essay {
  /** Ordered paragraphs from the markdown body. */
  story: string[]
  /** Pullquote / margin note. Always present (falls back to default). */
  aside: string
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content/ingredients')
const DEFAULT_KEY = '_default'

function readEssayFile(filePath: string): Essay | null {
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const aside = typeof data.aside === 'string' ? data.aside : ''
  const story = content
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  return { story, aside }
}

let defaultEssayCache: Essay | null = null
function defaultEssay(): Essay {
  if (defaultEssayCache) return defaultEssayCache
  const loaded = readEssayFile(path.join(CONTENT_DIR, `${DEFAULT_KEY}.md`))
  defaultEssayCache = loaded ?? {
    story: [
      'No essay content yet. This ingredient ships with reference data only.',
    ],
    aside: 'Content forthcoming.',
  }
  return defaultEssayCache
}

const essayCache = new Map<string, Essay>()

/**
 * Read the essay for a given symbol. Falls back to `_default.md` when no
 * per-ingredient file exists. Safe to call at build time (server-only;
 * the function reads from disk).
 */
export function loadEssay(sym: string): Essay {
  const key = sym.toUpperCase()
  const cached = essayCache.get(key)
  if (cached) return cached

  const filePath = path.join(CONTENT_DIR, `${key}.md`)
  const loaded   = readEssayFile(filePath) ?? defaultEssay()

  essayCache.set(key, loaded)
  return loaded
}
