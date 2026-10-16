/* eslint-disable no-console */
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedResource = {
  title: string;
  description: string;
  url: string;
  image?: string;
  type: string;
  category: string;
  author?: string;
  year?: number;
  reason?: string;
  featured?: boolean;
  published?: boolean;
  tags: string[];
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/480`;

const categories: {
  name: string;
  slug: string;
  type: string;
  description: string;
  icon: string;
}[] = [
  // Websites
  { name: 'Development', slug: 'development', type: 'website', description: 'Docs, platforms and references for software builders.', icon: 'code' },
  { name: 'AI', slug: 'ai', type: 'website', description: 'AI tools, models and research destinations.', icon: 'sparkles' },
  { name: 'Design', slug: 'design', type: 'website', description: 'Design systems, inspiration and UI tooling.', icon: 'palette' },
  { name: 'Education', slug: 'education', type: 'website', description: 'Learning platforms and study material.', icon: 'graduation' },
  { name: 'Productivity', slug: 'productivity', type: 'website', description: 'Tools to plan, write and get things done.', icon: 'check' },
  { name: 'Tools', slug: 'tools', type: 'website', description: 'Small utilities that save time.', icon: 'wrench' },
  { name: 'Career', slug: 'career', type: 'website', description: 'Roadmaps, hiring and growth resources.', icon: 'briefcase' },

  // YouTube
  { name: 'Programming', slug: 'programming', type: 'youtube', description: 'Channels about code, systems and engineering.', icon: 'code' },
  { name: 'AI', slug: 'ai', type: 'youtube', description: 'Machine learning and AI explainers.', icon: 'sparkles' },
  { name: 'Business', slug: 'business', type: 'youtube', description: 'Startups, markets and entrepreneurship.', icon: 'chart' },
  { name: 'Education', slug: 'education', type: 'youtube', description: 'Deep, well-produced educational channels.', icon: 'graduation' },
  { name: 'Self Development', slug: 'self-development', type: 'youtube', description: 'Focus, habits and personal growth.', icon: 'user' },
  { name: 'Entertainment', slug: 'entertainment', type: 'youtube', description: 'Fun, culture and storytelling.', icon: 'play' },

  // Telegram
  { name: 'Programming', slug: 'programming', type: 'telegram', description: 'Developer communities and news feeds.', icon: 'code' },
  { name: 'Education', slug: 'education', type: 'telegram', description: 'Learning channels and study groups.', icon: 'graduation' },
  { name: 'News', slug: 'news', type: 'telegram', description: 'Fast, curated news channels.', icon: 'newspaper' },
  { name: 'Technology', slug: 'technology', type: 'telegram', description: 'Tech, gadgets and product updates.', icon: 'cpu' },
  { name: 'Communities', slug: 'communities', type: 'telegram', description: 'Groups where people help each other.', icon: 'users' },

  // Books
  { name: 'Psychology', slug: 'psychology', type: 'book', description: 'How the mind works and why we behave.', icon: 'brain' },
  { name: 'Business', slug: 'business', type: 'book', description: 'Building, leading and scaling companies.', icon: 'chart' },
  { name: 'Programming', slug: 'programming', type: 'book', description: 'Craft and practice of software.', icon: 'code' },
  { name: 'Self Development', slug: 'self-development', type: 'book', description: 'Habits, focus and growth.', icon: 'user' },
  { name: 'Science', slug: 'science', type: 'book', description: 'Physics, biology and the universe.', icon: 'atom' },
  { name: 'History', slug: 'history', type: 'book', description: 'Big-picture human history.', icon: 'clock' },
  { name: 'Fiction', slug: 'fiction', type: 'book', description: 'Stories worth living inside.', icon: 'book' },

  // Movies
  { name: 'Sci-Fi', slug: 'sci-fi', type: 'movie', description: 'Futures, space and ideas.', icon: 'rocket' },
  { name: 'Drama', slug: 'drama', type: 'movie', description: 'Character-driven stories.', icon: 'theater' },
  { name: 'Thriller', slug: 'thriller', type: 'movie', description: 'Tension and momentum.', icon: 'zap' },
  { name: 'Documentary', slug: 'documentary', type: 'movie', description: 'True stories and real people.', icon: 'camera' },
  { name: 'Animation', slug: 'animation', type: 'movie', description: 'Hand- and computer-drawn worlds.', icon: 'palette' },
  { name: 'Classic', slug: 'classic', type: 'movie', description: 'Films that shaped the medium.', icon: 'star' },
];

const tags: { name: string; slug: string }[] = [
  { name: 'React', slug: 'react' },
  { name: 'Frontend', slug: 'frontend' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'Python', slug: 'python' },
  { name: 'AI', slug: 'ai' },
  { name: 'Open Source', slug: 'opensource' },
  { name: 'Design', slug: 'design' },
  { name: 'Productivity', slug: 'productivity' },
  { name: 'Career', slug: 'career' },
  { name: 'Learning', slug: 'learning' },
  { name: 'News', slug: 'news' },
  { name: 'Community', slug: 'community' },
  { name: 'Startup', slug: 'startup' },
  { name: 'Psychology', slug: 'psychology' },
  { name: 'Science', slug: 'science' },
  { name: 'Cinema', slug: 'cinema' },
  { name: 'Space', slug: 'space' },
  { name: 'Web', slug: 'web' },
  { name: 'Tools', slug: 'tools' },
];

const resources: SeedResource[] = [
  // ---------------- Websites ----------------
  {
    title: 'MDN Web Docs',
    description: 'The reference for web standards: HTML, CSS and JavaScript, maintained by Mozilla and the community.',
    url: 'https://developer.mozilla.org',
    image: img('mdn'),
    type: 'website',
    category: 'development',
    featured: true,
    tags: ['javascript', 'web', 'learning'],
  },
  {
    title: 'freeCodeCamp',
    description: 'Learn to code for free with thousands of hours of interactive lessons and certifications.',
    url: 'https://www.freecodecamp.org',
    image: img('freecodecamp'),
    type: 'website',
    category: 'education',
    tags: ['learning', 'javascript', 'career'],
  },
  {
    title: 'GitHub',
    description: 'Where the world builds software. Host repositories, review code and collaborate.',
    url: 'https://github.com',
    image: img('github'),
    type: 'website',
    category: 'development',
    featured: true,
    tags: ['opensource', 'tools', 'career'],
  },
  {
    title: 'Figma',
    description: 'Collaborative interface design tool for wireframes, prototypes and design systems.',
    url: 'https://www.figma.com',
    image: img('figma'),
    type: 'website',
    category: 'design',
    tags: ['design', 'tools'],
  },
  {
    title: 'Notion',
    description: 'All-in-one workspace for notes, docs, wikis and project planning.',
    url: 'https://www.notion.so',
    image: img('notion'),
    type: 'website',
    category: 'productivity',
    tags: ['productivity', 'tools'],
  },
  {
    title: 'ChatGPT',
    description: 'Conversational AI assistant for writing, coding, research and brainstorming.',
    url: 'https://chat.openai.com',
    image: img('chatgpt'),
    type: 'website',
    category: 'ai',
    featured: true,
    tags: ['ai', 'productivity'],
  },
  {
    title: 'Stack Overflow',
    description: 'Q&A knowledge base where developers solve real programming problems together.',
    url: 'https://stackoverflow.com',
    image: img('stackoverflow'),
    type: 'website',
    category: 'development',
    tags: ['community', 'learning'],
  },
  {
    title: 'Can I use',
    description: 'Up-to-date browser support tables for HTML, CSS and web APIs.',
    url: 'https://caniuse.com',
    image: img('caniuse'),
    type: 'website',
    category: 'development',
    tags: ['frontend', 'web', 'tools'],
  },
  {
    title: 'roadmap.sh',
    description: 'Step-by-step developer roadmaps and guides for every career path.',
    url: 'https://roadmap.sh',
    image: img('roadmap'),
    type: 'website',
    category: 'career',
    tags: ['career', 'learning'],
  },
  {
    title: 'Excalidraw',
    description: 'Virtual whiteboard for sketching hand-drawn diagrams and architecture.',
    url: 'https://excalidraw.com',
    image: img('excalidraw'),
    type: 'website',
    category: 'tools',
    tags: ['tools', 'design', 'productivity'],
  },

  // ---------------- YouTube ----------------
  {
    title: 'Fireship',
    description: 'High-intensity web development and programming explainers in a few minutes each.',
    url: 'https://www.youtube.com/@Fireship',
    image: img('fireship'),
    type: 'youtube',
    category: 'programming',
    featured: true,
    tags: ['javascript', 'web', 'frontend'],
  },
  {
    title: 'Traversy Media',
    description: 'Practical crash courses on modern web development, frameworks and tooling.',
    url: 'https://www.youtube.com/@TraversyMedia',
    image: img('traversy'),
    type: 'youtube',
    category: 'programming',
    tags: ['web', 'javascript', 'learning'],
  },
  {
    title: '3Blue1Brown',
    description: 'Animated math and intuition, from linear algebra to neural networks.',
    url: 'https://www.youtube.com/@3blue1brown',
    image: img('3blue1brown'),
    type: 'youtube',
    category: 'education',
    featured: true,
    tags: ['learning', 'science', 'ai'],
  },
  {
    title: 'freeCodeCamp.org',
    description: 'Full-length programming courses and tutorials, completely free.',
    url: 'https://www.youtube.com/@freecodecamp',
    image: img('fcc-yt'),
    type: 'youtube',
    category: 'programming',
    tags: ['learning', 'python', 'javascript'],
  },
  {
    title: 'The Net Ninja',
    description: 'Clear, structured playlists on JavaScript, React, Node and more.',
    url: 'https://www.youtube.com/@NetNinja',
    image: img('netninja'),
    type: 'youtube',
    category: 'programming',
    tags: ['react', 'frontend', 'javascript'],
  },
  {
    title: 'Y Combinator',
    description: 'Startup school lectures and founder stories from the people building companies.',
    url: 'https://www.youtube.com/@ycombinator',
    image: img('ycombinator'),
    type: 'youtube',
    category: 'business',
    tags: ['startup', 'career'],
  },
  {
    title: 'Two Minute Papers',
    description: 'Bite-sized summaries of the latest AI and computer graphics research.',
    url: 'https://www.youtube.com/@TwoMinutePapers',
    image: img('twominutepapers'),
    type: 'youtube',
    category: 'ai',
    tags: ['ai', 'science'],
  },
  {
    title: 'Better Ideas',
    description: 'Thoughtful videos on focus, creativity and building a better life.',
    url: 'https://www.youtube.com/@betterideas',
    image: img('betterideas'),
    type: 'youtube',
    category: 'self-development',
    tags: ['productivity', 'psychology'],
  },
  {
    title: 'Kurzgesagt – In a Nutshell',
    description: 'Beautifully animated explainers on science, space and the future of humanity.',
    url: 'https://www.youtube.com/@kurzgesagt',
    image: img('kurzgesagt'),
    type: 'youtube',
    category: 'education',
    tags: ['science', 'space'],
  },
  {
    title: 'Lex Fridman Podcast',
    description: 'Long-form conversations with scientists, engineers and thinkers.',
    url: 'https://www.youtube.com/@lexfridman',
    image: img('lexfridman'),
    type: 'youtube',
    category: 'education',
    tags: ['ai', 'science', 'learning'],
  },

  // ---------------- Telegram ----------------
  {
    title: 'Telegram News',
    description: 'Official Telegram channel with feature announcements and platform updates.',
    url: 'https://t.me/telegram',
    image: img('tg-official'),
    type: 'telegram',
    category: 'news',
    tags: ['news', 'community'],
  },
  {
    title: 'JavaScript Weekly',
    description: 'Curated JavaScript news, articles and releases delivered regularly.',
    url: 'https://t.me/javascript',
    image: img('tg-js'),
    type: 'telegram',
    category: 'programming',
    featured: true,
    tags: ['javascript', 'news', 'frontend'],
  },
  {
    title: 'Python Community',
    description: 'Discussions, tips and resources for Python developers.',
    url: 'https://t.me/python',
    image: img('tg-python'),
    type: 'telegram',
    category: 'programming',
    tags: ['python', 'community', 'learning'],
  },
  {
    title: 'Hacker News Daily',
    description: 'The most interesting tech stories of the day, condensed.',
    url: 'https://t.me/hackernews',
    image: img('tg-hn'),
    type: 'telegram',
    category: 'technology',
    tags: ['news', 'community'],
  },
  {
    title: 'Designers Community',
    description: 'A place for designers to share work, tools and feedback.',
    url: 'https://t.me/designers',
    image: img('tg-designers'),
    type: 'telegram',
    category: 'communities',
    tags: ['design', 'community'],
  },
  {
    title: 'AI News',
    description: 'Daily updates from the fast-moving world of artificial intelligence.',
    url: 'https://t.me/ai',
    image: img('tg-ai'),
    type: 'telegram',
    category: 'technology',
    featured: true,
    tags: ['ai', 'news'],
  },
  {
    title: 'English Learning',
    description: 'Bite-sized lessons and vocabulary for improving your English.',
    url: 'https://t.me/english',
    image: img('tg-english'),
    type: 'telegram',
    category: 'education',
    tags: ['learning'],
  },
  {
    title: 'Startup Digest',
    description: 'Founder stories, funding rounds and startup advice.',
    url: 'https://t.me/startups',
    image: img('tg-startups'),
    type: 'telegram',
    category: 'communities',
    tags: ['startup', 'community'],
  },
  {
    title: 'Tech Pulse',
    description: 'Gadgets, products and industry news for tech enthusiasts.',
    url: 'https://t.me/techno',
    image: img('tg-tech'),
    type: 'telegram',
    category: 'news',
    tags: ['news', 'tools'],
  },
  {
    title: 'Open Source Hub',
    description: 'Discover new open source projects and contribution opportunities.',
    url: 'https://t.me/opensource',
    image: img('tg-oss'),
    type: 'telegram',
    category: 'programming',
    tags: ['opensource', 'community', 'career'],
  },

  // ---------------- Books ----------------
  {
    title: 'Clean Code',
    description: 'A handbook of agile software craftsmanship with practical rules for readable code.',
    url: 'https://www.goodreads.com/book/show/3735293-clean-code',
    image: img('cleancode'),
    type: 'book',
    category: 'programming',
    author: 'Robert C. Martin',
    year: 2008,
    reason: 'It reshaped how I name things and split responsibilities. Every review I write is a little stricter because of it.',
    featured: true,
    tags: ['programming', 'learning'],
  },
  {
    title: 'The Pragmatic Programmer',
    description: 'Timeless advice on the craft of building software, from DRY to tracer bullets.',
    url: 'https://www.goodreads.com/book/show/46728222-the-pragmatic-programmer',
    image: img('pragmatic'),
    type: 'book',
    category: 'programming',
    author: 'Andrew Hunt & David Thomas',
    year: 1999,
    tags: ['programming', 'career'],
  },
  {
    title: 'Atomic Habits',
    description: 'A practical framework for building good habits and breaking bad ones through tiny changes.',
    url: 'https://www.goodreads.com/book/show/40121378-atomic-habits',
    image: img('atomichabits'),
    type: 'book',
    category: 'self-development',
    author: 'James Clear',
    year: 2018,
    featured: true,
    reason: 'The idea that systems beat goals changed how I plan my weeks.',
    tags: ['productivity', 'psychology'],
  },
  {
    title: 'Deep Work',
    description: 'Rules for focused success in a distracted world.',
    url: 'https://www.goodreads.com/book/show/25744928-deep-work',
    image: img('deepwork'),
    type: 'book',
    category: 'self-development',
    author: 'Cal Newport',
    year: 2016,
    tags: ['productivity', 'career'],
  },
  {
    title: 'Thinking, Fast and Slow',
    description: 'A tour of the two systems that drive how we think and decide.',
    url: 'https://www.goodreads.com/book/show/11468377-thinking-fast-and-slow',
    image: img('thinking'),
    type: 'book',
    category: 'psychology',
    author: 'Daniel Kahneman',
    year: 2011,
    tags: ['psychology', 'science'],
  },
  {
    title: 'Sapiens',
    description: 'A brief history of humankind, from foraging bands to global civilisation.',
    url: 'https://www.goodreads.com/book/show/23692271-sapiens',
    image: img('sapiens'),
    type: 'book',
    category: 'history',
    author: 'Yuval Noah Harari',
    year: 2011,
    tags: ['science', 'learning'],
  },
  {
    title: 'The Lean Startup',
    description: 'How today’s entrepreneurs use continuous innovation to build businesses that last.',
    url: 'https://www.goodreads.com/book/show/10127019-the-lean-startup',
    image: img('leanstartup'),
    type: 'book',
    category: 'business',
    author: 'Eric Ries',
    year: 2011,
    tags: ['startup', 'career'],
  },
  {
    title: 'Educated',
    description: 'A memoir about the transformative power of education.',
    url: 'https://www.goodreads.com/book/show/35133922-educated',
    image: img('educated'),
    type: 'book',
    category: 'self-development',
    author: 'Tara Westover',
    year: 2018,
    tags: ['learning', 'psychology'],
  },
  {
    title: 'A Brief History of Time',
    description: 'From the Big Bang to black holes, a landmark exploration of the universe.',
    url: 'https://www.goodreads.com/book/show/3869.A_Brief_History_of_Time',
    image: img('briefhistory'),
    type: 'book',
    category: 'science',
    author: 'Stephen Hawking',
    year: 1988,
    tags: ['science', 'space'],
  },
  {
    title: '1984',
    description: 'A dystopian novel about surveillance, language and the limits of freedom.',
    url: 'https://www.goodreads.com/book/show/5470.1984',
    image: img('1984'),
    type: 'book',
    category: 'fiction',
    author: 'George Orwell',
    year: 1949,
    tags: ['psychology'],
  },

  // ---------------- Movies ----------------
  {
    title: 'Interstellar',
    description: 'A team of explorers travels through a wormhole in search of a new home for humanity.',
    url: 'https://www.imdb.com/title/tt0816692/',
    image: img('interstellar'),
    type: 'movie',
    category: 'sci-fi',
    year: 2014,
    reason: 'The rare blockbuster that makes physics feel emotional. The docking scene is perfection.',
    featured: true,
    tags: ['space', 'science', 'cinema'],
  },
  {
    title: 'The Matrix',
    description: 'A hacker discovers reality is a simulation and joins a rebellion against the machines.',
    url: 'https://www.imdb.com/title/tt0133093/',
    image: img('matrix'),
    type: 'movie',
    category: 'sci-fi',
    year: 1999,
    reason: 'Action, philosophy and a green-tinted aesthetic that defined an era.',
    tags: ['cinema', 'science'],
  },
  {
    title: 'Inception',
    description: 'A thief who steals secrets through dream-sharing technology is given one last impossible job.',
    url: 'https://www.imdb.com/title/tt1375666/',
    image: img('inception'),
    type: 'movie',
    category: 'thriller',
    year: 2010,
    reason: 'A puzzle that rewards rewatching; the editing alone is a masterclass.',
    featured: true,
    tags: ['cinema', 'science'],
  },
  {
    title: 'The Social Network',
    description: 'The story of the founding of Facebook and the friendships it cost.',
    url: 'https://www.imdb.com/title/tt1285016/',
    image: img('socialnetwork'),
    type: 'movie',
    category: 'drama',
    year: 2010,
    reason: 'The definitive startup movie — ambition, betrayal and the best opening scene in tech cinema.',
    tags: ['startup', 'cinema'],
  },
  {
    title: 'Her',
    description: 'A lonely writer develops an unlikely relationship with an operating system.',
    url: 'https://www.imdb.com/title/tt1798709/',
    image: img('her'),
    type: 'movie',
    category: 'drama',
    year: 2013,
    reason: 'A quiet, prescient film about AI and loneliness that feels more relevant every year.',
    tags: ['ai', 'cinema'],
  },
  {
    title: 'Arrival',
    description: 'A linguist is recruited to communicate with alien visitors and discovers time itself is different.',
    url: 'https://www.imdb.com/title/tt2543164/',
    image: img('arrival'),
    type: 'movie',
    category: 'sci-fi',
    year: 2016,
    reason: 'Science fiction as language, memory and grief. It broke my brain in the best way.',
    tags: ['science', 'cinema', 'space'],
  },
  {
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over decades, finding hope and eventual redemption.',
    url: 'https://www.imdb.com/title/tt0111161/',
    image: img('shawshank'),
    type: 'movie',
    category: 'drama',
    year: 1994,
    reason: 'A story about patience and dignity that never gets old.',
    tags: ['cinema'],
  },
  {
    title: 'Whiplash',
    description: 'A young drummer is pushed to his limits by a ruthless music instructor.',
    url: 'https://www.imdb.com/title/tt2582802/',
    image: img('whiplash'),
    type: 'movie',
    category: 'drama',
    year: 2014,
    reason: 'The best editing you will ever hear. It made me rethink mastery.',
    tags: ['cinema'],
  },
  {
    title: 'Parasite',
    description: 'A poor family schemes to become employed by a wealthy household with dark consequences.',
    url: 'https://www.imdb.com/title/tt6751668/',
    image: img('parasite'),
    type: 'movie',
    category: 'thriller',
    year: 2019,
    reason: 'A genre-shifting social thriller that turns on a dime and never lets go.',
    tags: ['cinema'],
  },
  {
    title: 'Spirited Away',
    description: 'A girl wanders into a world of spirits and must work to free her parents.',
    url: 'https://www.imdb.com/title/tt0245429/',
    image: img('spiritedaway'),
    type: 'movie',
    category: 'animation',
    year: 2001,
    reason: 'Pure imagination, hand-drawn and unforgettable. Studio Ghibli at its peak.',
    featured: true,
    tags: ['cinema'],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Admin
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  console.log(`👤 Admin ready: ${username}`);

  // Reset content tables (idempotent seed)
  await prisma.resourceTag.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();

  // Categories
  const categoryMap = new Map<string, string>(); // `${type}:${slug}` -> id
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    categoryMap.set(`${c.type}:${c.slug}`, created.id);
  }
  console.log(`📂 Categories: ${categories.length}`);

  // Tags
  const tagMap = new Map<string, string>(); // slug -> id
  for (const t of tags) {
    const created = await prisma.tag.create({ data: t });
    tagMap.set(t.slug, created.id);
  }
  console.log(`🏷️  Tags: ${tags.length}`);

  // Resources
  for (const r of resources) {
    const categoryId = categoryMap.get(`${r.type}:${r.category}`) ?? null;
    const metadata: Prisma.InputJsonValue | undefined = r.reason ? { reason: r.reason } : undefined;

    await prisma.resource.create({
      data: {
        title: r.title,
        description: r.description,
        url: r.url,
        image: r.image,
        type: r.type,
        categoryId,
        author: r.author,
        year: r.year,
        metadata,
        featured: r.featured ?? false,
        published: r.published ?? true,
        tags: {
          create: r.tags
            .map((slug) => tagMap.get(slug))
            .filter((id): id is string => Boolean(id))
            .map((tagId) => ({ tagId })),
        },
      },
    });
  }
  console.log(`📚 Resources: ${resources.length}`);
  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
