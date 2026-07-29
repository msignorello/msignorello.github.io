import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coverDir = join(root, "public", "images", "articles");

const palette = {
  bg: "#f7f7f4",
  surface: "#fffaf0",
  ink: "#141514",
  muted: "#5d6461",
  line: "#d8d8d1",
  red: "#e1483d",
  teal: "#00a6a6",
  yellow: "#f3c43b",
  blue: "#305cde",
  soft: "#eef1ef"
};

const articles = [
  {
    file: "migrating-pfsense-to-opnsense-with-codex.mdx",
    slug: "pfsense-opnsense-codex-migration",
    alt: "Abstract network firewall migration diagram with routed paths and verification checkpoints",
    caption: "Firewall migration / API control plane / packet-path verification",
    accent: palette.blue,
    secondary: palette.teal,
    motif: "firewall"
  },
  {
    file: "vibe-coding-with-openclaw-i-thought-i-was-the-exception.mdx",
    slug: "vibe-coding-openclaw",
    alt: "Abstract homelab, API, and AI agent workflow illustration",
    caption: "Agentic AI / homelab / business tooling",
    accent: palette.teal,
    secondary: palette.yellow,
    motif: "agent"
  },
  {
    file: "be-yourself-like-breakfast-for-dinner-unexpected-but-perfect.mdx",
    slug: "be-yourself-breakfast-for-dinner",
    alt: "Abstract breakfast plate and evening signal illustration about authenticity",
    caption: "Authenticity / career fit / showing up honestly",
    accent: palette.yellow,
    secondary: palette.red,
    motif: "breakfast"
  },
  {
    file: "starting-over-as-a-consultant.mdx",
    slug: "starting-over-consultant",
    alt: "Abstract consulting map with questions, checkpoints, and a practical path forward",
    caption: "Consulting / ambiguity / small useful steps",
    accent: palette.blue,
    secondary: palette.teal,
    motif: "consulting"
  },
  {
    file: "leadership-lessons-from-the-potty-chocolate-chaos-and-a-toddler-s-hustle.mdx",
    slug: "leadership-lessons-potty-training",
    alt: "Abstract reward path and messy execution illustration",
    caption: "Incentives / assumptions / messy execution",
    accent: palette.red,
    secondary: palette.yellow,
    motif: "rewards"
  },
  {
    file: "superheroes-legos-and-ikea-instructions-lessons-from-building-a-house-from-scr.mdx",
    slug: "building-a-house-leadership",
    alt: "Abstract house blueprint, blocks, and project alignment illustration",
    caption: "Project leadership / details / alignment",
    accent: palette.blue,
    secondary: palette.red,
    motif: "blueprint"
  },
  {
    file: "moving-back-home-leadership-lessons-from-my-childhood-bedroom.mdx",
    slug: "moving-back-home",
    alt: "Abstract bedroom floor plan, moving boxes, and change management illustration",
    caption: "Change / family systems / empathy",
    accent: palette.teal,
    secondary: palette.blue,
    motif: "home"
  },
  {
    file: "can-you-hear-me-now-the-problem-with-leadership-dead-zones.mdx",
    slug: "leadership-dead-zones",
    alt: "Abstract communication signal with gaps and reconnecting nodes",
    caption: "Communication / clarity / dead zones",
    accent: palette.teal,
    secondary: palette.red,
    motif: "signal"
  },
  {
    file: "laid-off-some-unspoken-truths.mdx",
    slug: "laid-off-unspoken-truths",
    alt: "Abstract career transition path leaving a fractured office grid",
    caption: "Career resilience / layoff recovery / next chapter",
    accent: palette.red,
    secondary: palette.blue,
    motif: "transition"
  },
  {
    file: "laid-off-some-unspoken-truths-part-deux.mdx",
    slug: "laid-off-part-deux",
    alt: "Abstract leadership network and compass illustration after a transition",
    caption: "Leadership after layoff / identity / support network",
    accent: palette.blue,
    secondary: palette.yellow,
    motif: "network"
  },
  {
    file: "how-to-be-a-jedi-in-a-leadership-shift-lessons-in-navigating-the-dark-side.mdx",
    slug: "leadership-shift-values",
    alt: "Abstract light and shadow leadership compass illustration",
    caption: "Values / culture shift / principled leadership",
    accent: palette.yellow,
    secondary: palette.blue,
    motif: "compass"
  },
  {
    file: "no-smoking-are-you-a-workplace-arsonist.mdx",
    slug: "workplace-arsonist",
    alt: "Abstract workplace risk, spark containment, and culture warning illustration",
    caption: "Culture / team risk / leadership restraint",
    accent: palette.red,
    secondary: palette.teal,
    motif: "risk"
  },
  {
    file: "leading-with-the-refill-washer-fluid-approach.mdx",
    slug: "refill-washer-fluid-leadership",
    alt: "Abstract dashboard alert, windshield arc, and fluid drop illustration",
    caption: "Service leadership / timing / knowing when to act",
    accent: palette.teal,
    secondary: palette.yellow,
    motif: "washer"
  },
  {
    file: "technology-services-business-consulting.mdx",
    slug: "technology-services-consulting",
    alt: "Abstract technology services, operations, and business consulting workflow illustration",
    caption: "TechBoot / technology services / practical consulting",
    accent: palette.blue,
    secondary: palette.teal,
    motif: "systems"
  }
];

