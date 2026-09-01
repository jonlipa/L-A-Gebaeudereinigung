// ============================================================
//  COMPANY DATA – single source of truth for the whole site.
//  1. Replace every value marked TODO with your real data.
//  2. Set `isDemo: false` → all "demo / placeholder" badges,
//     the demo-data button and demo review labels disappear.
// ============================================================
export const SITE = {
  isDemo: true, // TODO: set to false when real data is entered
  name: "L&A Gebäudereinigung",
  shortName: "L&A Clean Service",
  url: "https://www.la-gebaeudereinigung.de", // TODO: replace with live domain
  logo: "https://customer-assets-gfyr7b9c.emergentagent.net/job_000f4ad1-ddb1-44d4-893c-dac6293ad204/artifacts/60kz20kt_image.png",
  phone: "+49 (0) 30 12345678", // TODO: replace
  phoneHref: "tel:+493012345678", // TODO: replace
  email: "info@la-gebaeudereinigung.de", // TODO: replace
  address: {
    street: "Musterstraße 123", // TODO: replace
    city: "10115 Berlin", // TODO: replace
    country: "Deutschland",
  },
  hours: {
    DE: "Mo – Fr: 07:00 – 19:00 Uhr · Sa: 08:00 – 14:00 Uhr",
    EN: "Mon – Fri: 7:00 am – 7:00 pm · Sat: 8:00 am – 2:00 pm",
  },
  serviceArea: { DE: "Berlin & Brandenburg", EN: "Berlin & Brandenburg" }, // TODO: replace
  foundedYear: 2004, // TODO: replace
  legal: {
    owner: "Max Mustermann", // TODO: replace (Geschäftsführung / Inhaber)
    vatId: "DE123456789", // TODO: replace (USt-IdNr.) or leave "" if none
  },
  demoData: {
    name: "Dipl.-Ing. Markus Weber",
    phone: "+49 30 98765432",
    email: "m.weber@berlin-tech-park.de",
    location: "Berlin-Mitte / Alexanderplatz",
    service: "office",
    message:
      "Guten Tag, wir suchen ab nächstem Monat eine tägliche Büroreinigung für unsere 2.500 m² Bürofläche im Technologiepark Berlin.",
  },
};

// ============================================================
//  GOOGLE REVIEWS – replace with real client quotes.
//  rating: 1–5, text is bilingual. Keep 3–8 entries.
// ============================================================
export const REVIEWS = {
  average: 4.9, // TODO: replace with your real Google rating
  count: 127, // TODO: replace with your real review count
  profileUrl: "https://www.google.com/maps", // TODO: link to your Google Business Profile
  items: [
    {
      name: "Sabine Krüger",
      role: { DE: "Facility Managerin, Immobilien AG", EN: "Facility Manager, Real Estate AG" },
      city: "Berlin-Mitte",
      rating: 5,
      text: {
        DE: "Seit drei Jahren betreut L&A unsere 4.000 m² Bürofläche. Absolut zuverlässig, unauffällig und die Qualität ist jeden Morgen spürbar.",
        EN: "L&A has looked after our 4,000 sqm office space for three years. Absolutely reliable, discreet, and the quality is noticeable every morning.",
      },
    },
    {
      name: "Thomas Behrendt",
      role: { DE: "Geschäftsführer, Behrendt Logistik", EN: "Managing Director, Behrendt Logistics" },
      city: "Potsdam",
      rating: 5,
      text: {
        DE: "Die Industriereinigung unserer Lagerhalle lief termingerecht und ohne Störung des Betriebs. Faire Festpreise, klare Kommunikation.",
        EN: "Industrial cleaning of our warehouse was completed on schedule without disrupting operations. Fair fixed prices, clear communication.",
      },
    },
    {
      name: "Dr. Anja Lindqvist",
      role: { DE: "Praxisinhaberin, Zahnmedizin", EN: "Practice Owner, Dental Clinic" },
      city: "Berlin-Charlottenburg",
      rating: 5,
      text: {
        DE: "Hygiene ist bei uns nicht verhandelbar. L&A arbeitet mit ECO-Mitteln und dokumentiert jede Reinigung – genau das, was wir brauchen.",
        EN: "Hygiene is non-negotiable for us. L&A works with ECO products and documents every clean – exactly what we need.",
      },
    },
    {
      name: "Markus Feldmann",
      role: { DE: "Hausverwaltung Feldmann & Partner", EN: "Property Management Feldmann & Partner" },
      city: "Berlin-Prenzlauer Berg",
      rating: 4,
      text: {
        DE: "Treppenhausreinigung für 12 Wohnhäuser – die Mieterbeschwerden sind seit dem Wechsel zu L&A praktisch verschwunden.",
        EN: "Stairwell cleaning for 12 apartment buildings – tenant complaints have practically disappeared since switching to L&A.",
      },
    },
    {
      name: "Julia Sommer",
      role: { DE: "Store Managerin, Fashion Retail", EN: "Store Manager, Fashion Retail" },
      city: "Berlin-Kurfürstendamm",
      rating: 5,
      text: {
        DE: "Streifenfreie Schaufenster, jede Woche pünktlich vor Ladenöffnung. Unser Store sieht aus wie am Eröffnungstag.",
        EN: "Streak-free shop windows, on time every week before opening. Our store looks like it did on launch day.",
      },
    },
    {
      name: "Peter Wolff",
      role: { DE: "Bauleiter, Wolff Bau GmbH", EN: "Site Manager, Wolff Construction" },
      city: "Brandenburg an der Havel",
      rating: 5,
      text: {
        DE: "Bauendreinigung für 3.200 m² Neubau innerhalb von zwei Tagen – Übergabe an den Bauherrn ohne einen einzigen Mangel.",
        EN: "Post-construction cleaning of a 3,200 sqm new build in two days – handover to the client without a single defect.",
      },
    },
  ],
};

