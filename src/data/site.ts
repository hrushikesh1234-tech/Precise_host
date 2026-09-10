export const COMPANY = {
  name: "Precise Industries",
  tagline: "Precision machining, tool room & die-mould components",
  founded: 2025,
  city: "Pune, Maharashtra",
  address: "Gat No. 131, Shop No. 06, Ganesh Nagar, Talawade, Pune 411062",
  phones: ["+91 9850710479"],
  email: "preciseindustries9@gmail.com",
  contactPerson: { name: "Prathamesh Bhase", role: "Director – Operations" },
};

export const STATS = [
  { value: 0.01, suffix: " mm", label: "Machining accuracy", decimals: 2 },
  { value: 2025, suffix: "", label: "Established", decimals: 0 },
  { value: 5000, suffix: "+ sq.ft", label: "Manufacturing facility", decimals: 0 },
  { value: 10, suffix: "+", label: "Skilled manpower", decimals: 0 },
];

export const SERVICES = [
  {
    slug: "vmc",
    title: "VMC Machining",
    summary: "FANUC-controlled vertical machining centres for precision components in batch or prototype volumes.",
    points: ["3-axis FANUC VMC", "Prototype to batch runs", "Tight-tolerance milling"],
  },
  {
    slug: "toolroom",
    title: "Tool Room Job Work",
    summary: "Conventional milling, turning and fitting support for tool rooms and maintenance departments.",
    points: ["Milling & lathe work", "Repair & rework jobs", "Quick turnaround"],
  },
  {
    slug: "die-mould",
    title: "Die & Mould Components",
    summary: "Machining of die and mould inserts, plates and detail components to drawing.",
    points: ["Inserts & plates", "Drawing-based machining", "Fitting support"],
  },
  {
    slug: "alu-ms",
    title: "Aluminium & MS Machining",
    summary: "Precision machining of aluminium, mild steel and high-strength alloy components.",
    points: ["Aluminium components", "MS fabricated parts", "Alloy machining"],
  },
];

export const CAPABILITIES = [
  "FANUC-controlled VMC machines",
  "Conventional milling machines",
  "Conventional lathe machines",
  "Tight-tolerance milling & turning",
  "High-strength alloy machining",
  "Die & mould component machining",
  "Inspection & quality checks",
];

export const PROCESS = [
  { step: "01", title: "Drawing & enquiry", body: "Share your 2D/3D drawing or sample. We review material, tolerance and finish requirements." },
  { step: "02", title: "Quotation", body: "A costed, method-backed quotation with a committed delivery date — usually within 24–48 hours." },
  { step: "03", title: "Manufacturing", body: "Machining and fitting executed in-house with stage-wise dimensional checks." },
  { step: "04", title: "Inspection & dispatch", body: "Final inspection against drawing, documented, packed and dispatched on schedule." },
];
