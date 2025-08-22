import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  Filter,
  ChevronRight,
  X,
  Grid as GridIcon,
  Image as ImageIcon,
  Film,
  FileText,
  ChevronDown,
  LogIn,
  Flag,
  Heart,
} from "lucide-react";

// --- import local assets so Vite resolves them correctly ---
import BambooImg from "./assets/Bamboo.png";
import CartilageImg from "./assets/cartilage.png";
import CiliatedImg from "./assets/ciliated_epithelium.png";

/* =====================================================
   Types
   ===================================================== */
export type Asset = {
  id: string;
  title: string;
  type: "photo" | "video" | "document" | "vector";
  thumb: string;
  dominantColor: string;
  width: number;
  height: number;
  tags: string[];
  uploadedBy: string;
  createdAt: string; // ISO
  downloads: number;
  views: number;
  grade?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
};

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
    tags: ["grade9", "science", "tissues", "plant", "bamboo"],
    uploadedBy: "Teacher",
    createdAt: CURR_DATE,
    downloads: 120,
    views: 980,
    grade: "9",
    subject: "Science",
    chapter: "Tissues",
    topic: "Bamboo",
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
    topic: "cartilage",
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
    uploadedBy: "Teacher",
    createdAt: CURR_DATE,
    downloads: 97,
    views: 760,
    grade: "9",
    subject: "Science",
    chapter: "Tissues",
    topic: "ciliated_epithelium",
  },
];

/* =====================================================
   Small UI helpers
   ===================================================== */
const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block rounded-full border px-2 py-0.5 text-xs text-gray-600 bg-white/60 backdrop-blur">
    {children}
  </span>
);

// Simple select component
const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}> = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border bg-white"
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

/* =====================================================
   Asset Card
   ===================================================== */