export const IMAGES = {
  hero: "https://static.prod-images.emergentagent.com/jobs/000f4ad1-ddb1-44d4-893c-dac6293ad204/images/09f7adadfe2120f4d00a3c6cff5fba21f9f8ba83c082f7dee58980e4f17f5b6c.jpeg",
  ropeCleaner:
    "https://images.unsplash.com/photo-1782864840610-51d4c135a405?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  office: "https://images.unsplash.com/photo-1772001936267-b6058748eff4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
  corridor: "https://images.unsplash.com/photo-1779700314631-1f18b467e0a7?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
};

export const BEFORE_AFTER = [
  {
    before: "https://static.prod-images.emergentagent.com/jobs/000f4ad1-ddb1-44d4-893c-dac6293ad204/images/7ab1bbb45c002170ad9b3e4e8496b203abaf9bc8a93d908b34d2fa19792a3cdd.jpeg",
    after: "https://static.prod-images.emergentagent.com/jobs/000f4ad1-ddb1-44d4-893c-dac6293ad204/images/3dfc15976ec75648ca72ac12cbc09f62acd553ca8e90cf678180f04b0178c37f.jpeg",
  },
  {
    before: "https://static.prod-images.emergentagent.com/jobs/000f4ad1-ddb1-44d4-893c-dac6293ad204/images/8e97965882c1a53a2671c99531bc3087970c67f4f472d9a2ed8703d71ccaec53.jpeg",
    after: "https://static.prod-images.emergentagent.com/jobs/000f4ad1-ddb1-44d4-893c-dac6293ad204/images/d73fd9c83c96a6d527c6a6cdb58e409c4daa26368b9145d5ed532eb1ed355c3e.jpeg",
  },
  {
    before: "https://static.prod-images.emergentagent.com/jobs/000f4ad1-ddb1-44d4-893c-dac6293ad204/images/26190d77979546d87a3ec6ac955ae52ce24e45b078b4eed63f02b8b052ede812.jpeg",
    after: "https://static.prod-images.emergentagent.com/jobs/000f4ad1-ddb1-44d4-893c-dac6293ad204/images/2d83c4952abbbdbc28f26f8efdcbe67527d6a6f13d93d83d089459fcc044a60c.jpeg",
  },
];
