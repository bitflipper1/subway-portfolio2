// DesignMatt-ers — NYC Subway Edition
// Lines = companies / chapters of Matt's career. Stations = projects.
// Content sourced from designmatt-ers.com.

const LINES = {
  honeywell: {
    id: "honeywell",
    name: "Honeywell Line",
    bullet: "1",
    color: "#EE352E",
    description: "Enterprise safety & connected healthcare",
  },
  eda: {
    id: "eda",
    name: "EDA / Top Bid Line",
    bullet: "A",
    color: "#0039A6",
    description: "Equipment data, auctions & design systems",
  },
  ecomdash: {
    id: "ecomdash",
    name: "Ecomdash Line",
    bullet: "4",
    color: "#00933C",
    description: "E-commerce SaaS — onboarding & design system",
  },
  founder: {
    id: "founder",
    name: "Founder Shuttle",
    bullet: "S",
    color: "#FCCC0A",
    darkText: true,
    casing: "#0b0b0b",
    description: "Startups founded: RepRevive, AdSpark, Bitflip",
  },
};

const PROJECTS = [
  {
    id: "safety-suite",
    lineId: "honeywell",
    station: "Safety Suite",
    title: "Safety Suite Transformation",
    role: "Lead, UI Strategy & Design",
    tools: ["Figma", "Design Systems", "AI UX", "NFC / QR"],
    impact:
      "Unified a fragmented ecosystem of desktop apps, mobile apps and docking stations into one intelligent, connected experience.",
    summary:
      "Leading the user interface strategy and design for the next generation of Honeywell's Safety Suite — a global gas detection and safety management platform.",
    caseStudy: [
      {
        heading: "The Challenge",
        body: "Analysis of Safety Suite's existing screens and workflows revealed deeply nested flows and redundant paths. Many users had to switch between desktop apps, mobile apps (Safety Communicator, Device Configurator) and docking stations just to perform simple tasks like firmware updates or alarm calibration.",
      },
      {
        heading: "The Approach",
        body: "Four experience gaps drove the redesign: simplified onboarding that reduces steps and technical jargon; smart device assignment with NFC and QR tap-based pairing; unified visibility bringing fleet, worker and compliance data into one dashboard; and guided AI assistance to reduce dependency on support.",
      },
      {
        heading: "The Outcome",
        body: "The new experience empowers industrial workers, safety managers and technicians through AI, NFC and a modern design system. AI capabilities include Maintenance Assist (context-aware troubleshooting), Predictive Analytics (fleet readiness inferred from calibration and test logs) and Behavioral AI (worker data predicts risk patterns). I defined the onboarding flow, AI interactions and dashboard systems, and helped shape the integration of Honeywell Forge 2.0 across the experience. NFC/QR-based device assignment became a key competitive differentiator.",
      },
    ],
    link: "https://designmatt-ers.com/safety-suite-transformation",
  },
  {
    id: "lifecare",
    lineId: "honeywell",
    station: "Lifecare Platform",
    title: "Integrated Lifecare Platform",
    role: "UX Design — Healthcare",
    tools: ["Mobile-first", "Design Language", "Clinical UX"],
    impact:
      "Critical clinical communication and medication administration unified into seamless, reliable experiences under one design language.",
    summary:
      "Unifying fragmented clinical workflows and communication channels into a single, intuitive mobile-first platform for Honeywell Intelligent Life Care.",
    caseStudy: [
      {
        heading: "The Challenge",
        body: "The primary goal of the Integrated Lifecare (ILC) Platform initiative was to unify fragmented clinical workflows and communication channels into a single, intuitive mobile-first platform.",
      },
      {
        heading: "The System",
        body: "The UL 1069-certified Systevo Nurse Call system forms the backbone of patient–caregiver communication, integrating with mobile applications like Systevo Connected Life Care to reduce response times and alarm fatigue. The core mobile solution lets caregivers receive patient calls as push notifications on a work device — anytime, anywhere, on the move.",
      },
      {
        heading: "The Outcome",
        body: "The platform achieved its goal of integrating critical clinical communication (Systevo Nurse Call) and medication administration (ILC Medication App) into seamless, reliable experiences guided by a unified design language.",
      },
    ],
    link: "https://designmatt-ers.com/integrated-lifecare-platform",
  },
  {
    id: "eda-redesign",
    lineId: "eda",
    station: "EDA Responsive",
    title: "EDA Responsive Redesign",
    role: "UX Designer & Researcher",
    tools: ["Personas", "User Interviews", "Responsive Design"],
    impact:
      "Replaced an unusable mobile web experience with a fully responsive platform, grounded in personas built from support-team and user interviews.",
    summary:
      "Modernizing a 25-year-old equipment data platform that had evolved from paper packets in the mail, to CDs, to spreadsheets, to an ad-hoc web app.",
    caseStudy: [
      {
        heading: "The Challenge",
        body: "Equipment Data Associates is a 25+ year old company that evolved from mailing physical paper packets of data, to CDs in the 90s, spreadsheets in the 00s, and finally the web. The initial web app was built piece by piece — features added ad hoc and clumped together without oversight or a general plan — turning it into something of a Frankenstein.",
      },
      {
        heading: "The Approach",
        body: "Through product-team meetings we determined requirements and functionality for the redesign, and weighed the level of effort of going fully responsive versus a redesign plus separate mobile site — including how that would affect the existing mobile app. We interviewed the support department to derive user personas, along with several users of the software.",
      },
      {
        heading: "The Outcome",
        body: "The team concluded a responsive experience would be far better than the existing unusable mobile web experience, and the redesign moved forward on that foundation.",
      },
    ],
    link: "https://designmatt-ers.com/eda-responsive-redesign",
  },
  {
    id: "topbid-ds",
    lineId: "eda",
    station: "TopBid System",
    title: "TopBid Design System",
    role: "UX Designer — Design Systems",
    tools: ["Design System", "Bootstrap", "Agile"],
    impact:
      "Development with the offshore team became dramatically more efficient, and the new TopBid interface shipped.",
    summary:
      "A design system built to fix development delays caused by communication gaps and time-zone differences with offshore developers.",
    caseStudy: [
      {
        heading: "The Challenge",
        body: "The TopBid product team experienced delays in development with offshore developers due to communication and time differences.",
      },
      {
        heading: "The Approach",
        body: "We built a design system covering consistent colors, fonts, font sizes, forms, buttons, page layout and other components — built on the Bootstrap framework — and took input from the offshore developers as the system came together.",
      },
      {
        heading: "The Outcome",
        body: "The development process became much more efficient, and the product team launched the new TopBid interface using Agile, working closely with developers and business analysts.",
      },
    ],
    link: "https://designmatt-ers.com/topbid-design-system",
  },
  {
    id: "topbid-mobile",
    lineId: "eda",
    station: "Top Bid Mobile",
    title: "Top Bid Mobile App",
    role: "Product Designer",
    tools: ["Prototyping", "Mobile", "Stakeholder Decks"],
    impact:
      "Prototype and sales materials used in presentations to internal stakeholders.",
    summary:
      "An offline mobile serial-number app for construction and agriculture equipment dealers to verify the age of equipment before purchasing at auction.",
    caseStudy: [
      {
        heading: "The Project",
        body: "Top Bid is an offline mobile serial-number app used by construction and ag equipment dealers to verify the age of equipment before purchasing at auction. Working offline matters: auction yards are exactly the kind of place where connectivity fails.",
      },
      {
        heading: "The Outcome",
        body: "The team created a working prototype along with sales materials that were used in presentations to internal stakeholders.",
      },
    ],
    link: "https://designmatt-ers.com/top-bid-mobile-app",
  },
  {
    id: "ecomdash-onboarding",
    lineId: "ecomdash",
    station: "Ecomdash",
    title: "Ecomdash — Onboarding & Design System",
    role: "Senior UX Designer → Lead UX Designer (2019–2021)",
    tools: ["Figma", "Heuristic Evaluation", "Analytics", "Design System"],
    impact:
      "Improved usability and conversion through research, data-driven design, and design-system standardization.",
    summary:
      "Modernizing the UX of an e-commerce management platform after acquisition, and aligning it with Constant Contact's e-commerce enablement vision.",
    caseStudy: [
      {
        heading: "The Challenge",
        body: "Ecomdash helps small to mid-size online retailers automate listings, inventory and order fulfillment across channels like Amazon, eBay and Shopify. After Endurance acquired the company, the goal was to modernize the UX, improve onboarding, and align the experience with Constant Contact's e-commerce enablement vision. The interface made even simple tasks feel complicated: confusing onboarding, key workflows buried under dense tables, and navigation lacking hierarchy. Analytics showed many new users abandoned the product before completing setup — often after struggling to connect their first sales channel.",
      },
      {
        heading: "The Research",
        body: "I conducted heuristic walkthroughs and screen captures of each competitor's flow from sign-up to first order, mapping each journey side by side in Figma and annotating strengths, friction points and patterns to adopt or differentiate from. Each competitor was evaluated against 10 usability heuristics (Nielsen Norman framework) and 3 design-system criteria: consistency, accessibility, responsiveness.",
      },
      {
        heading: "The Outcome",
        body: "Shopify proved best-in-class for onboarding simplicity — linear, guided setup with clear progress states and contextual tooltips. The takeaways drove the redesign: reduce the number of setup screens and give users a sense of completion to keep them moving. The work landed as a simplified onboarding experience and a standardized design system.",
      },
    ],
    link: "https://designmatt-ers.com/ecomdash-onboarding-design-system",
  },
  {
    id: "reprevive",
    lineId: "founder",
    station: "RepRevive",
    title: "RepRevive — Reputation Management App",
    role: "Founder & Designer",
    tools: ["iOS", "Survey UX", "Startup"],
    impact:
      "Customers are routed by a frictionless survey into leaving feedback, following on social media, or posting a review.",
    summary:
      "An iOS app for Charlotte-based startup RepRevive.com — reputation management software for business.",
    caseStudy: [
      {
        heading: "The Project",
        body: "RepRevive.com is a Charlotte-based reputation management software solution for business — one of the companies I founded. The iOS app centers on a frictionless survey sent to customers.",
      },
      {
        heading: "How It Works",
        body: "Based on their survey response, customers are encouraged down the right path: leave private feedback, follow the business on social media, or post a public review. Happy customers amplify; unhappy customers get heard before they post.",
      },
    ],
    link: "https://designmatt-ers.com/reputation-management-mobile-app-reprevivecom",
  },
];

