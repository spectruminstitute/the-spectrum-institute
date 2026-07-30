const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE = 'https://spectruminstitute.uk';
const LOGO = `${SITE}/logo.png`;

const pageMeta = {
  'index.html': {
    title: 'The Spectrum Institute (TSI) | Best Technical &amp; Safety Education in Swat',
    description:
      'Official website of The Spectrum Institute (TSI) Barikot &amp; Mingora, Swat. CEO Abid Rasheed. Offering Safety Engineering Diplomas, AI, Cyber Security, ICT, &amp; Technical Skills.',
    canonical: `${SITE}/`,
    ogUrl: `${SITE}/`,
  },
  'about.html': {
    title: 'About TSI | The Spectrum Institute Barikot &amp; Mingora, Swat',
    description:
      'Vision, history, leadership, and dual-campus facilities of The Spectrum Institute — technical and safety education in Barikot &amp; Mingora, Swat.',
    canonical: `${SITE}/about.html`,
  },
  'admissions.html': {
    title: 'Online Admissions Portal | The Spectrum Institute',
    description:
      'Apply online to The Spectrum Institute — admission guidelines, fee overview, and official student registration form for Barikot &amp; Mingora campuses.',
    canonical: `${SITE}/admissions.html`,
  },
  'alumni.html': {
    title: 'Alumni | The Spectrum Institute',
    description:
      'Alumni Association and success stories from The Spectrum Institute, Barikot &amp; Mingora, Swat.',
    canonical: `${SITE}/alumni.html`,
  },
  'contact.html': {
    title: 'Contact Us | The Spectrum Institute Barikot &amp; Mingora',
    description:
      'Contact The Spectrum Institute in Barikot &amp; Mingora, Swat — campus addresses, helplines, map, and general reach-us form.',
    canonical: `${SITE}/contact.html`,
  },
  'courses.html': {
    title: 'Courses | The Spectrum Institute TSI Swat',
    description:
      'Explore Safety Engineering, AI, Cyber Security, ICT, coaching, and language courses at The Spectrum Institute in Barikot &amp; Mingora, Swat.',
    canonical: `${SITE}/courses.html`,
  },
  'faculties.html': {
    title: 'Faculties | The Spectrum Institute',
    description:
      'Department breakdown — Faculty of IT, Computer Engineering &amp; Vocational Skills at The Spectrum Institute (TSI).',
    canonical: `${SITE}/faculties.html`,
  },
  'faculty.html': {
    title: 'Faculty | The Spectrum Institute TSI Swat',
    description:
      'Meet the CEO, directors, instructors, and subject experts at The Spectrum Institute, Barikot &amp; Mingora, Swat.',
    canonical: `${SITE}/faculty.html`,
  },
  'overview.html': {
    title: 'Overview | The Spectrum Institute',
    description:
      'Institute background, scale, and academic footprint of The Spectrum Institute in Barikot &amp; Mingora, Swat.',
    canonical: `${SITE}/overview.html`,
  },
  'research.html': {
    title: 'Research &amp; Innovation | The Spectrum Institute',
    description:
      'R&amp;D and Innovation cell initiatives at The Spectrum Institute, Barikot &amp; Mingora, Swat.',
    canonical: `${SITE}/research.html`,
  },
  'rules.html': {
    title: 'Rules &amp; Code of Conduct | The Spectrum Institute',
    description:
      'Statutes, campus rules, and student code of conduct at The Spectrum Institute.',
    canonical: `${SITE}/rules.html`,
  },
  'vc-message.html': {
    title: "Director's Message | The Spectrum Institute",
    description:
      "Message from the Director / Principal of The Spectrum Institute, Barikot &amp; Mingora, Swat.",
    canonical: `${SITE}/vc-message.html`,
  },
  'verify.html': {
    title: 'Verify Certificate | The Spectrum Institute TSI',
    description:
      'Verify a Spectrum Institute student certificate online using Certificate ID and identity details.',
    canonical: `${SITE}/verify.html`,
  },
  'vision-mission.html': {
    title: 'Vision &amp; Mission | The Spectrum Institute',
    description:
      'Core vision, mission, and values of The Spectrum Institute (TSI) Barikot &amp; Mingora, Swat.',
    canonical: `${SITE}/vision-mission.html`,
  },
};

const faviconBlock = `    <link rel="icon" type="image/png" sizes="32x32" href="logo.png">
    <link rel="icon" type="image/png" sizes="192x192" href="logo.png">
    <link rel="apple-touch-icon" sizes="180x180" href="logo.png">
    <link rel="shortcut icon" href="logo.png">`;

