import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { HeroPixelBlast } from "@/components/HeroPixelBlast";
import { InsightCard } from "@/components/InsightCard";
import {
  getArticlesByAuthor,
  getInsightArticle,
  getInsightAuthor,
  insightArticles,
  insightAuthors,
} from "@/lib/insights";

type InsightPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [
    ...insightArticles.map((article) => ({ slug: article.slug })),
    ...insightAuthors.map((author) => ({ slug: `author-${author.slug}` })),
  ];
}

export async function generateMetadata({ params }: InsightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = slug.startsWith("author-")
    ? getInsightAuthor(slug.replace(/^author-/, ""))
    : undefined;
  const article = getInsightArticle(slug);

  if (author) {
    return {
      title: author.name,
      description: `${author.name}, ${author.role}. Read ${author.name}’s latest QuantSentry insights.`,
    };
  }

  if (article) {
    return { title: article.title, description: article.summary };
  }

  return {};
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function AuthorPage({ authorSlug }: { authorSlug: string }) {
  const author = getInsightAuthor(authorSlug);
  if (!author) notFound();

  const articles = getArticlesByAuthor(author.slug);
  const contentId = `page-content-insights-author-${author.slug}`;

  return (
    <>
      <main id={contentId} className="page-content insights-page insights-author-page">
        <section className="hero author-hero">
          <div className="wrap author-hero-grid">
            <div className="author-portrait">
              <Image
                alt={author.name}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 360px"
                src={author.image}
              />
            </div>
            <div className="author-intro">
              <div className="kicker">
                <span className="dot" />
                <span>Insights</span>
              </div>
              <h1>{author.name}</h1>
              <p className="author-role">{author.role}</p>
              <p className="lede">{author.bio}</p>
              <a
                className="author-linkedin"
                href={author.linkedIn}
                rel="noreferrer"
                target="_blank"
              >
                <LinkedInIcon />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </section>

        <section className="theme-light author-articles">
          <div className="wrap">
            <div className="kicker">
              <span className="dot" />
              <span>By {author.name}</span>
            </div>
            <h2>Articles by {author.name}.</h2>
            <div className="insights-grid">
              {articles.map((article) => (
                <InsightCard article={article} key={article.slug} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <HeroPixelBlast targetId={contentId} />
    </>
  );
}

function ArticlePage({ slug }: { slug: string }) {
  const article = getInsightArticle(slug);
  if (!article) notFound();

  const author = getInsightAuthor(article.authorSlug);
  if (!author) notFound();

  const moreFromAuthor = getArticlesByAuthor(author.slug).filter(
    (candidate) => candidate.slug !== article.slug,
  );
  const contentId = `page-content-insight-${article.slug}`;

  return (
    <>
      <main id={contentId} className="page-content insight-article-page">
      <article>
        <section className="insight-article-hero">
          <div className="wrap insight-article-hero-inner">
            <a className="insight-back" href="/insights">
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path
                  d="m15 18-6-6 6-6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span>Back to Insights</span>
            </a>
            <h1>{article.title}</h1>
            <p className="lede">{article.summary}</p>
            <div className="article-author-row">
              <a className="article-author" href={`/insights/author-${author.slug}`}>
                <span className="article-author-image">
                  <Image alt="" fill sizes="48px" src={author.image} />
                </span>
                <span>
                  <strong>{author.name}</strong>
                  <small>{author.role}</small>
                </span>
              </a>
              <div className="article-author-meta">
                <span className="insight-category">{article.category}</span>
                <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="theme-light insight-article-body">
          <div className="wrap article-layout">
            <div className="article-content">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}

              <aside className="article-takeaway">
                <span>Key Takeaway</span>
                <p>{article.takeaway}</p>
              </aside>

              <p className="article-source">
                This QuantSentry edition is adapted from an article first published by Quant
                Technology Group. <a href={article.sourceUrl}>Read the original article</a>.
              </p>

              <footer className="article-author-card">
                <div className="article-author-card-image">
                  <Image
                    alt={author.name}
                    fill
                    sizes="(max-width: 560px) 180px, 160px"
                    src={author.image}
                  />
                </div>
                <div className="article-author-card-copy">
                  <span>About the Author</span>
                  <h2>{author.name}</h2>
                  <p className="article-author-card-role">{author.role}</p>
                  <p>{author.bio}</p>
                  <a href={`/insights/author-${author.slug}`}>View Author Profile</a>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </article>

      {moreFromAuthor.length > 0 ? (
        <section className="more-insights">
          <div className="wrap">
            <div className="kicker">
              <span className="dot" />
              <span>More from {author.name}</span>
            </div>
            <div className="insights-grid">
              {moreFromAuthor.slice(0, 2).map((candidate) => (
                <InsightCard article={candidate} key={candidate.slug} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      </main>
      <HeroPixelBlast targetId={contentId} />
    </>
  );
}

export default async function InsightPage({ params }: InsightPageProps) {
  const { slug } = await params;

  if (slug.startsWith("author-")) {
    return <AuthorPage authorSlug={slug.replace(/^author-/, "")} />;
  }

  return <ArticlePage slug={slug} />;
}
