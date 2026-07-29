import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://mattsignorello.com",
  integrations: [mdx(), sitemap()],
  output: "static",
  devToolbar: {
    enabled: false
  },
  trailingSlash: "always",
  redirects: {
    "/2024/09/30/coping-with-layoffs-career-resilience/": "/writing/laid-off-some-unspoken-truths/",
    "/2020/04/23/technology-services-business-consulting/": "/writing/technology-services-business-consulting/",
    "/lucy-a-pawsome-french-bulldog/": "/features/lucy/",
    "/projects-and-ventures/": "/writing/",
    "/agile-business-technology-professional/": "/resume/",
    "/sample-page/": "/",
    "/home/": "/",
    "/extra/": "/"
  }
});
