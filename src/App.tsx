import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoogleSignIn from "./components/GoogleSignIn";
import type { AxiosResponse } from "axios";
import { api } from "./api";
import {
  Search,
  Upload,
  ChevronRight,
  X,
  Grid as GridIcon,
  Image as ImageIcon,
  Film,
  FileText,
  ChevronDown,
  LogIn,
  Heart,
  Flag,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";

// --- import local assets so Vite resolves them correctly ---
import BambooImg from "./assets/Bamboo.png";
import CartilageImg from "./assets/cartilage.png";
import CiliatedImg from "./assets/ciliated_epithelium.png";
// import ControlImg from "./assets/control.png";
// import BrainImg from "./assets/brain.png";
// import BodyImg from "./assets/body.png";
/** ----------------------------------------------------
 * Physics Wallah Logo (placeholder)
 * Replace with official SVG when available
 -----------------------------------------------------*/
const PhysicsWallahLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 160 40"
    role="img"
    aria-label="Creative Hub"
    height="40"
    width="auto"
    {...props}
  >
    <g fill="none" fillRule="evenodd">
      <image href="/pw-logo.png" x="0" y="0" height="40" width="40" />
      <text
        x="46"
        y="25"
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        fontSize="16"
        fontWeight="700"
        fill="#111"
      >
        Creative Hub
      </text>
    </g>
  </svg>
);

/* ============================== Types ============================== */
export type Review = {
  status?: "allotted" | "commented" | "passed";
  assignedTo?: string;
  assignedToName?: string;
  comment?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string; // ISO
};

type SMEApproval = {
  status: "yellow" | "green";
  approvedByEmail?: string;
  approvedAt?: string; // ISO
};

export type Asset = {
  id: string;
  title: string; // Saved as: BaseTitle[CODE] V1
  type: "photo" | "video" | "document" | "vector";
  thumb: string; // object URL or CDN URL
  tags: string[]; // 3–10 tags for images
  uploadedBy: string; // uploader email
  uploaderRole?: "admin" | "sme" | "user";

  createdAt: string; // ISO
  downloads: number;
  dominantColor: string;
  width: number;
  height: number;
  views: number;
  // taxonomy (mostly for images)
  grade?: string; // "9" | "10" | "11" | "12"
  stream?: string; // Science | Commerce | Humanities
  subject?: string; // Physics, Accountancy, etc
  chapter?: string;
  topic?: string;
  subtopic?: string;
  artStyle?: string; // Pixar | Vector | Semi Realistic | Realistic
  version?: string; // V1 default
  code?: string; // 9-char code GG SSS CC AA
  folderPath?: string; // grade-subject-chapter-topic-subtopic
  review?: Review;
  approval?: SMEApproval;
};

/* ============================== Auth (mock) ============================== */
// Only allow @pw.live emails. Define admins explicitly.
type User = { email: string; name: string; role: "admin" | "sme" | "user" };

/* =====================================================
   Data
   ===================================================== */
const CURR_DATE = new Date().toISOString();

const MOCK_ASSETS: Asset[] = [
  {
    id: "asset_bamboo",
    title: "Bamboo (Plant Tissue context)",
    type: "photo",
    thumb: BambooImg, // <<< changed
    dominantColor: "emerald",
    width: 3000,
    height: 2000,
    tags: ["grade10", "science", "tissues", "plant", "bamboo"],
    uploadedBy: "Kanak Ahuja",
    createdAt: CURR_DATE,
    downloads: 120,
    views: 980,
    grade: "10",
    subject: "Science",
    chapter: "Tissues",
    topic: "Bamboo",
    approval: { status: "yellow" },
  },
  {
    id: "asset_cartilage",
    title: "Cartilage (Connective Tissue)",
    type: "photo",
    thumb: CartilageImg, // <<< changed
    dominantColor: "amber",
    width: 3000,
    height: 2000,
    tags: ["grade9", "science", "tissues", "connective", "cartilage"],
    uploadedBy: "Teacher",
    createdAt: CURR_DATE,
    downloads: 105,
    views: 870,
    grade: "9",
    subject: "Science",
    chapter: "Tissues",
    topic: "Cartilage",
    approval: { status: "yellow" },
  },
  {
    id: "asset_ciliated",
    title: "Ciliated Epithelium (Epithelial Tissue)",
    type: "photo",
    thumb: CiliatedImg, // <<< changed
    dominantColor: "violet",
    width: 3000,
    height: 2000,
    tags: ["grade9", "science", "tissues", "epithelial", "ciliated_epithelium"],
    uploadedBy: "Kanak",
    createdAt: CURR_DATE,
    downloads: 97,
    views: 760,
    grade: "9",
    subject: "Science",
    chapter: "Tissues",
    topic: "Ciliated_epithelium",
    approval: { status: "yellow" },
  },
  // {
  //   id: "asset_control",
  //   title: "Control and Coordination",
  //   type: "photo",
  //   thumb: ControlImg,
  //   dominantColor: "blue",
  //   width: 3000,
  //   height: 2000,
  //   tags: ["grade10", "Biology", "control", "coordination", "nervous system"],
  //   uploadedBy: "Admin",
  //   createdAt: CURR_DATE,
  //   downloads: 45,
  //   views: 310,
  //   grade: "10",
  //   subject: "Biology",
  //   chapter: "Control and Coordination",
  //   topic: "Nervous System",
  // },
  // {
  //   id: "asset_brain",
  //   title: "Human Brain",
  //   type: "photo",
  //   thumb: BrainImg,
  //   dominantColor: "pink",
  //   width: 3000,
  //   height: 2000,
  //   tags: ["grade10", "bio", "nervous system", "brain", "CNS"],
  //   uploadedBy: "Teacher",
  //   createdAt: CURR_DATE,
  //   downloads: 53,
  //   views: 420,
  //   grade: "10",
  //   subject: "Biology",
  //   chapter: "Control and Coordination",
  //   topic: "Brain",
  // },
  // {
  //   id: "asset_body",
  //   title: "Nervous System in Human Body",
  //   type: "photo",
  //   thumb: BodyImg,
  //   dominantColor: "cyan",
  //   width: 3000,
  //   height: 2000,
  //   tags: ["grade10", "science", "nervous system", "human body", "neurons"],
  //   uploadedBy: "Kanak Ahuja",
  //   createdAt: CURR_DATE,
  //   downloads: 60,
  //   views: 500,
  //   grade: "10",
  //   subject: "Biology",
  //   chapter: "Control and Coordination",
  //   topic: "Peripheral Nervous System",
  // },
];
/* ============================== Small UI helpers ============================== */
const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block rounded-full border px-2 py-0.5 text-xs text-gray-600 bg-white/60 backdrop-blur">
    {children}
  </span>
);

