import Image from "next/image";

import { getInsightAuthor, type InsightArticle } from "@/lib/insights";

type InsightCardProps = {
  article: InsightArticle;
  featured?: boolean;
};

export function InsightCard({ article, featured = false }: InsightCardProps) {
  const author = getInsightAuthor(article.authorSlug);

  return (
    <article className={`insight-card${featured ? " insight-card-featured" : ""}`}>
      <a className="insight-card-main" href={`/insights/${article.slug}`}>
        <div className="insight-card-meta">
          <span className="insight-category">{article.category}</span>
          <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
        </div>
        <h2>{article.title}</h2>
        <p>{article.summary}</p>
      </a>
      <div className="insight-card-footer">
        {author ? (
          <a className="insight-card-author" href={`/insights/author-${author.slug}`}>
            <span className="insight-card-avatar">
              <Image alt="" fill loading="eager" sizes="28px" src={author.image} />
            </span>
            <span>{author.name}</span>
          </a>
        ) : (
          <span>QuantSentry</span>
        )}
        <span>{article.readTime}</span>
      </div>
    </article>
  );
}