function esc(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function base({ slug, accent, secondary, alt, motif }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="800" viewBox="0 0 1600 800" role="img" aria-labelledby="title desc">
  <title id="title">${esc(alt)}</title>
  <desc id="desc">Editorial cover image for ${esc(slug)}.</desc>
  <defs>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="${palette.ink}" stroke-opacity=".055" stroke-width="1.5"/>
    </pattern>
    <filter id="paper" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 .07"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
  </defs>
  <rect width="1600" height="800" fill="${palette.bg}"/>
  <rect width="1600" height="800" fill="url(#grid)"/>
  <g filter="url(#paper)">
    <rect x="118" y="96" width="222" height="518" rx="8" fill="${accent}" opacity=".88"/>
    <rect x="1232" y="130" width="248" height="438" rx="8" fill="${palette.surface}" stroke="${palette.line}" stroke-width="3"/>
    <rect x="392" y="168" width="706" height="480" rx="10" fill="${palette.ink}"/>
    <rect x="1108" y="430" width="278" height="218" rx="8" fill="${palette.ink}"/>
    <path d="M132 586H420M1098 408H1458M250 210H574M980 650h360" fill="none" stroke="${palette.ink}" stroke-opacity=".35" stroke-width="4"/>
    <circle cx="290" cy="214" r="9" fill="${accent}"/>
    <circle cx="576" cy="210" r="9" fill="${palette.ink}"/>
    <circle cx="1098" cy="408" r="9" fill="${accent}"/>
    <circle cx="1458" cy="408" r="9" fill="${palette.ink}"/>
    <g stroke="${palette.ink}" stroke-opacity=".32" stroke-width="3" fill="none">
      <path d="M130 172c62-30 118-50 168-61"/>
      <path d="M1324 186h102v112h-64v118h-80"/>
      <path d="M228 654v-98h118v-82"/>
      <path d="M1164 176v98h-66v82"/>
    </g>
    ${motifSvg(motif, accent, secondary)}
    <g opacity=".9">
      <circle cx="130" cy="210" r="5" fill="${palette.ink}"/>
      <circle cx="153" cy="210" r="5" fill="${palette.ink}"/>
      <circle cx="176" cy="210" r="5" fill="${palette.ink}"/>
      <circle cx="1350" cy="620" r="7" fill="${secondary}"/>
      <circle cx="1400" cy="620" r="7" fill="${accent}"/>
      <circle cx="1450" cy="620" r="7" fill="${palette.ink}"/>
    </g>
  </g>
</svg>
`;
}

function motifSvg(motif, accent, secondary) {
  const white = "rgba(255,255,255,.78)";
  const muted = "rgba(255,255,255,.42)";
  const stroke = `stroke="${white}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  switch (motif) {
    case "firewall":
      return `<g transform="translate(484 216)">
        <circle cx="70" cy="204" r="44" fill="${accent}"/>
        <circle cx="650" cy="112" r="36" fill="${secondary}"/>
        <circle cx="650" cy="296" r="36" fill="${secondary}"/>
        <path d="M118 204h102M516 158l98-36M516 250l98 36" ${stroke}/>
        <rect x="220" y="60" width="296" height="288" rx="14" fill="none" stroke="${white}" stroke-width="6"/>
        <path d="M220 132h296M220 204h296M220 276h296M294 60v72M442 60v72M368 132v72M294 204v72M442 204v72M368 276v72" stroke="${muted}" stroke-width="5"/>
        <path d="M148 172l34 32-34 32M554 128l34-20-10 38M554 270l34 20-10-38" ${stroke}/>
        <circle cx="368" cy="204" r="34" fill="${palette.ink}" stroke="${accent}" stroke-width="8"/>
        <path d="M352 204l14 14 26-34" ${stroke}/>
      </g>`;
    case "agent":
      return `<g transform="translate(490 245)">
        <rect x="0" y="0" width="510" height="326" rx="18" fill="none" stroke="${muted}" stroke-width="4"/>
        <circle cx="255" cy="164" r="54" fill="${accent}"/>
        <circle cx="112" cy="80" r="46" fill="none" stroke="${white}" stroke-width="5"/>
        <circle cx="408" cy="84" r="46" fill="none" stroke="${white}" stroke-width="5"/>
        <circle cx="112" cy="256" r="46" fill="none" stroke="${white}" stroke-width="5"/>
        <circle cx="408" cy="256" r="46" fill="none" stroke="${white}" stroke-width="5"/>
        <path d="M148 108l64 38M363 110l-64 37M148 236l64-38M362 234l-64-36" ${stroke}/>
        <path d="M235 147l-24 18 24 18M275 147l24 18-24 18" ${stroke}/>
        <path d="M100 80h24M396 84h24M96 256h32M394 256h30" ${stroke}/>
        <rect x="612" y="198" width="126" height="92" rx="8" fill="${secondary}"/>
        <path d="M632 222h76M632 248h56M632 274h34" stroke="${palette.ink}" stroke-width="5"/>
      </g>`;
    case "breakfast":
      return `<g transform="translate(500 238)">
        <circle cx="250" cy="170" r="138" fill="none" stroke="${white}" stroke-width="9"/>
        <circle cx="250" cy="170" r="92" fill="${palette.surface}" opacity=".16"/>
        <circle cx="224" cy="148" r="28" fill="${secondary}"/>
        <circle cx="292" cy="188" r="34" fill="${accent}"/>
        <path d="M96 60c78-72 220-98 330-20" ${stroke}/>
        <path d="M96 288c98 56 236 62 340 6" ${stroke}/>
        <path d="M480 98v148M508 98v148M536 98v148" ${stroke}/>
        <path d="M42 118c70-12 118 30 120 88" stroke="${secondary}" stroke-width="8" fill="none"/>
        <circle cx="640" cy="76" r="34" fill="${secondary}"/>
        <path d="M620 300c40-66 102-108 176-126" stroke="${accent}" stroke-width="8" fill="none"/>
      </g>`;
    case "consulting":
      return `<g transform="translate(492 240)">
        <rect x="30" y="32" width="448" height="294" rx="18" fill="none" stroke="${white}" stroke-width="5"/>
        <path d="M68 104h148M68 160h210M68 216h156" ${stroke}/>
        <circle cx="376" cy="104" r="32" fill="${accent}"/>
        <circle cx="376" cy="214" r="32" fill="${secondary}"/>
        <path d="M408 104c82 28 130 82 144 164M408 214c84-8 144-44 182-108" ${stroke}/>
        <path d="M554 90h140v198H554z" fill="${palette.surface}" opacity=".16" stroke="${muted}" stroke-width="4"/>
        <path d="M584 126h78M584 164h48M584 204h84M584 244h60" ${stroke}/>
      </g>`;
    case "rewards":
      return `<g transform="translate(500 226)">
        <path d="M46 310c80-144 176-220 288-228s206 50 292 174" ${stroke}/>
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${98 + i * 96}" y="${282 - i * 42}" width="56" height="56" rx="12" fill="${i % 2 ? secondary : accent}"/>`).join("")}
        <circle cx="640" cy="104" r="44" fill="none" stroke="${white}" stroke-width="6"/>
        <path d="M620 104l16 16 32-38" ${stroke}/>
        <rect x="610" y="230" width="104" height="104" rx="12" fill="${palette.surface}" opacity=".15" stroke="${muted}" stroke-width="4"/>
        <path d="M636 276h52M662 250v52" ${stroke}/>
      </g>`;
    case "blueprint":
      return `<g transform="translate(486 220)">
        <path d="M70 314V150l192-112 192 112v164" ${stroke}/>
        <path d="M162 314V202h122v112M70 150h384" ${stroke}/>
        <rect x="522" y="90" width="72" height="72" rx="8" fill="${accent}"/>
        <rect x="604" y="170" width="72" height="72" rx="8" fill="${secondary}"/>
        <rect x="520" y="252" width="72" height="72" rx="8" fill="${palette.surface}" opacity=".18" stroke="${muted}" stroke-width="4"/>
        <path d="M548 116h22M630 196h22M548 278h22" ${stroke}/>
        <path d="M78 374h592M98 410h220M356 410h142" stroke="${muted}" stroke-width="4"/>
      </g>`;
    case "home":
      return `<g transform="translate(500 230)">
        <rect x="70" y="42" width="420" height="284" rx="14" fill="none" stroke="${white}" stroke-width="5"/>
        <path d="M70 154h420M222 42v284M348 154v172" ${stroke}/>
        <rect x="552" y="96" width="98" height="82" rx="8" fill="${accent}"/>
        <rect x="588" y="196" width="98" height="82" rx="8" fill="${secondary}"/>
        <path d="M110 96h72M262 96h46M388 210h54M108 250h76" stroke="${muted}" stroke-width="5"/>
        <path d="M596 66l42-36 42 36" ${stroke}/>
      </g>`;
    case "signal":
      return `<g transform="translate(500 228)">
        <circle cx="104" cy="176" r="42" fill="${accent}"/>
        <circle cx="606" cy="176" r="42" fill="${secondary}"/>
        <path d="M152 176h112M420 176h138" ${stroke}/>
        <path d="M290 176h100" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-dasharray="4 26"/>
        <path d="M254 90c58-46 144-46 204 0M224 52c82-72 208-72 292 0M254 262c58 46 144 46 204 0M224 300c82 72 208 72 292 0" ${stroke}/>
        <rect x="298" y="134" width="82" height="82" rx="16" fill="${palette.surface}" opacity=".16" stroke="${muted}" stroke-width="4"/>
      </g>`;
    case "transition":
      return `<g transform="translate(500 230)">
        <rect x="30" y="70" width="252" height="250" rx="10" fill="none" stroke="${muted}" stroke-width="5"/>
        <path d="M84 70v250M138 70v250M192 70v250M246 70v250M30 132h252M30 194h252M30 256h252" stroke="${muted}" stroke-width="3"/>
        <path d="M294 206c94-78 210-104 346-78" ${stroke}/>
        <path d="M604 92l40 36-48 24" ${stroke}/>
        <circle cx="334" cy="180" r="18" fill="${accent}"/>
        <circle cx="438" cy="142" r="18" fill="${secondary}"/>
        <circle cx="548" cy="126" r="18" fill="${accent}"/>
      </g>`;
    case "network":
      return `<g transform="translate(504 220)">
        <circle cx="302" cy="180" r="76" fill="${accent}"/>
        ${[[128,94],[512,88],[118,290],[512,292],[302,340]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="42" fill="none" stroke="${white}" stroke-width="5"/>`).join("")}
        <path d="M164 116l84 42M472 112l-104 48M164 272l90-56M470 270l-104-56M302 256v44" ${stroke}/>
        <path d="M286 180l22 22 50-62" ${stroke}/>
        <circle cx="650" cy="184" r="52" fill="${secondary}"/>
        <path d="M650 142v84M608 184h84" stroke="${palette.ink}" stroke-width="5"/>
      </g>`;
    case "compass":
      return `<g transform="translate(500 216)">
        <circle cx="300" cy="204" r="144" fill="none" stroke="${white}" stroke-width="6"/>
        <path d="M300 60v288M156 204h288" ${stroke}/>
        <path d="M300 88l58 116-58 116-58-116z" fill="${accent}"/>
        <path d="M300 88l58 116H300z" fill="${secondary}"/>
        <path d="M520 72l132 132-132 132" fill="none" stroke="${muted}" stroke-width="5"/>
        <path d="M78 72L210 204 78 336" fill="none" stroke="${muted}" stroke-width="5"/>
        <circle cx="300" cy="204" r="16" fill="${palette.ink}" stroke="${white}" stroke-width="5"/>
      </g>`;
    case "risk":
      return `<g transform="translate(500 230)">
        <rect x="80" y="72" width="420" height="236" rx="14" fill="none" stroke="${white}" stroke-width="5"/>
        <path d="M128 116h324M128 264h324" ${stroke}/>
        <path d="M172 264l56-148 56 148M206 212h48" stroke="${accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M372 118c62 58 70 112 26 166 76-42 104-122 38-206" fill="${secondary}" opacity=".9"/>
        <path d="M620 112l56 56-56 56-56-56z" fill="${accent}"/>
        <path d="M598 168h44" stroke="${palette.ink}" stroke-width="8"/>
      </g>`;
    case "washer":
      return `<g transform="translate(496 230)">
        <path d="M70 242c74-132 190-198 348-198s274 66 348 198" ${stroke}/>
        <path d="M132 242h572" ${stroke}/>
        <path d="M178 194c90-62 196-92 318-72" stroke="${secondary}" stroke-width="8" fill="none"/>
        <path d="M420 272c0 46-36 82-80 82s-80-36-80-82c0-54 80-128 80-128s80 74 80 128z" fill="${accent}"/>
        <path d="M540 188h128M540 232h86M540 276h142" stroke="${muted}" stroke-width="5"/>
      </g>`;
    case "systems":
      return `<g transform="translate(500 226)">
        <rect x="70" y="56" width="180" height="126" rx="12" fill="none" stroke="${white}" stroke-width="5"/>
        <rect x="418" y="56" width="180" height="126" rx="12" fill="none" stroke="${white}" stroke-width="5"/>
        <rect x="242" y="242" width="180" height="126" rx="12" fill="none" stroke="${white}" stroke-width="5"/>
        <path d="M250 118h168M332 182v60M250 304H132V182M422 304h112V182" ${stroke}/>
        <circle cx="250" cy="118" r="16" fill="${accent}"/>
        <circle cx="418" cy="118" r="16" fill="${secondary}"/>
        <circle cx="332" cy="242" r="16" fill="${accent}"/>
        <path d="M114 104h92M462 104h92M288 292h92" stroke="${muted}" stroke-width="5"/>
        <path d="M114 140h58M462 140h58M288 328h58" stroke="${muted}" stroke-width="5"/>
      </g>`;
    default:
      return "";
  }
}

mkdirSync(coverDir, { recursive: true });

for (const article of articles) {
  const imagePath = `/images/articles/${article.slug}.png`;
  const svg = base(article);
  writeFileSync(join(coverDir, `${article.slug}.svg`), svg);
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(coverDir, `${article.slug}.png`));

  const mdxPath = join(root, "src", "content", "articles", article.file);
  const original = readFileSync(mdxPath, "utf8");
  const coverPattern =
    /coverImage:\n  src: "[^"]+"\n  alt: "[^"]+"\n  caption: "[^"]+"/;
  if (!coverPattern.test(original)) {
    throw new Error(`Could not find coverImage block in ${article.file}`);
  }
  const updated = original.replace(
    coverPattern,
    `coverImage:\n  src: "${imagePath}"\n  alt: "${article.alt}"\n  caption: "${article.caption}"`
  );

  if (updated !== original) {
    writeFileSync(mdxPath, updated);
  }
}

console.log(`Generated ${articles.length} article covers in ${coverDir}`);