const AssetCard: React.FC<{
  asset: Asset;
  view: "grid" | "list";
  onOpen: (a: Asset) => void;
  onFav: (a: Asset) => void;
}> = ({ asset, view, onOpen, onFav }) => {
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
      <button
        onClick={() => onOpen(asset)}
        className={`${
          view === "list" ? "w-48" : "w-full"
        } aspect-[3/2] overflow-hidden bg-gray-100`}
        aria-label={`Open ${asset.title}`}
      >
        <img
          src={asset.thumb}
          alt={asset.title}
          className="h-full w-full object-cover"
        />
      </button>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
              {asset.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFav(asset)}
              className="px-2 py-1 text-xs rounded-lg border inline-flex items-center gap-1"
            >
              <Heart className="h-3 w-3" /> Fav
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {asset.tags.slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span>By {asset.uploadedBy}</span>
          <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* =====================================================
   Filters Sidebar
   ===================================================== */
const FiltersPanel: React.FC<{
  activeTab: "images" | "videos" | "templates";
  grade: string;
  setGrade: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  chapter: string;
  setChapter: (v: string) => void;
  topic: string;
  setTopic: (v: string) => void;
  artStyle: string;
  setArtStyle: (v: string) => void;
}> = ({
  activeTab,
  grade,
  setGrade,
  subject,
  setSubject,
  chapter,
  setChapter,
  topic,
  setTopic,
  artStyle,
  setArtStyle,
}) => {
  const chaptersBySelection: Record<string, string[]> = {
    "9|Science": ["Tissues"],
  };
  const chapterKey = `${grade}|${subject}`;
  const chapterOptions = chaptersBySelection[chapterKey] || [];

  const allTopics = Array.from(
    new Set(
      MOCK_ASSETS.filter((a) => {
        return (
          (!grade || a.grade === grade) &&
          (!subject || a.subject === subject) &&
          (!chapter || a.chapter === chapter)
        );
      })
        .map((a) => a.topic)
        .filter(Boolean) as string[]
    )
  );
  const topicOptions = ["All", ...allTopics];

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
        <Filter className="h-4 w-4 text-gray-500" />
      </div>
      <div className="mt-4 space-y-4">
        {activeTab === "images" && (
          <div className="rounded-xl border p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-700">
              Images Filters
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs mb-1">Grade</label>
                <Select
                  value={grade}
                  onChange={setGrade}
                  options={["9", "10", "11", "12"]}
                  placeholder="Select Grade"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Subject</label>
                <Select
                  value={subject}
                  onChange={setSubject}
                  options={["Science"]}
                  placeholder="Select Subject"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Chapter</label>
                <Select
                  value={chapter}
                  onChange={setChapter}
                  options={chapterOptions}
                  placeholder="Select Chapter"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Topic</label>
                <Select
                  value={topic}
                  onChange={setTopic}
                  options={topicOptions}
                  placeholder="Select Topic"
                />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-700">Art Style</p>
          <Select
            value={artStyle}
            onChange={setArtStyle}
            options={
              ["", "Pixar", "Vector", "Semi Realistic", "Realistic"].filter(
                Boolean
              ) as string[]
            }
            placeholder="Select Style"
          />
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   Report Modal
   ===================================================== */
const ReportModal: React.FC<{
  open: boolean;
  asset?: Asset | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    contact: string;
    comment: string;
    assetId?: string;
  }) => void;
}> = ({ open, asset, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");

  if (!open) return null;
  const handleSubmit = () => {
    if (!name || !contact || !comment) {
      alert("All fields are required");
      return;
    }
    onSubmit({ name, contact, comment, assetId: asset ? asset.id : undefined });
    onClose();
    setName("");
    setContact("");
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Report asset
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Contact</label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Email or phone"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              rows={4}
              placeholder="Describe the issue"
            />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-xl border"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-2 text-sm rounded-xl bg-black text-white"
          >
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* =====================================================
   Upload Modal
   ===================================================== */
const UploadModal: React.FC<{
  open: boolean;
  onClose: () => void;
  activeTab: "images" | "videos" | "templates";
}> = ({ open, onClose, activeTab }) => {
  const [fileName, setFileName] = useState<string>("");

  if (!open) return null;

  const acceptByTab =
    activeTab === "images"
      ? "image/*"
      : activeTab === "videos"
      ? "video/*"
      : ".pdf,.ai,.psd,.svg,.doc,.docx,.ppt,.pptx,.xd,.fig,.eps";

  const validateByTab = (file: File) => {
    if (activeTab === "images" && !file.type.startsWith("image/")) return false;
    if (activeTab === "videos" && !file.type.startsWith("video/")) return false;
    if (
      activeTab === "templates" &&
      (file.type.startsWith("image/") || file.type.startsWith("video/"))
    )
      return false;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Upload{" "}
            {activeTab === "images"
              ? "image"
              : activeTab === "videos"
              ? "video"
              : "template"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-sm text-gray-700">Choose a file</label>
          <input
            type="file"
            accept={acceptByTab}
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              const f = target && target.files && target.files[0];
              if (!f) {
                setFileName("");
                return;
              }
              if (!validateByTab(f)) {
                alert("Selected file type is not allowed for this tab.");
                (e.currentTarget as HTMLInputElement).value = "";
                setFileName("");
                return;
              }
              setFileName(f.name);
            }}
            className="block w-full text-sm"
          />
          {fileName && (
            <div className="rounded-xl border p-3 text-sm text-gray-700">
              <span className="font-medium">Preview name:</span> {fileName}
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
            className="px-3 py-2 text-sm rounded-xl bg-black text-white"
            disabled={!fileName}
          >
            Confirm upload
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* =====================================================
   Detail Drawer
   ===================================================== */
const DetailDrawer: React.FC<{
  asset: Asset;
  onClose: () => void;
  onFav: (a: Asset) => void;
  onReport: (a: Asset) => void;
}> = ({ asset, onClose, onFav, onReport }) => {
  if (!asset) return null;
  const uploadedDate = new Date(asset.createdAt).toLocaleDateString();

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl p-6 overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{asset.title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReport(asset)}
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
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-black text-white text-sm inline-flex items-center gap-2">
            <ChevronRight className="h-4 w-4" /> Download
          </button>
          <button
            onClick={() => onFav(asset)}
            className="px-4 py-2 rounded-xl border text-sm inline-flex items-center gap-2"
          >
            <Heart className="h-4 w-4" /> Fav
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* =====================================================
   Guide
   ===================================================== */
const Guide: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">
          How to use this portal
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 text-sm text-gray-700"
          >
            <ol className="list-decimal ml-5 space-y-1">
              <li>Search or browse assets.</li>
              <li>Apply filters and choose a sort option.</li>
              <li>Click an asset to view details.</li>
              <li>Download or mark as Fav.</li>
              <li>Upload via drag-and-drop or the Upload button.</li>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =====================================================
   Main App
   ===================================================== */
const App: React.FC = () => {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Asset | null>(null);

  // upload/report modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportAsset, setReportAsset] = useState<Asset | null>(null);

  // fav state
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  // Tabs
  type Tab = "images" | "videos" | "templates";
  const [activeTab, setActiveTab] = useState<Tab>("images");

  // Auth (mock)
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Sorting
  type SortBy = "Newest" | "Oldest" | "Popular";
  const [sortBy, setSortBy] = useState<SortBy>("Newest");

  // Images advanced filters
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [artStyle, setArtStyle] = useState("");

  const tabTypeMap: Record<Tab, Asset["type"][]> = {
    images: ["photo"],
    videos: ["video"],
    templates: ["document", "vector"],
  };

  const onFav = (a: Asset) => {
    setFavIds(
      (prev) =>
        new Set(
          prev.has(a.id)
            ? [...Array.from(prev).filter((id) => id !== a.id)]
            : [...Array.from(prev), a.id]
        )
    );
  };

  const onReport = (a: Asset) => {
    setReportAsset(a);
    setReportOpen(true);
  };

  const filtered = useMemo(() => {
    let list = MOCK_ASSETS.filter((a) =>
      a.title.toLowerCase().includes(q.toLowerCase())
    ).filter((a) => tabTypeMap[activeTab].includes(a.type));

    if (activeTab === "images") {
      if (grade) list = list.filter((a) => !a.grade || a.grade === grade);
      if (subject)
        list = list.filter((a) => !a.subject || a.subject === subject);
      if (chapter)
        list = list.filter((a) => !a.chapter || a.chapter === chapter);
      if (topic && topic !== "All")
        list = list.filter((a) => !a.topic || a.topic === topic);
    }

    if (sortBy === "Newest")
      list = list
        .slice()
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sortBy === "Oldest")
      list = list
        .slice()
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    if (sortBy === "Popular")
      list = list.slice().sort((a, b) => b.downloads - a.downloads);

    return list;
  }, [q, activeTab, sortBy, grade, subject, chapter, topic, artStyle]);

  const onReportSubmit = (data: {
    name: string;
    contact: string;
    comment: string;
    assetId?: string;
  }) => {
    console.log("Report submitted", data);
  };

  const ComingSoon = (
    <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-600">
      Coming Soon
    </div>
  );

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            {/* Left: Logo + Tabs */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src="/pw-logo.png"
                  alt="PW Logo"
                  className="h-9 w-9 rounded-2xl object-contain"
                />
                <span className="text-sm font-semibold text-gray-900">
                  Creative Hub
                </span>
              </div>

              {/* Tabs */}
              <nav className="hidden md:flex items-center gap-1 rounded-xl border bg-white p-1">
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
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search assets, tags, contributors…"
                  className="w-full outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Right: Upload → (Sign In or Profile) */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-black text-white text-sm px-3 py-2"
              >
                <Upload className="h-4 w-4" /> Upload
              </button>

              {!user ? (
                <button
                  className="inline-flex items-center gap-2 rounded-xl border text-sm px-3 py-2"
                  onClick={() => setUser({ name: "PW User" })}
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </button>
              ) : (
                <>
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border text-sm px-3 py-2"
                    onClick={() => setProfileOpen(!profileOpen)}
                  >
                    {user.name}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-10 w-40 rounded-xl border bg-white shadow">
                      <button className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2">
                        <Heart className="h-4 w-4" /> Fav
                      </button>
                      <button
                        className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50"
                        onClick={() => {
                          setUser(null);
                          setProfileOpen(false);
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3 lg:col-span-3 space-y-4">
            <FiltersPanel
              activeTab={activeTab}
              grade={grade}
              setGrade={setGrade}
              subject={subject}
              setSubject={setSubject}
              chapter={chapter}
              setChapter={setChapter}
              topic={topic}
              setTopic={setTopic}
              artStyle={artStyle}
              setArtStyle={setArtStyle}
            />
            <div className="rounded-2xl border bg-white p-4">
              <p className="text-xs text-gray-500">
                Tip: Use filters to narrow down results.
              </p>
            </div>
          </aside>

          <section className="col-span-12 md:col-span-9 lg:col-span-9">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filtered.length}</span>{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl border bg-white p-1">
                  <button
                    onClick={() => setView("grid")}
                    className={`px-3 py-1.5 text-xs rounded-lg ${
                      view === "grid" ? "bg-black text-white" : "text-gray-700"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`px-3 py-1.5 text-xs rounded-lg ${
                      view === "list" ? "bg-black text-white" : "text-gray-700"
                    }`}
                  >
                    List
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-xl border bg-white"
                  >
                    <option>Newest</option>
                    <option>Oldest</option>
                    <option>Popular</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {activeTab !== "images" ? (
              <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-600">
                Coming Soon
              </div>
            ) : (
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
                    onFav={onFav}
                  />
                ))}
              </div>
            )}

            <div className="mt-8">
              <Guide />
            </div>
          </section>
        </main>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <DetailDrawer
              asset={selected}
              onClose={() => setSelected(null)}
              onFav={onFav}
              onReport={onReport}
            />
          )}
        </AnimatePresence>

        {/* Modals */}
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          activeTab={activeTab}
        />
        <ReportModal
          open={reportOpen}
          asset={reportAsset || undefined}
          onClose={() => setReportOpen(false)}
          onSubmit={onReportSubmit}
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

/* =====================================================
   Simple runtime tests (non-blocking)
   ===================================================== */
if (typeof window !== "undefined") {
  try {
    const grade9 = MOCK_ASSETS.filter(function (a) {
      return a.grade === "9";
    }).length;
    console.assert(
      grade9 === 3,
      "Expected 3 assets for Grade 9, got " + grade9
    );

    const sub = MOCK_ASSETS.filter(function (a) {
      return a.grade === "9" && a.subject === "Science";
    }).length;
    console.assert(
      sub === 3,
      "Expected 3 assets for Grade 9 + Science, got " + sub
    );

    const chap = MOCK_ASSETS.filter(function (a) {
      return (
        a.grade === "9" && a.subject === "Science" && a.chapter === "Tissues"
      );
    }).length;
    console.assert(
      chap === 3,
      "Expected 3 assets for Grade 9 + Science + Tissues, got " + chap
    );

    const bamboo = MOCK_ASSETS.filter(function (a) {
      return (
        a.grade === "9" &&
        a.subject === "Science" &&
        a.chapter === "Tissues" &&
        a.topic === "Bamboo"
      );
    }).length;
    console.assert(bamboo === 1, "Expected 1 Bamboo asset, got " + bamboo);
  } catch (err) {
    console.error("Runtime tests failed:", err);
  }
}

export default App;
