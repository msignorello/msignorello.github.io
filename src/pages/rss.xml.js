import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const articles = (await getCollection("articles")).sort(
    (a, b) => Date.parse(b.data.date) - Date.parse(a.data.date)
  );
  return rss({
    title: "Matt Signorello - Writing",
    description:
      "Original writing on product organizations, technology leadership, operating models, AI, career resilience, and practical execution.",
    site: context.site,
    customData: "<language>en-us</language>",
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: new Date(article.data.date),
      link: `/writing/${article.slug}/`
    }))
  });
}