const StatusBadge: React.FC<{ status?: Review["status"] }> = ({ status }) => {
  if (!status) return null;
  const cfg = {
    passed: {
      label: "Passed",
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    commented: {
      label: "Comment added",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    allotted: {
      label: "Allotted",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
  } as const;
  const s = cfg[status];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

const ApprovalPill: React.FC<{
  approval?: SMEApproval;
  canToggle?: boolean;
  onToggle?: () => void;
}> = ({ approval, canToggle, onToggle }) => {
  const isGreen = approval?.status === "green";
  const cls = isGreen
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  const Icon = isGreen ? Check : AlertTriangle;
  const label = isGreen ? "SME Approved" : "Not approved";

  const shared =
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium";

  if (canToggle) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
        aria-pressed={isGreen}
        title={
          isGreen
            ? "Click to mark as NOT approved"
            : "Click to mark as SME approved"
        }
        className={`${shared} ${cls}`}
      >
        <Icon className="h-3 w-3" />
        {label}
      </button>
    );
  }
  return (
    <span className={`${shared} ${cls}`} title={label}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const FieldError: React.FC<{ show?: boolean; msg?: string }> = ({
  show,
  msg,
}) =>
  show ? (
    <p className="mt-1 text-[11px] text-red-600">
      {msg || "This field should be filled"}
    </p>
  ) : null;

const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, options, placeholder, disabled }) => (
  <div className="relative">
    <select
      aria-label={placeholder || "Select"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border bg-white disabled:bg-gray-100 disabled:text-gray-400"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
  </div>
);

/* ============================== Hierarchy data (Filters & Upload) ============================== */
const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  "9": ["Science"],
  "10": ["Biology", "Physics", "Chemistry"],
  "11|Science": ["Physics"],
  "11|Commerce": ["Accountancy"],
  "11|Humanities": ["History"],
  "12|Science": ["Physics"],
  "12|Commerce": ["Accountancy"],
  "12|Humanities": ["History"],
};

const CHAPTERS_BY_SUBJECT: Record<string, string[]> = {
  "9|Science": ["Tissues", "Force & Laws of Motion", "Gravitation"],
  "10|Biology": ["Control and Coordination"],
  "10|Physics": ["Electricity", "Light", "Human Eye & Colourful World"],
  "11|Science|Physics": ["Laws of Motion", "Work, Energy, Power"],
  "11|Commerce|Accountancy": ["Accounting Equations", "Journal Entries"],
  "11|Humanities|History": ["Early Societies", "Changing Traditions"],
  "12|Science|Physics": ["Electrostatics"],
  "12|Commerce|Accountancy": ["Partnership Accounts"],
  "12|Humanities|History": ["Modern India"],
};

const TOPICS_BY_CHAPTER: Record<string, string[]> = {
  "9|Science|Tissues": ["Ciliated_epithelium", "Cartilage"],
  "10|Biology|Control and Coordination": [
    "Nervous System",
    "Brain",
    "Peripheral Nervous System",
  ],
  "10|Physics|Electricity": ["Ohm’s Law", "Series & Parallel Circuits"],
  "11|Science|Physics|Laws of Motion": ["Newton’s Laws", "Friction"],
  "11|Commerce|Accountancy|Journal Entries": [
    "Rules of Debit and Credit",
    "Ledger Posting",
  ],
  "11|Humanities|History|Early Societies": [
    "Nomadic Life",
    "Agricultural Settlements",
  ],
};

const SUBTOPICS_BY_TOPIC: Record<string, string[]> = {
  "9|Science|Motion|Speed/Velocity/Acceleration": [
    "Average Speed",
    "Uniform vs Non-uniform Motion",
  ],
  "10|Physics|Electricity|Series & Parallel Circuits": [
    "Resistance in Series",
    "Resistance in Parallel",
  ],
  "11|Science|Physics|Laws of Motion|Newton’s Laws": [
    "First Law (Inertia)",
    "Second Law (F = ma)",
    "Third Law (Action-Reaction)",
  ],
  "11|Commerce|Accountancy|Journal Entries|Ledger Posting": [
    "Balancing Accounts",
  ],
};

const STREAMS = ["Science", "Commerce", "Humanities"] as const;
const ART_STYLES = ["Pixar", "Vector", "Semi Realistic", "Realistic"] as const;
const ART_STYLE_CODES: Record<string, string> = {
  Pixar: "PX",
  Vector: "VE",
  "Semi Realistic": "SR",
  Realistic: "RL",
};

// Nomenclature helpers
const pad2 = (n: number | string) => String(n).padStart(2, "0");
const toSubjCode = (s: string) =>
  s
    .replace(/[^a-z]/gi, "")
    .toUpperCase()
    .slice(0, 3) || "XXX";
export const buildCode = (
  grade: string,
  subject: string,
  chapterNo: string,
  artStyle: string
) => {
  const g = pad2(grade);
  const s = toSubjCode(subject);
  const c = pad2(chapterNo || "01");
  const a = ART_STYLE_CODES[artStyle] || "XX";
  // 2 + 3 + 2 + 2 = 9
  return `${g}${s}${c}${a}`;
};

/* ============================== Developer Tests (lightweight) ============================== */
(function runDevTests() {
  try {
    console.assert(
      buildCode("10", "Physics", "01", "Pixar").length === 9,
      "code length should be 9"
    );
    console.assert(
      buildCode("9", "Science", "7", "Vector").endsWith("VE"),
      "art style code mapping"
    );
    console.assert(
      buildCode("11", "Accountancy", "3", "Realistic").slice(2, 5) ===
        "ACC".slice(0, 3),
      "subject code 3 letters"
    );
  } catch (e) {
    // no-op in production
  }
})();

// ==== REPORT FORM CONFIG ====
const FORM_BASE =
  "https://docs.google.com/forms/d/e/1FAIpQLScVohl7aCCIeVxAmLzWRzk_t6b_aGmOlIwON91DF8blRXBtMg/viewform";

// Map your Google Form entry IDs (from your prefilled link)
const FORM_ENTRY_KEYS = {
  title: "entry.2084242084", // Image Title
  code: "entry.1107417352", // Asset Code (we'll send CODE_V1)
  email: "entry.1200283363", // Email (optional if Form collects email automatically)
  details: "entry.275844938", // Details (optional prefill)
} as const;

// Build the prefilled URL for a given asset
function buildReportFormUrl(asset: Asset, userEmail?: string) {
  const params = new URLSearchParams();
  params.set("usp", "pp_url");

  // Derive CODE_V1 (or use what's on the asset)
  let code = asset.code || "";
  if (!code) {
    const m = asset.title.match(/\[([A-Z0-9]{9})\]/); // e.g. "...[10SCI01PX] V1"
    if (m) code = m[1];
  }
  const version =
    asset.version || (asset.title.match(/\bV(\d+)\b/i)?.[0] ?? "V1");
  const codeWithVersion = code && version ? `${code}_${version}` : code;

  if (FORM_ENTRY_KEYS.title && asset.title)
    params.set(FORM_ENTRY_KEYS.title, asset.title);
  if (FORM_ENTRY_KEYS.code && codeWithVersion)
    params.set(FORM_ENTRY_KEYS.code, codeWithVersion);
  if (FORM_ENTRY_KEYS.email && userEmail)
    params.set(FORM_ENTRY_KEYS.email, userEmail);
  // (Optional) seed details
  // if (FORM_ENTRY_KEYS.details)
  //   params.set(FORM_ENTRY_KEYS.details, `Issue with: ${asset.title}`);

  return `${FORM_BASE}?${params.toString()}`;
}

/* ============================== Asset Card ============================== */
const AssetCard: React.FC<{
  asset: Asset;
  view: "grid" | "list";
  onOpen: (a: Asset) => void;
  onFavClick: (a: Asset) => void;
  onReportClick: (a: Asset) => void; // keep
  onApprovalToggle?: (a: Asset) => void; // NEW
  isFav: boolean;
  viewerRole?: "admin" | "sme" | "user";
}> = ({
  asset,
  view,
  onOpen,
  onFavClick,
  onReportClick,
  onApprovalToggle,
  isFav,
  viewerRole,
}) => {
  const TypeIcon =
    asset.type === "video"
      ? Film
      : asset.type === "document"
      ? FileText
      : asset.type === "vector"
      ? GridIcon
      : ImageIcon;

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={`group rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden ${
        view === "list" ? "flex" : ""
      }`}
    >
      {/* Thumbnail with overlay area */}
      <div
        className={`${
          view === "list" ? "w-48" : "w-full"
        } aspect-[3/2] relative bg-gray-100 overflow-hidden`}
      >
        <button
          onClick={() => onOpen(asset)}
          className="absolute inset-0 w-full h-full"
          aria-label={`Open ${asset.title}`}
        >
          <img
            src={asset.thumb}
            alt={asset.title}
            className="h-full w-full object-cover"
          />
        </button>

        {/* SME approval pill (toggle for SMEs only) */}
        <div className="absolute left-2 top-2 z-10">
          <ApprovalPill
            approval={asset.approval}
            canToggle={viewerRole === "sme"}
            onToggle={() => onApprovalToggle?.(asset)}
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
              {asset.title}
            </h3>
            <StatusBadge status={asset.review?.status} />
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-pressed={isFav}
              onClick={() => onFavClick(asset)}
              className={`px-2 py-1 text-xs rounded-lg border inline-flex items-center gap-1 ${
                isFav ? "bg-pink-50" : ""
              }`}
              title={isFav ? "Remove from Favs" : "Add to Favs"}
            >
              <Heart className={`h-3 w-3 ${isFav ? "fill-current" : ""}`} />{" "}
              {isFav ? "Fav’d" : "Fav"}
            </button>

            {/* Report button on card */}
            <button
              onClick={() => onReportClick(asset)}
              className="px-2 py-1 text-xs rounded-lg border inline-flex items-center gap-1"
              title="Report this asset"
            >
              <Flag className="h-3 w-3" /> Report
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {asset.tags.slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        {/* SME approval messaging */}
        {asset.approval?.status === "yellow" ? (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs px-3 py-2">
            Use this image at your own risk — not approved by SME.
          </div>
        ) : asset.approval?.status === "green" ? (
          <div className="mt-2 text-xs text-green-700">
            Approved by{" "}
            <span className="font-medium">
              {asset.approval.approvedByEmail}
            </span>{" "}
            on{" "}
            {asset.approval.approvedAt
              ? new Date(asset.approval.approvedAt).toLocaleString()
              : ""}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span>By {asset.uploadedBy}</span>
          <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ============================== Filters (visible to everyone) ============================== */
const FiltersPanel: React.FC<{
  activeTab: "images" | "videos" | "templates";
  // hierarchy selections
  grade: string;
  setGrade: (v: string) => void;
  stream: string;
  setStream: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  chapter: string;
  setChapter: (v: string) => void;
  topic: string;
  setTopic: (v: string) => void;
  subtopic: string;
  setSubtopic: (v: string) => void;
  // styles
  artStyle: string;
  setArtStyle: (v: string) => void; // images
  templateStyle: string;
  setTemplateStyle: (v: string) => void; // templates
  // sort
  sortBy: "Newest" | "Oldest" | "Popular";
  setSortBy: (v: "Newest" | "Oldest" | "Popular") => void;
}> = ({
  activeTab,
  grade,
  setGrade,
  stream,
  setStream,
  subject,
  setSubject,
  chapter,
  setChapter,
  topic,
  setTopic,
  subtopic,
  setSubtopic,
  artStyle,
  setArtStyle,
  templateStyle,
  setTemplateStyle,
  sortBy,
  setSortBy,
}) => {
  const needsStream = grade === "11" || grade === "12";
  const subjectKey = needsStream ? `${grade}|${stream}` : grade;
  const subjectOptions = SUBJECTS_BY_GRADE[subjectKey] || [];
  const chapterKey = needsStream
    ? `${grade}|${stream}|${subject}`
    : `${grade}|${subject}`;
  const chapterOptions = CHAPTERS_BY_SUBJECT[chapterKey] || [];
  const topicKey = `${chapterKey}|${chapter}`;
  const topicOptions = TOPICS_BY_CHAPTER[topicKey] || [];
  const subtopicKey = `${topicKey}|${topic}`;
  const subtopicOptions = SUBTOPICS_BY_TOPIC[subtopicKey] || [];

  const onGradeChange = (g: string) => {
    setGrade(g);
    setStream("");
    setSubject("");
    setChapter("");
    setTopic("");
    setSubtopic("");
  };
  const onStreamChange = (s: string) => {
    setStream(s);
    setSubject("");
    setChapter("");
    setTopic("");
    setSubtopic("");
  };
  const onSubjectChange = (s: string) => {
    setSubject(s);
    setChapter("");
    setTopic("");
    setSubtopic("");
  };
  const onChapterChange = (c: string) => {
    setChapter(c);
    setTopic("");
    setSubtopic("");
  };
  const onTopicChange = (t: string) => {
    setTopic(t);
    setSubtopic("");
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
      </div>

      {activeTab === "images" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-700">
              Images Filters
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs mb-1">Grade</label>
                <Select
                  value={grade}
                  onChange={onGradeChange}
                  options={["9", "10", "11", "12"]}
                  placeholder="Select Grade"
                />
              </div>
              {needsStream && (
                <div>
                  <label className="block text-xs mb-1">Stream</label>
                  <Select
                    value={stream}
                    onChange={onStreamChange}
                    options={[...STREAMS]}
                    placeholder="Select Stream"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs mb-1">Subject</label>
                <Select
                  value={subject}
                  onChange={onSubjectChange}
                  options={subjectOptions}
                  placeholder="Select Subject"
                  disabled={needsStream ? !stream : !grade}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Chapter</label>
                <Select
                  value={chapter}
                  onChange={onChapterChange}
                  options={chapterOptions}
                  placeholder="Select Chapter"
                  disabled={!subject}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Topic</label>
                <Select
                  value={topic}
                  onChange={onTopicChange}
                  options={topicOptions}
                  placeholder="Select Topic"
                  disabled={!chapter}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Sub-topic</label>
                <Select
                  value={subtopic}
                  onChange={setSubtopic}
                  options={subtopicOptions}
                  placeholder="Select Sub-topic"
                  disabled={!topic}
                />
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Art Style</p>
            <Select
              value={artStyle}
              onChange={setArtStyle}
              options={[...ART_STYLES]}
              placeholder="Select Style"
            />
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-700">
              Template Filters
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs mb-1">Grade</label>
                <Select
                  value={grade}
                  onChange={onGradeChange}
                  options={["9", "10", "11", "12"]}
                  placeholder="Select Grade"
                />
              </div>
              {(grade === "11" || grade === "12") && (
                <div>
                  <label className="block text-xs mb-1">Stream</label>
                  <Select
                    value={stream}
                    onChange={onStreamChange}
                    options={[...STREAMS]}
                    placeholder="Select Stream"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs mb-1">Subject</label>
                <Select
                  value={subject}
                  onChange={onSubjectChange}
                  options={subjectOptions}
                  placeholder="Select Subject"
                  disabled={needsStream ? !stream : !grade}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Chapter</label>
                <Select
                  value={chapter}
                  onChange={onChapterChange}
                  options={chapterOptions}
                  placeholder="Select Chapter"
                  disabled={!subject}
                />
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Style</p>
            <Select
              value={templateStyle}
              onChange={setTemplateStyle}
              options={["Gradient-based", "2D"]}
              placeholder="Select Style"
            />
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border bg-white p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Sort</p>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border bg-white w-full"
            aria-label="Sort by"
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Popular</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

/* ============================== Modals ============================== */
const SignInModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSignedIn: (u: User) => void;
  defaultEmail?: string;
}> = ({ open, onClose, onSignedIn }) => {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Sign in</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-600 mb-2">
              Sign in with your <strong>@pw.live</strong> account
            </p>
            <GoogleSignIn
              onAuthed={(u) => {
                onSignedIn(u);
                onClose();
              }}
            />
          </div>

          <p className="mt-3 text-[11px] text-gray-500">
            Access is restricted to the pw.live domain. Admins can upload
            assets.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

/* ===== Delete Chooser (replaces window.prompt) ===== */
const DeleteChooserModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onTemp: () => void;
  onPerm: () => void;
}> = ({ open, onClose, onTemp, onPerm }) => {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label="Delete options"
    >
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete asset
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Choose how you want to delete this asset.
          </p>
          <div className="mt-4 grid gap-2">
            <button
              className="px-4 py-2 rounded-xl border text-sm text-left hover:bg-gray-50"
              onClick={onTemp}
            >
              <div className="font-medium">Delete temporarily</div>
              <div className="text-xs text-gray-600">
                Removes from the portal only
              </div>
            </button>
            <button
              className="px-4 py-2 rounded-xl border text-sm text-left hover:bg-gray-50"
              onClick={onPerm}
            >
              <div className="font-medium text-red-600">Delete permanently</div>
              <div className="text-xs text-gray-600">
                Removes from the portal and triggers the Drive delete stub
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ============================== Upload Modal (images only) ============================== */
const UploadModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (asset: Asset) => void;
  currentUser: User;
}> = ({ open, onClose, onConfirm, currentUser }) => {
  const [fileName, setFileName] = useState<string>("");
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [baseTitle, setBaseTitle] = useState<string>("");

  // taxonomy for Images
  const [grade, setGrade] = useState("");
  const [stream, setStream] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [subTopic, setSubTopic] = useState("");
  const [artStyle, setArtStyle] = useState("");
  const [chapterNo, setChapterNo] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const needsStream = grade === "11" || grade === "12";
  const subjectOptions =
    SUBJECTS_BY_GRADE[needsStream ? `${grade}|${stream}` : grade] || [];
  const chapterOptions =
    CHAPTERS_BY_SUBJECT[
      needsStream ? `${grade}|${stream}|${subject}` : `${grade}|${subject}`
    ] || [];
  const topicOptions =
    TOPICS_BY_CHAPTER[
      (needsStream ? `${grade}|${stream}|${subject}` : `${grade}|${subject}`) +
        `|${chapter}`
    ] || [];

  // NEW: derive subtopic options from the selected topic
  const subtopicKey =
    (needsStream ? `${grade}|${stream}|${subject}` : `${grade}|${subject}`) +
    `|${chapter}|${topic}`;
  const subtopicOptions = SUBTOPICS_BY_TOPIC[subtopicKey] || [];

  // derived
  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsInput]
  );

  // touched for inline errors
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (k: string) => setTouched((p) => ({ ...p, [k]: true }));

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setFileName("");
      setFileObj(null);
      setBaseTitle("");
      setGrade("");
      setStream("");
      setSubject("");
      setChapter("");
      setTopic("");
      setArtStyle("");
      setChapterNo("");
      setTagsInput("");
      setTouched({});
    }
  }, [open]);

  if (!open) return null;

  // images only
  const accept = "image/*";
  const validateFile = (file: File) => file.type.startsWith("image/");

  // validation
  const req = {
    file: !!fileObj,
    title: !!baseTitle.trim(),
    grade: !!grade,
    subject: !!subject,
    chapter: !!chapter,
    topic: !!topic,
    subtopic: !!subTopic, // NEW  ⟵ required by backend
    artStyle: !!artStyle,
    tags: tags.length >= 1 && tags.length <= 10,
  };
  const allValid = Object.values(req).every(Boolean);

  // const handleConfirm = () => {
  //   if (!allValid || !fileObj) return;
  const handleConfirm = async () => {
    if (!allValid || !fileObj) return;

    // Build the 'meta' payload the server expects
    const meta = {
      title: (baseTitle || "").trim() || topic || subTopic || "Untitled",
      grade,
      stream,
      subject,
      chapter,
      topic,
      subtopic: subTopic,
      artStyle,
      tags,
      // (optional) version/code if you already compute them on FE
    };

    const fd = new FormData();
    fd.append("file", fileObj);
    fd.append("meta", JSON.stringify(meta));

    try {
      const { data } = await api.post("/assets", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Let parent know
      onConfirm?.(data.item);
      onClose();
    } catch (e: any) {
      alert(e?.response?.data?.error || "Upload failed");
    }
    // const url = URL.createObjectURL(fileObj);
    // const code = buildCode(grade, subject, chapterNo || "01", artStyle);
    // const finalTitle = `${baseTitle}[${code}] V1`;
    // const folderPath = [grade, subject, chapter, topic]
    //   .filter(Boolean)
    //   .join("-");

    // const asset: Asset = {
    //   id: `asset_${Date.now()}`,
    //   title: finalTitle,
    //   type: "photo",
    //   thumb: url,
    //   tags,
    //   uploadedBy: currentUser.email,
    //   uploaderRole: currentUser.role,
    //   createdAt: new Date().toISOString(),
    //   downloads: 0,
    //   views: 0,
    //   dominantColor: "gray", // or pick from a small palette based on subject/style
    //   width: 0,
    //   height: 0,
    //   grade,
    //   stream,
    //   subject,
    //   chapter,
    //   topic,
    //   artStyle,
    //   version: "V1",
    //   code,
    //   folderPath,
    //   approval: { status: "yellow" }, // ← default for new uploads
    // };

    // onConfirm(asset);
    // onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label="Upload image"
    >
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Upload image
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="mt-4 space-y-3 pr-1">
            <label
              className="block text-sm text-gray-700"
              htmlFor="upload-file"
            >
              {" "}
              Choose a file
            </label>
            <input
              id="upload-file"
              type="file"
              accept={accept}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) {
                  setFileName("");
                  setFileObj(null);
                  return;
                }
                if (!validateFile(f)) {
                  alert("Please select an image file.");
                  e.currentTarget.value = "";
                  setFileName("");
                  setFileObj(null);
                  return;
                }
                setFileName(f.name);
                setFileObj(f);
              }}
              className="block w-full text-sm"
              onBlur={() => markTouched("file")}
            />
            <FieldError
              show={touched.file && !req.file}
              msg="Please select an image"
            />

            <div>
              <label className="block text-xs mb-1">Title</label>
              <input
                value={baseTitle}
                onChange={(e) => setBaseTitle(e.target.value)}
                onBlur={() => markTouched("title")}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Short descriptive title"
              />
              <FieldError show={touched.title && !req.title} />
            </div>

            <div>
              <label className="block text-xs mb-1">Grade</label>
              <Select
                value={grade}
                onChange={(v) => {
                  setGrade(v);
                  setStream("");
                  setSubject("");
                  setChapter("");
                  setTopic("");
                }}
                options={["9", "10", "11", "12"]}
                placeholder="Select Grade"
              />
              <FieldError show={touched.grade && !req.grade} />
            </div>
            {needsStream && (
              <div>
                <label className="block text-xs mb-1">Stream</label>
                <Select
                  value={stream}
                  onChange={(v) => {
                    setStream(v);
                    setSubject("");
                    setChapter("");
                    setTopic("");
                  }}
                  options={[...STREAMS]}
                  placeholder="Select Stream"
                />
              </div>
            )}
            <div>
              <label className="block text-xs mb-1">Subject</label>
              <Select
                value={subject}
                onChange={(v) => {
                  setSubject(v);
                  setChapter("");
                  setTopic("");
                }}
                options={subjectOptions}
                placeholder="Select Subject"
                disabled={needsStream ? !stream : !grade}
              />
              <FieldError show={touched.subject && !req.subject} />
            </div>
            <div>
              <label className="block text-xs mb-1">Chapter</label>
              <Select
                value={chapter}
                onChange={(v) => {
                  setChapter(v);
                  setTopic("");
                }}
                options={chapterOptions}
                placeholder="Select Chapter"
                disabled={!subject}
              />
              <FieldError show={touched.chapter && !req.chapter} />
            </div>
            <div>
              <label className="block text-xs mb-1">Topic</label>
              <Select
                value={topic}
                onChange={setTopic}
                options={topicOptions}
                placeholder="Select Topic"
                disabled={!chapter}
              />
              <FieldError show={touched.topic && !req.topic} />
            </div>
            <div>
              <label className="block text-xs mb-1">Sub-topic</label>
              {subtopicOptions.length > 0 ? (
                <Select
                  value={subTopic}
                  onChange={setSubTopic}
                  options={subtopicOptions}
                  placeholder="Select Sub-topic"
                  disabled={!topic}
                />
              ) : (
                <input
                  value={subTopic}
                  onChange={(e) => setSubTopic(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Type sub-topic"
                  disabled={!topic}
                  onBlur={() => markTouched("subtopic")}
                />
              )}
            </div>
            <div>
              <label className="block text-xs mb-1">Art Style</label>
              <Select
                value={artStyle}
                onChange={setArtStyle}
                options={[...ART_STYLES]}
                placeholder="Select Style"
              />
              <FieldError show={touched.artStyle && !req.artStyle} />
            </div>
            <div>
              <label className="block text-xs mb-1">
                Tags (comma-separated, 1–10)
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onBlur={() => markTouched("tags")}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="e.g., electricity, circuit, physics"
              />
              <p
                className={`mt-1 text-[11px] ${
                  !req.tags ? "text-red-600" : "text-gray-500"
                }`}
              >
                Current: {tags.length}. Min 1, max 10.
              </p>
            </div>

            {fileName && (
              <div className="rounded-xl border p-3 text-sm text-gray-700">
                <span className="font-medium">Selected:</span> {fileName}
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-xl border"
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 text-sm rounded-xl bg-black text-white disabled:opacity-50"
              disabled={!allValid}
              onClick={handleConfirm}
            >
              Confirm upload
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ============================== Detail Drawer ============================== */
const DetailDrawer: React.FC<{
  asset: Asset;
  onClose: () => void;
  onFavProtected: (a: Asset) => void;
  onReportProtected: (a: Asset) => void;
  onDownloadProtected: (a: Asset) => void;
  onDeleteTemp: (a: Asset) => void;
  onDeletePerm: (a: Asset) => void;
  onApprovalToggle: (a: Asset) => void;
  // ← NEW

  isFav: boolean;
  canDelete?: boolean;
  canApprove?: boolean; // ← NEW (role === "sme")
}> = ({
  asset,
  onClose,
  onFavProtected,
  onReportProtected,
  onDownloadProtected,
  onDeleteTemp,
  onDeletePerm,
  onApprovalToggle,
  isFav,
  canDelete,
  canApprove,
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!asset) return null;
  const uploadedDate = new Date(asset.createdAt).toLocaleDateString();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${asset.title}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {asset.title}
            </h3>
            <ApprovalPill
              approval={asset.approval}
              canToggle={!!canApprove}
              onToggle={() => onApprovalToggle(asset)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReportProtected(asset)}
              className="p-2 rounded-full border"
              aria-label="Report"
            >
              <Flag className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl overflow-hidden border bg-gray-100 aspect-[3/2]">
          <img
            src={asset.thumb}
            alt={asset.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <p>
              Uploaded by{" "}
              <span className="font-medium">{asset.uploadedBy}</span>
            </p>
            <p className="text-gray-500">{uploadedDate}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>{asset.type}</Badge>
            {asset.tags.slice(0, 5).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
            <StatusBadge status={asset.review?.status} />
          </div>
          {canDelete && asset.review?.status && (
            <p className="mt-1 text-[11px] text-gray-600">
              {(asset.review.status === "passed" && "Passed") ||
                (asset.review.status === "commented" && "Commented") ||
                (asset.review.status === "allotted" && "Allotted")}
              {asset.review.reviewedByName || asset.review.reviewedBy
                ? ` by ${
                    asset.review.reviewedByName || asset.review.reviewedBy
                  }`
                : ""}
              {asset.review.reviewedAt
                ? ` on ${new Date(
                    asset.review.reviewedAt
                  ).toLocaleDateString()}`
                : ""}
              {asset.review.status === "commented" && asset.review.comment
                ? ` — “${asset.review.comment}”`
                : ""}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => onDownloadProtected(asset)}
            className="px-4 py-2 rounded-xl bg-black text-white text-sm inline-flex items-center gap-2"
          >
            <ChevronRight className="h-4 w-4" /> Download
          </button>
          <button
            onClick={() => onFavProtected(asset)}
            className="px-4 py-2 rounded-xl border text-sm inline-flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />{" "}
            {isFav ? "Unfav" : "Fav"}
          </button>
          {canDelete && (
            <button
              onClick={() => setDeleteOpen(true)}
              className="px-4 py-2 rounded-xl border text-sm inline-flex items-center gap-2 text-red-600"
            >
              <X className="h-4 w-4" /> Delete
            </button>
          )}
        </div>

        {/* Delete Chooser */}
        <DeleteChooserModal
          open={!!deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onTemp={() => {
            setDeleteOpen(false);
            onDeleteTemp(asset);
          }}
          onPerm={() => {
            setDeleteOpen(false);
            onDeletePerm(asset);
          }}
        />
      </motion.div>
    </div>
  );
};

/* ============================== Main App ============================== */
const CreativeHubDemo: React.FC = () => {
  // Search / view
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInPrefill, setSignInPrefill] = useState<string | undefined>(
    undefined
  );

  // Tabs
  type Tab = "images" | "videos" | "templates";
  const [activeTab, setActiveTab] = useState<Tab>("images");

  // Sorting
  type SortBy = "Newest" | "Oldest" | "Popular";
  const [sortBy, setSortBy] = useState<SortBy>("Newest");

  // Filters state (visible to everyone)
  const [grade, setGrade] = useState("");
  const [stream, setStream] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [artStyle, setArtStyle] = useState("");
  const [templateStyle, setTemplateStyle] = useState("");

  // Assets start empty (no mocks)
  // Assets
  // const [assets, setAssets] = useState<Asset[]>(
  //   [...MOCK_ASSETS].map((a) => ({
  //     ...a,
  //     approval: a.approval ?? { status: "yellow" },
  //   }))
  // );
  const [assets, setAssets] = useState<Asset[]>([]);

  const [selected, setSelected] = useState<Asset | null>(null);

  // Upload/report
  const [uploadOpen, setUploadOpen] = useState(false);

  // Favorites
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  // on mount, fetch session
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res: AxiosResponse<{ user: User | null }>) =>
        setUser(res.data.user)
      )
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    api
      .get("/assets")
      .then((res: AxiosResponse<{ items: Asset[] }>) => {
        setAssets(res.data.items);
      })
      .catch((err) => {
        console.error("GET /assets failed", err);
      });
  }, []);

  // logout handler
  const handleSignOut = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setProfileOpen(false);
  };
  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  // Profile popover outside click
  const profileRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Role helpers
  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  // Protected action wrapper: if not logged in, open Sign In modal first
  const ensureAuthed = (next: () => void, emailHint?: string) => {
    if (!isLoggedIn) {
      if (emailHint) setSignInPrefill(emailHint);
      setSignInOpen(true);
      return;
    }
    next();
  };

  // Upload gate (admins only)
  const openUpload = () => {
    if (!isLoggedIn) {
      setSignInPrefill(undefined);
      setSignInOpen(true);
      return;
    }
    if (!isAdmin) {
      alert("Only admins can upload assets.");
      return;
    }
    setUploadOpen(true);
  };

  // Filter and sort
  const tabTypeMap: Record<Tab, Asset["type"][]> = {
    images: ["photo"],
    videos: ["video"],
    templates: ["document", "vector"],
  };

  const filtered = useMemo(() => {
    let list = assets
      .filter((a) => tabTypeMap[activeTab].includes(a.type))
      .filter((a) => {
        const ql = debouncedQ;
        if (!ql) return true;
        return (
          a.title.toLowerCase().includes(ql) ||
          a.tags.some((t) => t.toLowerCase().includes(ql)) ||
          a.uploadedBy.toLowerCase().includes(ql)
        );
      });

    if (user?.role === "sme") {
      // treat undefined as "admin" so legacy/mocked assets still show
      list = list.filter((a) => (a.uploaderRole ?? "admin") === "admin");
    }

    // Apply taxonomy filters (only when values are selected)
    if (activeTab === "images") {
      if (grade) list = list.filter((a) => a.grade === grade);
      if (stream) list = list.filter((a) => a.stream === stream);
      if (subject) list = list.filter((a) => a.subject === subject);
      if (chapter) list = list.filter((a) => a.chapter === chapter);
      if (topic) list = list.filter((a) => a.topic === topic);
      if (subtopic) list = list.filter((a) => a.subtopic === subtopic);
      if (artStyle) list = list.filter((a) => a.artStyle === artStyle);
    }

    if (sortBy === "Newest")
      list = list.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      );
    if (sortBy === "Oldest")
      list = list.sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
      );
    if (sortBy === "Popular")
      list = list.sort((a, b) => b.downloads - a.downloads);
    return list;
  }, [
    assets,
    debouncedQ,
    activeTab,
    sortBy,
    grade,
    stream,
    subject,
    chapter,
    topic,
    subtopic,
    artStyle,
    user?.role,
  ]);

  // Protected handlers
  const onFavProtected = (a: Asset) =>
    ensureAuthed(() => {
      setFavIds((prev) => {
        const next = new Set(prev);
        next.has(a.id) ? next.delete(a.id) : next.add(a.id);
        return next;
      });
    });

  const onToggleApprovalProtected = (a: Asset) =>
    ensureAuthed(async () => {
      if (user?.role !== "sme") {
        alert("Only SMEs can change approval.");
        return;
      }

      const nextStatus: "yellow" | "green" =
        a.approval?.status === "green" ? "yellow" : "green";

      const optimistic: Asset = {
        ...a,
        approval:
          nextStatus === "green"
            ? {
                status: "green",
                approvedByEmail: user.email,
                approvedAt: new Date().toISOString(),
              }
            : { status: "yellow" },
      };

      // optimistic update
      setAssets((prev) => prev.map((x) => (x.id === a.id ? optimistic : x)));
      setSelected((prev) => (prev?.id === a.id ? optimistic : prev));

      try {
        await api.patch(`/assets/${a.id}/approval`, { status: nextStatus });
      } catch (err: any) {
        // If server says forbidden, roll back; otherwise keep optimistic (dev-friendly)
        const status = err?.response?.status;
        if (status === 403) {
          setAssets((prev) => prev.map((x) => (x.id === a.id ? a : x)));
          setSelected((prev) => (prev?.id === a.id ? a : prev));
          alert("Only SMEs can change approval.");
        } else {
          console.warn(
            "PATCH /assets/:id/approval failed, keeping optimistic UI.",
            err
          );
          // If you prefer strict rollback instead, uncomment next line and remove the alert above:
          // setAssets(prev => prev.map(x => (x.id === a.id ? a : x)));
          // alert("Failed to update approval. Please try again.");
        }
      }
    });

  const onReportProtected = (a: Asset) =>
    ensureAuthed(() => {
      const url = buildReportFormUrl(a, user?.email || undefined);
      window.open(url, "_blank", "noopener,noreferrer");
    });

  // const onDownloadProtected = (a: Asset) =>
  //   ensureAuthed(() => {
  //     setAssets((prev) =>
  //       prev.map((x) =>
  //         x.id === a.id ? { ...x, downloads: x.downloads + 1 } : x
  //       )
  //     );
  //     const link = document.createElement("a");
  //     link.href = a.thumb;
  //     link.download = `${a.title || "asset"}`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   });

  const onDownloadProtected = (a: Asset) =>
    ensureAuthed(() => {
      // optimistic counter
      setAssets((prev) =>
        prev.map((x) =>
          x.id === a.id ? { ...x, downloads: x.downloads + 1 } : x
        )
      );

      // open the server streaming route in a new tab (cookies included)
      const base = (api.defaults.baseURL || "").replace(/\/$/, ""); // same base as axios
      window.open(
        `${base}/assets/${a.id}/file`,
        "_blank",
        "noopener,noreferrer"
      );
    });

  const onDeleteTemp = (a: Asset) =>
    ensureAuthed(() => {
      if (!isAdmin) {
        alert("Only admins can delete assets.");
        return;
      }
      setAssets((prev) => prev.filter((x) => x.id !== a.id));
      alert("Deleted from portal only (temporary).");
    });

  const onDeletePerm = (a: Asset) =>
    ensureAuthed(() => {
      if (!isAdmin) {
        alert("Only admins can delete assets.");
        return;
      }
      console.log(
        "[Drive] Would delete from:",
        a.folderPath,
        "with code:",
        a.code
      );
      setAssets((prev) => prev.filter((x) => x.id !== a.id));
      alert("Deleted permanently (portal + Drive stub).");
    });
  // login handler
  const handleSignedIn = (u: User) => setUser(u);

  return (
    <div>
      <div className="min-h-screen w-full overflow-x-clip bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
          <div className="w-full px-6 py-3 flex items-center">
            {/* Left: Logo + Tabs */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <PhysicsWallahLogo />
              </div>
              <nav
                className="hidden md:flex items-center gap-1 rounded-xl border bg-white p-1"
                aria-label="Primary"
              >
                {(
                  [
                    { key: "images", label: "Images" },
                    { key: "videos", label: "Videos" },
                    { key: "templates", label: "Templates" },
                  ] as {
                    key: "images" | "videos" | "templates";
                    label: string;
                  }[]
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition ${
                      activeTab === t.key
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-current={activeTab === t.key ? "page" : undefined}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>
            {/* Center: Search */}
            <div className="flex flex-1 justify-center">
              <div className="w-full max-w-2xl flex items-center gap-2 rounded-2xl border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search assets, tags, contributors…"
                  className="w-full outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400"
                  aria-label="Search assets"
                />
              </div>
            </div>

            {/* Right: Upload (admins only) + Auth */}
            <div
              className="relative flex items-center gap-2 ml-auto"
              ref={profileRef}
            >
              {isAdmin && (
                <button
                  onClick={openUpload}
                  className="inline-flex items-center gap-2 rounded-xl bg-black text-white text-sm px-3 py-2"
                >
                  <Upload className="h-4 w-4" /> Upload
                </button>
              )}
              {!isLoggedIn ? (
                <button
                  className="inline-flex items-center gap-2 rounded-xl border text-sm px-3 py-2"
                  onClick={() => {
                    setSignInPrefill(undefined);
                    setSignInOpen(true);
                  }}
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </button>
              ) : (
                <>
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border text-sm px-3 py-2"
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                  >
                    {user?.name} ({user?.role})
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-10 w-56 rounded-xl border bg-white shadow">
                      <div className="px-3 py-2 text-xs text-gray-500 border-b">
                        {user?.email}
                      </div>
                      <button
                        className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="w-full px-6 py-6 grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3 lg:col-span-3 space-y-4">
            <FiltersPanel
              activeTab={activeTab}
              grade={grade}
              setGrade={setGrade}
              stream={stream}
              setStream={setStream}
              subject={subject}
              setSubject={setSubject}
              chapter={chapter}
              setChapter={setChapter}
              topic={topic}
              setTopic={setTopic}
              subtopic={subtopic}
              setSubtopic={setSubtopic}
              artStyle={artStyle}
              setArtStyle={setArtStyle}
              templateStyle={templateStyle}
              setTemplateStyle={setTemplateStyle}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <div className="rounded-2xl border bg-white p-4">
              <p className="text-xs text-gray-500">
                {isLoggedIn
                  ? isAdmin
                    ? "You are an Admin. You can upload and delete assets."
                    : "You are signed in. You can view, like, report, and download."
                  : "Sign in with your @pw.live email to like, report, download. Only Admins can upload/delete."}
              </p>
            </div>
          </aside>

          <section className="col-span-12 md:col-span-9 lg:col-span-9">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600" aria-live="polite">
                Showing <span className="font-medium">{filtered.length}</span>{" "}
                result{filtered.length !== 1 ? "s" : ""}
              </p>
              <div
                className="flex items-center gap-1 rounded-xl border bg-white p-1"
                role="tablist"
                aria-label="View mode"
              >
                <button
                  onClick={() => setView("grid")}
                  className={`px-3 py-1.5 text-xs rounded-lg ${
                    view === "grid" ? "bg-black text-white" : "text-gray-700"
                  }`}
                  aria-selected={view === "grid"}
                >
                  Grid
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`px-3 py-1.5 text-xs rounded-lg ${
                    view === "list" ? "bg-black text-white" : "text-gray-700"
                  }`}
                  aria-selected={view === "list"}
                >
                  List
                </button>
              </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-600">
                {assets.length === 0 ? (
                  <>
                    <p>No assets yet.</p>
                    {isAdmin ? (
                      <p className="mt-1">
                        Use the Upload button to add your first asset.
                      </p>
                    ) : (
                      <p className="mt-1">Ask an Admin to upload assets.</p>
                    )}
                  </>
                ) : (
                  <p>No results match your filters.</p>
                )}
              </div>
            )}

            {/* List */}
            {filtered.length > 0 && (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-3"
                }
              >
                {filtered.map((a) => (
                  <AssetCard
                    key={a.id}
                    asset={a}
                    view={view}
                    onOpen={setSelected}
                    onFavClick={onFavProtected}
                    onReportClick={onReportProtected}
                    onApprovalToggle={onToggleApprovalProtected}
                    isFav={favIds.has(a.id)}
                    viewerRole={user?.role}
                  />
                ))}
              </div>
            )}

            {/* Guide */}
            <div className="mt-8">
              <div className="rounded-2xl border bg-white p-4 text-sm text-gray-700">
                <h3 className="font-semibold mb-2">How to use this portal</h3>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Search or browse assets.</li>
                  <li>Apply filters and choose a sort option.</li>
                  <li>Click an asset to view details.</li>
                  <li>Download or mark as Fav.</li>
                  <li>Upload via drag-and-drop or the Upload button.</li>
                </ol>
                <div className="mt-3 border-t pt-3 text-xs text-gray-600">
                  <p>
                    <strong>Permissions:</strong> • Guests: view & search • PW
                    users: view/like/report/download • Admins: +upload/delete
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <DetailDrawer
              asset={selected}
              onClose={() => setSelected(null)}
              onFavProtected={onFavProtected}
              onReportProtected={onReportProtected}
              onDownloadProtected={onDownloadProtected}
              onDeleteTemp={onDeleteTemp}
              onDeletePerm={onDeletePerm}
              isFav={favIds.has(selected.id)}
              canDelete={isAdmin}
              canApprove={user?.role === "sme"}
              onApprovalToggle={onToggleApprovalProtected}
            />
          )}
        </AnimatePresence>

        {/* Modals */}
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          currentUser={user as User}
          onConfirm={(created) => setAssets((prev) => [created, ...prev])}
        />

        <SignInModal
          open={signInOpen}
          onClose={() => setSignInOpen(false)}
          onSignedIn={(u) => {
            handleSignedIn(u);
          }}
          defaultEmail={signInPrefill}
        />

        {/* Footer */}
        <footer className="border-t py-6 text-center text-xs text-gray-500">
          {"\u00A9 "}
          {new Date().getFullYear()} PW Creative Hub · Internal
        </footer>
      </div>
    </div>
  );
};

export default CreativeHubDemo;