// Minor stations on the Founder Shuttle (no dedicated case study — they jump to About).
const MINOR_STATIONS = [
  {
    id: "adspark",
    lineId: "founder",
    station: "AdSpark",
    note: "Promotional products & store integration",
  },
  {
    id: "bitflip",
    lineId: "founder",
    station: "Bitflip",
    note: "Design, development & hosting studio",
  },
];

const ABOUT = {
  tagline: "Great design is invisible.",
  body: [
    "I'm Matt McGlothlin, a UX design leader based in Charlotte, NC. I've designed for companies ranging from Fortune 100 giants — Bank of America, Honeywell, Wells Fargo — to startups like Ecomdash.",
    "Along the way I've founded companies of my own: RepRevive (online reputation management), AdSpark (promotional products and store integration), and Bitflip (website design, development and hosting).",
    "I treat UX like a transit system: it should be efficient, clear, and get people where they need to go without confusion.",
  ],
  link: "https://designmatt-ers.com/about-1",
};

const PROCESS = {
  title: "Digital Leadership",
  subtitle: "How every line runs — the design process behind the map",
  points: [
    {
      heading: "Research & Analysis",
      body: "Research, analyze and map problems to determine root causes. Through deep research, patterns and themes emerge as solutions crystallize — and by examining problems divergently, creativity flourishes to reveal fresh angles on systemic issues. Competitive analysis benchmarks the experience against industry leaders' workflows, interface patterns and value propositions.",
    },
    {
      heading: "Collaborative Workshops",
      body: "Workshops — preferably in person — validate themes and surface emerging issues. Project strategy is then built directly from those themes and pain points.",
    },
    {
      heading: "Documentation & Alignment",
      body: "Documenting design files is essential to a smooth development process: a standardized system of annotations and captured comments keeps designs healthily documented and teams aligned.",
    },
    {
      heading: "Leadership",
      body: "Leadership grows by accepting daunting design challenges and inspiring the people around you — usually by discovering the superpowers each team member already possesses and fostering open collaboration.",
    },
  ],
  link: "https://designmatt-ers.com/digital-leadership-design-process",
};

const CONTACT = {
  email: "matt@designmatt-ers.com",
  site: "https://designmatt-ers.com",
  linkedin: "https://www.linkedin.com/in/bitflip",
};