const adminFaviconBlock = `    <link rel="icon" type="image/png" sizes="32x32" href="../logo.png">
    <link rel="icon" type="image/png" sizes="192x192" href="../logo.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../logo.png">
    <link rel="shortcut icon" href="../logo.png">`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'The Spectrum Institute',
  alternateName: [
    'TSI',
    'TSI Swat',
    'Spectrum Institute Barikot',
    'Spectrum Institute Mingora',
  ],
  url: SITE,
  logo: LOGO,
  image: LOGO,
  description:
    'Leading technical and professional training institute in Swat offering Safety Engineering, IT, and AI courses.',
  founder: {
    '@type': 'Person',
    name: 'Abid Rasheed',
    jobTitle: 'CEO / Founder',
  },
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: '1st Floor, Usman Plaza, Main Pull',
      addressLocality: 'Barikot',
      addressRegion: 'Swat',
      addressCountry: 'PK',
    },
    {
      '@type': 'PostalAddress',
      streetAddress: 'Opposite to Mela Ground',
      addressLocality: 'Mingora',
      addressRegion: 'Swat',
      addressCountry: 'PK',
    },
  ],
  telephone: '+923469709296',
  sameAs: [SITE],
};

function socialBlock(title, description, canonical) {
  return `    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="The Spectrum Institute">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${LOGO}">
    <meta property="og:image:alt" content="The Spectrum Institute logo">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${LOGO}">`;
}

function stripExistingSeo(headInner) {
  return headInner
    .replace(/\s*<link rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta property="og:[^"]+"[^>]*>/gi, '')
    .replace(/\s*<meta name="twitter:[^"]+"[^>]*>/gi, '')
    .replace(/\s*<link rel="icon"[^>]*>/gi, '')
    .replace(/\s*<link rel="shortcut icon"[^>]*>/gi, '')
    .replace(/\s*<link rel="apple-touch-icon"[^>]*>/gi, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
}

function updatePublicPage(file) {
  const meta = pageMeta[file];
  if (!meta) return false;
  const p = path.join(root, file);
  let html = fs.readFileSync(p, 'utf8');
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) return false;

  let head = stripExistingSeo(headMatch[1]);

  // Title + description
  if (/<title>[\s\S]*?<\/title>/i.test(head)) {
    head = head.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
  } else {
    head = `\n    <title>${meta.title}</title>` + head;
  }
  if (/<meta name="description"[^>]*>/i.test(head)) {
    head = head.replace(
      /<meta name="description"[^>]*>/i,
      `<meta name="description" content="${meta.description}">`
    );
  } else {
    head = head.replace(
      /<\/title>/i,
      `</title>\n    <meta name="description" content="${meta.description}">`
    );
  }

  const inject = `${faviconBlock}\n${socialBlock(meta.title, meta.description, meta.canonical)}`;
  if (/<link rel="stylesheet"/i.test(head)) {
    head = head.replace(/<link rel="stylesheet"/i, `${inject}\n    <link rel="stylesheet"`);
  } else if (/<link rel="preconnect"/i.test(head)) {
    head = head.replace(/<link rel="preconnect"/i, `${inject}\n    <link rel="preconnect"`);
  } else {
    head += `\n${inject}\n`;
  }

  if (file === 'index.html') {
    const pretty = JSON.stringify(jsonLd, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : '    ' + line))
      .join('\n');
    const ld = `    <script type="application/ld+json">\n${pretty}\n    </script>`;
    head = head.trimEnd() + `\n${ld}\n`;
  }

  html = html.replace(/<head>[\s\S]*?<\/head>/i, `<head>${head}</head>`);
  fs.writeFileSync(p, html);
  return true;
}

function updateAdminFavicons() {
  for (const rel of ['admin/login.html', 'admin/dashboard.html']) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) continue;
    let html = fs.readFileSync(p, 'utf8');
    html = html
      .replace(/\s*<link rel="icon"[^>]*>/gi, '')
      .replace(/\s*<link rel="shortcut icon"[^>]*>/gi, '')
      .replace(/\s*<link rel="apple-touch-icon"[^>]*>/gi, '');
    if (/<link rel="stylesheet"/i.test(html)) {
      html = html.replace(
        /<link rel="stylesheet"/i,
        `${adminFaviconBlock}\n    <link rel="stylesheet"`
      );
    } else if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${adminFaviconBlock}\n</head>`);
    }
    fs.writeFileSync(p, html);
    console.log('admin favicons:', rel);
  }
}

let ok = 0;
for (const file of Object.keys(pageMeta)) {
  if (updatePublicPage(file)) {
    console.log('updated', file);
    ok += 1;
  } else {
    console.log('FAILED', file);
  }
}
updateAdminFavicons();
console.log('done', ok);
