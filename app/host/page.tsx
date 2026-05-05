"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../../components/shared/Navbar";
import {
  Upload, CheckCircle2, DollarSign, Sparkles, Plus, Trash2, Tag,
  BarChart3, Users, ArrowLeft, LogOut, Eye, EyeOff, Lock,
  ShieldCheck, AlertCircle, ScanLine, Ticket, TrendingUp, Calendar,
  ExternalLink, Edit2, MapPin, FileText, Hash, ChevronDown,
  Download, Search, CheckCheck, Clock, Phone, Mail, UserCheck, XCircle, PieChart,
  ToggleLeft, ToggleRight, Percent, BadgeDollarSign
} from "lucide-react";
import Link from "next/link";
import { uploadImage } from "../../libs/uploadImage";

interface TicketType {
  name: string;
  price: string;
  capacity: string;
}

interface OrganizerEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: string;
  image: string;
  category: string;
  aiTag: string;
  tickets: TicketType[];
  organizerEmail: string;
  createdAt: string;
  cancelled?: boolean;
  cancelReason?: string;
  cancelledAt?: string | null;
}

interface Host {
  name: string;
  email: string;
  phone: string;
  password: string;
  joined: string;
}

interface SoldTicket {
  id: string;
  title: string;
  eventTitle?: string;
  type: string;
  price: number;
  quantity: number;
  date: string;
  time: string;
  location: string;
  image: string;
  purchasedAt: string;
  phone: string;
  email?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}

interface PromoCode {
  discount: number;
  type: "percent" | "fixed";
  description: string;
  active: boolean;
}

const DEFAULT_PROMOS: Record<string, PromoCode> = {
  NENE10:    { discount: 10,  type: "percent", description: "10% off — NeneTickets special",   active: true },
  WELCOME20: { discount: 20,  type: "percent", description: "20% off — new user welcome",      active: true },
  STUDENT15: { discount: 15,  type: "percent", description: "15% off — student discount",      active: true },
  EARLYBIRD: { discount: 20,  type: "percent", description: "20% off — early bird deal",       active: true },
  NAIROBI25: { discount: 25,  type: "percent", description: "25% off — Nairobi locals",        active: true },
  FRIYAY:    { discount: 15,  type: "percent", description: "15% off — Friday special",        active: true },
  VIP500:    { discount: 500, type: "fixed",   description: "KES 500 off any ticket",          active: true },
  LAUNCH50:  { discount: 50,  type: "percent", description: "50% off — launch celebration",    active: false },
};

const STOCK_IMAGES = [
  { label: "Concert / Music", value: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070" },
  { label: "Sports Event", value: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931" },
  { label: "Conference / Business", value: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070" },
  { label: "Art Exhibition", value: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079" },
  { label: "Nightlife / Club", value: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070" },
  { label: "Tech / Startup", value: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070" },
  { label: "Adventure / Outdoors", value: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070" },
];

export default function HostPage() {
  const [view, setView] = useState("loading");
  const [host, setHost] = useState<Host | null>(null);
  const [myEvents, setMyEvents] = useState<OrganizerEvent[]>([]);
  const [soldTickets, setSoldTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, attendees: 0, events: 0, capacity: 0 });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    category: "Music",
    image: STOCK_IMAGES[0].value,
  });
  const [tickets, setTickets] = useState<TicketType[]>([{ name: "Regular", price: "2500", capacity: "100" }]);
  const [newTicket, setNewTicket] = useState<TicketType>({ name: "", price: "", capacity: "" });
  const [isPublished, setIsPublished] = useState(false);
  const [publishedId, setPublishedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [editingEvent, setEditingEvent] = useState<OrganizerEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OrganizerEvent | null>(null);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [dashTab, setDashTab] = useState<"events" | "promos">("events");
  const [promoCodes, setPromoCodes] = useState<Record<string, PromoCode>>(DEFAULT_PROMOS);
  const [imageUploading, setImageUploading] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: "", discount: "", type: "percent" as "percent" | "fixed", description: "" });
  const [promoSaved, setPromoSaved] = useState(false);
  const [refunds, setRefunds] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Multi-step signup state
  const [signupStep, setSignupStep] = useState<"info" | "bank" | "otp">("info");
  const [signupData, setSignupData] = useState<{ name: string; email: string; phone: string; password: string } | null>(null);
  const [banks, setBanks] = useState<Array<{ name: string; code: string }>>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<{ name: string; code: string } | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [subaccountLoading, setSubaccountLoading] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);

  const loadDashboardData = useCallback(async (currentHost?: Host) => {
    const activeHost = currentHost ?? host;
    if (!activeHost) return;

    // Fetch events from KV database (cross-browser)
    let allEvents: OrganizerEvent[] = [];
    try {
      const res = await fetch("/api/events");
      if (res.ok) allEvents = await res.json();
    } catch {
      // Fallback to localStorage if API is unavailable
      allEvents = JSON.parse(localStorage.getItem("nene_events") || "[]");
    }

    const allSold: any[] = JSON.parse(localStorage.getItem("nene_sold_tickets") || "[]");
    const storedRefunds = JSON.parse(localStorage.getItem("nene_refunds") || "{}");
    setRefunds(storedRefunds);

    // Only show this organizer's events
    const mine = allEvents.filter(
      (ev) => !ev.organizerEmail || ev.organizerEmail === activeHost.email
    );

    setMyEvents(mine);
    setSoldTickets(allSold);

    let totalRevenue = 0;
    let totalCapacity = 0;

    mine.forEach((ev) => {
      const sold = allSold.filter((t) => t.title === ev.title || t.eventTitle === ev.title).length;
      const lowestPrice = ev.tickets?.length
        ? Math.min(...ev.tickets.map((t) => parseInt(t.price) || 0))
        : parseInt(ev.price?.replace(/[^0-9]/g, "") || "0");
      totalRevenue += sold * lowestPrice * 0.95; // Net after 5% platform fee
      totalCapacity += ev.tickets?.reduce((acc, t) => acc + (parseInt(t.capacity) || 0), 0) ?? 0;
    });

    setStats({
      revenue: totalRevenue,
      attendees: allSold.length,
      events: mine.length,
      capacity: totalCapacity,
    });
  }, [host]);

  useEffect(() => {
    const savedHost = localStorage.getItem("nene_active_session");
    if (savedHost) {
      const parsed: Host = JSON.parse(savedHost);
      setHost(parsed);
      loadDashboardData(parsed);
      setView("dashboard");
    } else {
      setView("auth");
    }
    // Load promo codes
    try {
      const stored = localStorage.getItem("nene_promo_codes");
      if (stored) setPromoCodes({ ...DEFAULT_PROMOS, ...JSON.parse(stored) });
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPasswordStrength(score);
    return score;
  };

  // Step 1 — collect basic info, then move to bank details
  const handleSignupStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    const form = e.currentTarget;
    const name            = (form.elements.namedItem("name")            as HTMLInputElement).value.trim();
    const email           = (form.elements.namedItem("email")           as HTMLInputElement).value.trim();
    const phone           = (form.elements.namedItem("phone")           as HTMLInputElement).value.trim();
    const password        = (form.elements.namedItem("password")        as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (password !== confirmPassword) { setAuthError("Passwords do not match."); return; }
    if (passwordStrength < 3) { setAuthError("Password is too weak. Add uppercase, numbers, and symbols."); return; }

    const existingUsers: Host[] = JSON.parse(localStorage.getItem("nene_users_db") || "[]");
    if (existingUsers.find((u) => u.email === email)) { setAuthError("An account with this email already exists."); return; }

    setSignupData({ name, email, phone, password });
    setSignupStep("bank");

    // Pre-fetch bank list
    setBankLoading(true);
    fetch("/api/paystack/banks")
      .then((r) => r.json())
      .then((d: { banks: Array<{ name: string; code: string }> }) => setBanks(d.banks ?? []))
      .catch(() => {})
      .finally(() => setBankLoading(false));
  };

  // Step 2 — bank details → create Paystack subaccount → send OTP
  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData || !selectedBank) { setAuthError("Please select your bank."); return; }
    if (!accountNumber.trim()) { setAuthError("Please enter your account number."); return; }
    if (!accountName.trim()) { setAuthError("Please enter your account name."); return; }

    setAuthError("");
    setSubaccountLoading(true);

    try {
      // Create Paystack subaccount
      const subRes  = await fetch("/api/paystack/subaccount", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name:         signupData.name,
          settlement_bank:       selectedBank.code,
          account_number:        accountNumber.trim(),
          primary_contact_email: signupData.email,
          primary_contact_name:  signupData.name,
          primary_contact_phone: signupData.phone,
        }),
      });
      const subData = await subRes.json() as { success: boolean; subaccount_code?: string; error?: string };

      // Subaccount creation failed — warn but don't block (can be fixed later)
      if (!subData.success) {
        console.warn("Subaccount warning:", subData.error);
      }

      // Store bank + subaccount info in signupData for later
      const enrichedSignupData = {
        ...signupData,
        bankName:        selectedBank.name,
        bankCode:        selectedBank.code,
        accountNumber:   accountNumber.trim(),
        accountName:     accountName.trim(),
        subaccount_code: subData.subaccount_code ?? "",
      };
      setSignupData(enrichedSignupData as typeof signupData & typeof enrichedSignupData);

      // Send OTP
      await fetch("/api/email/otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email, name: signupData.name }),
      });

      setSignupStep("otp");
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setSubaccountLoading(false);
    }
  };

  // Step 3 — verify OTP → create account → go to dashboard
  const handleVerifyOtp = async () => {
    if (!signupData || otpInput.length !== 6) { setOtpError("Enter the 6-digit code."); return; }
    setOtpError("");
    setOtpLoading(true);

    try {
      const res  = await fetch("/api/email/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email, otp: otpInput }),
      });
      const data = await res.json() as { success: boolean; error?: string };

      if (!data.success) { setOtpError(data.error ?? "Incorrect code."); return; }

      // OTP confirmed — persist account
      const enriched = signupData as typeof signupData & {
        bankName?: string; bankCode?: string; accountNumber?: string;
        accountName?: string; subaccount_code?: string;
      };
      const newHost: Host = {
        name:            enriched.name,
        email:           enriched.email,
        phone:           enriched.phone,
        password:        enriched.password,
        joined:          new Date().toLocaleDateString("en-KE"),
      };
      const hostWithBank = {
        ...newHost,
        emailVerified:   true,
        bankName:        enriched.bankName ?? "",
        bankCode:        enriched.bankCode ?? "",
        accountNumber:   enriched.accountNumber ?? "",
        accountName:     enriched.accountName ?? "",
        subaccount_code: enriched.subaccount_code ?? "",
      };

      const existingUsers: Host[] = JSON.parse(localStorage.getItem("nene_users_db") || "[]");
      existingUsers.push(hostWithBank as unknown as Host);
      localStorage.setItem("nene_users_db", JSON.stringify(existingUsers));
      localStorage.setItem("nene_active_session", JSON.stringify(hostWithBank));
      setHost(hostWithBank as unknown as Host);
      loadDashboardData(hostWithBank as unknown as Host);
      setView("dashboard");
    } catch {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!signupData) return;
    setOtpResending(true);
    try {
      await fetch("/api/email/otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email, name: signupData.name }),
      });
    } finally {
      setOtpResending(false);
    }
  };

  // Legacy handleSignup — not used (kept for type compatibility)
  const handleSignup = handleSignupStep1;

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const existingUsers: Host[] = JSON.parse(localStorage.getItem("nene_users_db") || "[]");
    const foundUser = existingUsers.find((u) => u.email === email && u.password === password);
    if (foundUser) {
      localStorage.setItem("nene_active_session", JSON.stringify(foundUser));
      setHost(foundUser);
      loadDashboardData(foundUser);
      setView("dashboard");
    } else {
      setAuthError("Invalid email or password. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nene_active_session");
    setHost(null);
    setView("auth");
    setAuthMode("login");
  };

  const getTicketsSoldForEvent = (eventTitle: string) => {
    return soldTickets.filter((t: any) => t.title === eventTitle || t.eventTitle === eventTitle).length;
  };

  const getRevenueForEvent = (event: OrganizerEvent) => {
    const sold = getTicketsSoldForEvent(event.title);
    const lowestPrice = event.tickets?.length
      ? Math.min(...event.tickets.map((t) => parseInt(t.price) || 0))
      : parseInt(event.price?.replace(/[^0-9]/g, "") || "0");
    return Math.round(sold * lowestPrice * 0.95); // Net after 5% platform fee
  };

  const getTotalCapacityForEvent = (event: OrganizerEvent) => {
    return event.tickets?.reduce((acc, t) => acc + (parseInt(t.capacity) || 0), 0) ?? 0;
  };

  const handleDeleteEvent = async (eventId: string) => {
    setDeleteConfirm(null);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // Confirmed deleted — remove from UI and re-sync from Redis
      setMyEvents((prev) => prev.filter((e) => e.id !== eventId));
      // Re-fetch to make sure local state matches Redis
      setTimeout(() => loadDashboardData(), 500);
    } catch {
      alert("Could not delete the event. Please try again.");
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    setCancelConfirm(null);
    const reason = cancelReason;
    setCancelReason("");
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelled: true, cancelReason: reason }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      setMyEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, cancelled: true, cancelReason: reason, cancelledAt: new Date().toISOString() }
            : e
        )
      );
      setTimeout(() => loadDashboardData(), 500);
    } catch {
      alert("Could not cancel the event. Please try again.");
    }
  };

  const handleRestoreEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelled: false }),
      });
      if (!res.ok) throw new Error("Restore failed");
      setMyEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, cancelled: false, cancelReason: "", cancelledAt: null }
            : e
        )
      );
      setTimeout(() => loadDashboardData(), 500);
    } catch {
      alert("Could not restore the event. Please try again.");
    }
  };

  const toggleRefund = (ticketId: string) => {
    const updated = { ...refunds, [ticketId]: !refunds[ticketId] };
    setRefunds(updated);
    localStorage.setItem("nene_refunds", JSON.stringify(updated));
  };

  const handleNotifyWhatsApp = (event: OrganizerEvent) => {
    const holders = getAttendeesForEvent(event.title).filter((a) => a.phone);
    if (!holders.length) {
      alert("No ticket holders have a phone number on record.");
      return;
    }
    const message = `Hello! We regret to inform you that *${event.title}* scheduled for ${event.date} has been cancelled.${event.cancelReason ? `\n\nReason: ${event.cancelReason}` : ""}\n\nYour refund will be processed within 7 business days. We sincerely apologise for the inconvenience.\n\n— NeneTickets`;
    holders.forEach((a, i) => {
      const raw = (a.phone || "").replace(/\D/g, "");
      const phone = raw.startsWith("0") ? `254${raw.slice(1)}` : raw.startsWith("254") ? raw : `254${raw}`;
      setTimeout(() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank"), i * 700);
    });
  };

  const startEditEvent = (event: OrganizerEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      location: event.location,
      date: event.date,
      time: event.time || "",
      category: event.category,
      image: event.image,
    });
    setTickets(event.tickets?.length ? event.tickets : [{ name: "Regular", price: "2500", capacity: "100" }]);
    setIsPublished(false);
    setView("create");
  };

  const resetCreateForm = () => {
    setEditingEvent(null);
    setFormData({
      title: "", description: "", location: "", date: "", time: "",
      category: "Music", image: STOCK_IMAGES[0].value,
    });
    setTickets([{ name: "Regular", price: "2500", capacity: "100" }]);
    setIsPublished(false);
  };

  const savePromoCodes = (updated: Record<string, PromoCode>) => {
    // Only save organizer-modified codes (not the defaults)
    localStorage.setItem("nene_promo_codes", JSON.stringify(updated));
    setPromoCodes(updated);
    setPromoSaved(true);
    setTimeout(() => setPromoSaved(false), 2000);
  };

  const togglePromo = (code: string) => {
    const updated = { ...promoCodes, [code]: { ...promoCodes[code], active: !promoCodes[code].active } };
    savePromoCodes(updated);
  };

  const deletePromo = (code: string) => {
    const updated = { ...promoCodes };
    delete updated[code];
    savePromoCodes(updated);
  };

  const addPromoCode = () => {
    const code = newPromo.code.trim().toUpperCase();
    const discount = parseInt(newPromo.discount);
    if (!code || !discount || !newPromo.description) return;
    if (newPromo.type === "percent" && (discount < 1 || discount > 100)) return;
    const updated = {
      ...promoCodes,
      [code]: { discount, type: newPromo.type, description: newPromo.description.trim(), active: true },
    };
    savePromoCodes(updated);
    setNewPromo({ code: "", discount: "", type: "percent", description: "" });
  };

  const getAttendeesForEvent = (eventTitle: string): SoldTicket[] => {
    return soldTickets.filter(
      (t: SoldTicket) => t.title === eventTitle || t.eventTitle === eventTitle
    );
  };

  const toggleCheckIn = (ticketId: string) => {
    const all: SoldTicket[] = JSON.parse(localStorage.getItem("nene_sold_tickets") || "[]");
    const idx = all.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      all[idx].checkedIn = !all[idx].checkedIn;
      all[idx].checkedInAt = all[idx].checkedIn ? new Date().toISOString() : undefined;
      localStorage.setItem("nene_sold_tickets", JSON.stringify(all));
      setSoldTickets([...all]);
    }
  };

  const exportAttendeesCSV = (event: OrganizerEvent) => {
    const attendees = getAttendeesForEvent(event.title);
    const headers = ["Ticket ID", "Ticket Type", "Phone", "Email", "Quantity", "Price (KES)", "Purchased At", "Checked In", "Check-In Time"];
    const rows = attendees.map((t: SoldTicket) => [
      t.id,
      t.type,
      t.phone || "—",
      t.email || "—",
      t.quantity,
      t.price,
      new Date(t.purchasedAt).toLocaleString("en-KE"),
      t.checkedIn ? "Yes" : "No",
      t.checkedInAt ? new Date(t.checkedInAt).toLocaleString("en-KE") : "—",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "_")}_attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.date || !formData.location) return;
    setIsLoading(true);

    const lowestPrice = tickets.length > 0
      ? Math.min(...tickets.map((t) => parseInt(t.price) || 0))
      : 0;

    // Format date as "Jun 7, 2026" so it displays and sorts correctly everywhere
    const formattedDate = formData.date
      ? new Date(formData.date + "T12:00:00").toLocaleDateString("en-KE", {
          month: "short", day: "numeric", year: "numeric",
        })
      : formData.date;

    if (editingEvent) {
      // Update existing event via API
      const updates = {
        title: formData.title,
        description: formData.description,
        date: formattedDate,
        time: formData.time,
        location: formData.location,
        price: `KES ${lowestPrice.toLocaleString()}`,
        image: formData.image,
        category: formData.category,
        tickets,
      };
      try {
        await fetch(`/api/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } catch { /* silent */ }
      // Update state directly — no re-fetch needed
      setMyEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id ? { ...e, ...updates } : e
        )
      );
      setPublishedId(editingEvent.id);
      setIsLoading(false);
      setIsPublished(true);
    } else {
      // Create new event via API
      const id = Date.now().toString();
      const newEvent: OrganizerEvent = {
        id,
        title: formData.title,
        description: formData.description,
        date: formattedDate,
        time: formData.time,
        location: formData.location,
        price: `KES ${lowestPrice.toLocaleString()}`,
        image: formData.image,
        category: formData.category,
        aiTag: "New Added ✨",
        tickets,
        organizerEmail: host?.email ?? "",
        createdAt: new Date().toISOString(),
      };
      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent),
        });
      } catch { /* silent */ }
      // Add to state directly — no re-fetch needed
      setMyEvents((prev) => [newEvent, ...prev]);
      setPublishedId(id);
      setIsLoading(false);
      setIsPublished(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, image: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
    // Upload to ImgBB in background
    try {
      setImageUploading(true);
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch {
      // Keep local preview on failure — silent
    } finally {
      setImageUploading(false);
    }
  };

  const addTicket = () => {
    if (newTicket.name && newTicket.price) {
      setTickets([...tickets, { ...newTicket, capacity: newTicket.capacity || "50" }]);
      setNewTicket({ name: "", price: "", capacity: "" });
    }
  };

  const removeTicket = (index: number) => setTickets(tickets.filter((_, i) => i !== index));

  // ─── LOADING ─────────────────────────────────────────────────────────────────
  if (view === "loading") {
    return (
      <main className="min-h-screen bg-[#050511] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ─── AUTH VIEW ───────────────────────────────────────────────────────────────
  if (view === "auth") {
    return (
      <main className="min-h-screen bg-[#050511] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-4 pt-24">
          <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-40 h-40" />
            </div>

            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30 text-2xl">🎪</div>
              <h1 className="text-2xl font-bold">{authMode === "login" ? "Organizer Login" : "Create Organizer Account"}</h1>
              <p className="text-gray-400 text-sm mt-1">Access your NeneTickets organizer dashboard.</p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {authError}
              </div>
            )}

            {/* ── Step indicator (signup only) ── */}
            {authMode === "signup" && (
              <div className="flex items-center gap-2 mb-6 relative z-10">
                {[{ n: 1, label: "Account" }, { n: 2, label: "Bank" }, { n: 3, label: "Verify" }].map(({ n, label }, i) => {
                  const active = (signupStep === "info" && n === 1) || (signupStep === "bank" && n === 2) || (signupStep === "otp" && n === 3);
                  const done   = (signupStep === "bank" && n === 1) || (signupStep === "otp" && n <= 2);
                  return (
                    <div key={n} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-white/10 text-gray-600"}`}>
                        {done ? "✓" : n}
                      </div>
                      <span className={`text-xs font-bold ${active ? "text-white" : done ? "text-green-400" : "text-gray-600"}`}>{label}</span>
                      {i < 2 && <div className="flex-1 h-px bg-white/10" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Step 1: Basic info ── */}
            {(authMode === "login" || signupStep === "info") && (
              <form onSubmit={authMode === "login" ? handleLogin : handleSignupStep1} className="space-y-4 relative z-10">
                {authMode === "signup" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Business / Organizer Name</label>
                      <input name="name" required placeholder="e.g. Nene Events Ltd" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition placeholder:text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                      <input name="phone" type="tel" required placeholder="07XX XXX XXX" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition placeholder:text-gray-700" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input name="email" type="email" required placeholder="name@company.com" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition placeholder:text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                      onChange={(e) => authMode === "signup" && checkPasswordStrength(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition pr-10 placeholder:text-gray-700" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-white transition">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {authMode === "signup" && (
                  <>
                    <div className="space-y-1">
                      <div className="flex gap-1 h-1.5">
                        {[1,2,3,4].map((n) => (
                          <div key={n} className={`flex-1 rounded-full transition-colors ${passwordStrength >= n ? (n <= 1 ? "bg-red-500" : n <= 2 ? "bg-yellow-500" : n <= 3 ? "bg-blue-500" : "bg-green-500") : "bg-gray-800"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        {passwordStrength === 0 ? "Enter a password" : passwordStrength === 1 ? "Weak — add uppercase & numbers" : passwordStrength === 2 ? "Fair — add symbols" : passwordStrength === 3 ? "Good" : "Strong ✓"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                      <input name="confirmPassword" type="password" required placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition placeholder:text-gray-700" />
                    </div>
                  </>
                )}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-2">
                  <Lock className="w-4 h-4" /> {authMode === "login" ? "Sign In to Dashboard" : "Continue →"}
                </button>
              </form>
            )}

            {/* ── Step 2: Bank details ── */}
            {authMode === "signup" && signupStep === "bank" && (
              <form onSubmit={handleSignupStep2} className="space-y-4 relative z-10">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-2">
                  <p className="text-xs text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    Your bank details are needed to receive ticket payouts directly. NeneTickets deducts 5% per ticket sold.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Bank Name</label>
                  {bankLoading ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm p-3"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Loading banks…</div>
                  ) : (
                    <div className="relative">
                      <select
                        required
                        value={selectedBank?.code ?? ""}
                        onChange={(e) => {
                          const b = banks.find((bk) => bk.code === e.target.value);
                          setSelectedBank(b ?? null);
                        }}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition appearance-none"
                      >
                        <option value="" disabled>Select your bank…</option>
                        {banks.map((b, i) => (
                          <option key={`${b.code}-${i}`} value={b.code}>{b.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Account Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={20}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 0123456789"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition placeholder:text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Account Name</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Name on the bank account"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition placeholder:text-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subaccountLoading || !selectedBank || !accountNumber || !accountName}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-2"
                >
                  {subaccountLoading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up payout account…</>
                    : <>Continue → Verify Email</>
                  }
                </button>
                <button type="button" onClick={() => { setSignupStep("info"); setAuthError(""); }} className="w-full text-gray-500 hover:text-gray-300 text-sm transition">
                  ← Back
                </button>
              </form>
            )}

            {/* ── Step 3: OTP verification ── */}
            {authMode === "signup" && signupStep === "otp" && (
              <div className="relative z-10 space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-7 h-7 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400">We sent a 6-digit code to</p>
                  <p className="text-sm font-bold text-white mt-0.5">{signupData?.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider text-center">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                    placeholder="••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-blue-500 transition placeholder:text-gray-700 placeholder:text-base placeholder:tracking-normal"
                  />
                  {otpError && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {otpError}</p>
                  )}
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otpInput.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {otpLoading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                    : <><CheckCircle2 className="w-4 h-4" /> Verify & Create Account</>
                  }
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Didn&apos;t receive it?{" "}
                    <button onClick={resendOtp} disabled={otpResending} className="text-blue-400 hover:text-blue-300 font-bold transition">
                      {otpResending ? "Sending…" : "Resend code"}
                    </button>
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500">
                {authMode === "login" ? "New organizer? " : "Already have an account? "}
                <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); setPasswordStrength(0); setSignupStep("info"); }} className="text-blue-400 font-bold hover:text-blue-300 transition">
                  {authMode === "login" ? "Create Account" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── DASHBOARD VIEW ──────────────────────────────────────────────────────────
  if (view === "dashboard") {
    const maxRev = Math.max(...myEvents.map((ev) => getRevenueForEvent(ev)), 1);

    return (
      <main className="min-h-screen bg-[#050511] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 max-w-6xl">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Organizer Dashboard</p>
              <h1 className="text-3xl font-bold">Welcome back, {host?.name} 👋</h1>
              <p className="text-gray-500 text-sm mt-1">{host?.email}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handleLogout} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold px-4 py-2.5 border border-white/10 rounded-xl hover:border-white/30 transition">
                <LogOut className="w-4 h-4" /> Logout
              </button>
              <Link href="/validator">
                <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 hover:text-purple-300 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition">
                  <ScanLine className="w-4 h-4" /> Scan Tickets
                </button>
              </Link>
              <button
                onClick={() => { resetCreateForm(); setView("create"); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/30"
              >
                <Plus className="w-4 h-4" /> Create Event
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-green-500/30 transition">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <DollarSign className="w-3.5 h-3.5 text-green-400" /> Revenue
              </div>
              <div className="text-2xl font-bold">KES {stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-0.5">Net earnings (after 5% fee)</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-blue-500/30 transition">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <Ticket className="w-3.5 h-3.5 text-blue-400" /> Sold
              </div>
              <div className="text-2xl font-bold">{soldTickets.length}</div>
              <p className="text-xs text-gray-600 mt-0.5">Tickets sold</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-purple-500/30 transition">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Events
              </div>
              <div className="text-2xl font-bold">{stats.events}</div>
              <p className="text-xs text-gray-600 mt-0.5">Published & live</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-orange-500/30 transition">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-orange-400" /> Capacity
              </div>
              <div className="text-2xl font-bold">{stats.capacity.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-0.5">Total seats available</p>
            </div>
          </div>

          {/* Revenue Chart */}
          {myEvents.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-sm font-bold mb-5 flex items-center gap-2 text-gray-300 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Revenue by Event
              </h2>
              <div className="space-y-4">
                {myEvents.map((ev) => {
                  const rev = getRevenueForEvent(ev);
                  const sold = getTicketsSoldForEvent(ev.title);
                  const cap = getTotalCapacityForEvent(ev);
                  const pct = Math.round((rev / maxRev) * 100);
                  const fillPct = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                  return (
                    <div key={ev.id}>
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="text-gray-300 truncate max-w-[55%] font-bold">{ev.title}</span>
                        <div className="flex items-center gap-3 text-gray-500 flex-shrink-0">
                          <span>{sold}/{cap > 0 ? cap : "?"} sold</span>
                          {cap > 0 && <span className={`font-bold ${fillPct >= 80 ? "text-red-400" : fillPct >= 50 ? "text-yellow-400" : "text-green-400"}`}>{fillPct}%</span>}
                          <span className="text-white font-bold">{rev > 0 ? `KES ${rev.toLocaleString()}` : "—"}</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 border-b border-white/10 pb-0">
            <button
              onClick={() => setDashTab("events")}
              className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition border-b-2 -mb-px ${dashTab === "events" ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-white"}`}
            >
              <span className="flex items-center gap-2"><Ticket className="w-4 h-4" /> Your Events</span>
            </button>
            <button
              onClick={() => setDashTab("promos")}
              className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition border-b-2 -mb-px ${dashTab === "promos" ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-white"}`}
            >
              <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> Promo Codes</span>
            </button>
          </div>

          {/* ── PROMO CODES TAB ── */}
          {dashTab === "promos" && (
            <div className="space-y-6">
              {/* Add new code */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-400" /> Create New Promo Code
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Code</label>
                    <input
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                      placeholder="e.g. FLASH30"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono outline-none focus:border-blue-500 transition placeholder:text-gray-700 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Description</label>
                    <input
                      value={newPromo.description}
                      onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                      placeholder="e.g. Flash sale — 30% off"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition placeholder:text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Discount Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewPromo({ ...newPromo, type: "percent" })}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold border transition ${newPromo.type === "percent" ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-black/50 border-white/10 text-gray-500 hover:border-white/30"}`}
                      >
                        <Percent className="w-3.5 h-3.5" /> Percent
                      </button>
                      <button
                        onClick={() => setNewPromo({ ...newPromo, type: "fixed" })}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold border transition ${newPromo.type === "fixed" ? "bg-green-600/20 border-green-500 text-green-400" : "bg-black/50 border-white/10 text-gray-500 hover:border-white/30"}`}
                      >
                        <BadgeDollarSign className="w-3.5 h-3.5" /> Fixed KES
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      {newPromo.type === "percent" ? "Discount %" : "Discount Amount (KES)"}
                    </label>
                    <input
                      type="number"
                      value={newPromo.discount}
                      onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })}
                      placeholder={newPromo.type === "percent" ? "e.g. 20" : "e.g. 500"}
                      min={1}
                      max={newPromo.type === "percent" ? 100 : undefined}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition placeholder:text-gray-700"
                    />
                  </div>
                </div>
                <button
                  onClick={addPromoCode}
                  disabled={!newPromo.code || !newPromo.discount || !newPromo.description}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Promo Code
                </button>
              </div>

              {/* Existing codes */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Active Codes</h3>
                  {promoSaved && (
                    <span className="text-green-400 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>
                <div className="divide-y divide-white/5">
                  {Object.entries(promoCodes).map(([code, data]) => (
                    <div key={code} className={`flex items-center gap-4 px-5 py-4 transition ${data.active ? "" : "opacity-50"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono font-bold text-sm text-white">{code}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${data.type === "fixed" ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"}`}>
                            {data.type === "fixed" ? `KES ${data.discount} off` : `${data.discount}% off`}
                          </span>
                          {!data.active && <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">Inactive</span>}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{data.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => togglePromo(code)}
                          className={`transition ${data.active ? "text-green-400 hover:text-gray-400" : "text-gray-600 hover:text-green-400"}`}
                          title={data.active ? "Deactivate" : "Activate"}
                        >
                          {data.active
                            ? <ToggleRight className="w-6 h-6" />
                            : <ToggleLeft className="w-6 h-6" />
                          }
                        </button>
                        <button
                          onClick={() => deletePromo(code)}
                          className="text-gray-600 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-500/10"
                          title="Delete code"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EVENTS TAB ── */}
          {dashTab === "events" && <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Your Events</h2>
            {myEvents.length > 0 && (
              <span className="text-sm text-gray-500">{myEvents.length} event{myEvents.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {myEvents.length > 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-white/5 text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="px-5 py-4">Event</th>
                      <th className="px-5 py-4"><Calendar className="w-3 h-3 inline mr-1" />Date</th>
                      <th className="px-5 py-4"><Ticket className="w-3 h-3 inline mr-1" />Sold / Cap</th>
                      <th className="px-5 py-4"><DollarSign className="w-3 h-3 inline mr-1" />Revenue</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myEvents.map((event) => {
                      const sold = getTicketsSoldForEvent(event.title);
                      const revenue = getRevenueForEvent(event);
                      const cap = getTotalCapacityForEvent(event);
                      const isConfirming = deleteConfirm === event.id;
                      const isPast = event.date ? new Date(event.date) < new Date() : false;
                      return (
                        <tr key={event.id} className="hover:bg-white/[0.03] transition">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">{event.title}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{event.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">{event.date}</td>
                          <td className="px-5 py-4">
                            <span className={`font-bold text-sm ${sold > 0 ? "text-green-400" : "text-gray-600"}`}>
                              {sold}
                            </span>
                            {cap > 0 && <span className="text-gray-600 text-xs"> / {cap}</span>}
                          </td>
                          <td className="px-5 py-4 font-mono text-sm font-bold">
                            {revenue > 0 ? `KES ${revenue.toLocaleString()}` : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            {event.cancelled
                              ? <span className="bg-red-500/15 text-red-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> CANCELLED</span>
                              : (event as OrganizerEvent & { status?: string }).status === "rejected"
                              ? <span className="bg-red-500/15 text-red-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> REJECTED</span>
                              : (!( event as OrganizerEvent & { status?: string }).status || (event as OrganizerEvent & { status?: string }).status === "pending")
                              ? <span className="bg-yellow-500/15 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> PENDING</span>
                              : isPast
                              ? <span className="bg-white/10 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">ENDED</span>
                              : <span className="bg-green-500/15 text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> LIVE</span>
                            }
                          </td>
                          <td className="px-5 py-4 text-right">
                            {isConfirming ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-gray-500">Delete?</span>
                                <button onClick={() => handleDeleteEvent(event.id)} className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg font-bold hover:bg-red-500/30 transition">Yes</button>
                                <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-white/10 text-gray-400 px-3 py-1 rounded-lg font-bold hover:bg-white/20 transition">No</button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => { setSelectedEvent(event); setAttendeeSearch(""); setView("portal"); }}
                                  className="text-gray-600 hover:text-purple-400 transition p-1.5 rounded-lg hover:bg-purple-500/10"
                                  title="View attendees"
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                                <Link href={`/event/${event.id}`} target="_blank">
                                  <button className="text-gray-600 hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-blue-500/10" title="View event page">
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </Link>
                                <button onClick={() => startEditEvent(event)} className="text-gray-600 hover:text-yellow-400 transition p-1.5 rounded-lg hover:bg-yellow-500/10" title="Edit event">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {event.cancelled ? (
                                  <button onClick={() => handleRestoreEvent(event.id)} className="text-gray-600 hover:text-green-400 transition p-1.5 rounded-lg hover:bg-green-500/10" title="Restore event">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button onClick={() => { setCancelConfirm(event.id); setCancelReason(""); }} className="text-gray-600 hover:text-orange-400 transition p-1.5 rounded-lg hover:bg-orange-500/10" title="Cancel event">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button onClick={() => setDeleteConfirm(event.id)} className="text-gray-600 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10" title="Delete event">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <div className="text-5xl mb-4">🎪</div>
              <h3 className="font-bold text-lg mb-2">No events yet</h3>
              <p className="text-gray-500 text-sm mb-6">Create your first event and start selling tickets today.</p>
              <button onClick={() => { resetCreateForm(); setView("create"); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create First Event
              </button>
            </div>
          )}
          </>}
        </div>

        {/* ── Cancel Event Modal ── */}
        {cancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-400" /> Cancel Event
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                This will mark the event as cancelled. Ticket holders will see a cancellation notice on the event page. You can restore the event at any time.
              </p>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Cancellation Reason <span className="text-gray-700 font-normal">(optional)</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Venue unavailable, artist cancellation, weather conditions…"
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-orange-500 transition resize-none placeholder:text-gray-700"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCancelEvent(cancelConfirm)}
                  className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 py-3 rounded-xl font-bold transition"
                >
                  Confirm Cancel
                </button>
                <button
                  onClick={() => { setCancelConfirm(null); setCancelReason(""); }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 py-3 rounded-xl font-bold transition"
                >
                  Keep Event
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ─── ORGANIZER PORTAL (per-event) ───────────────────────────────────────────
  if (view === "portal" && selectedEvent) {
    const attendees: SoldTicket[] = getAttendeesForEvent(selectedEvent.title);
    const checkedInCount = attendees.filter((a) => a.checkedIn).length;

    // Ticket type breakdown
    const typeBreakdown: Record<string, { sold: number; revenue: number; capacity: number }> = {};
    (selectedEvent.tickets ?? []).forEach((t) => {
      typeBreakdown[t.name] = { sold: 0, revenue: 0, capacity: parseInt(t.capacity) || 0 };
    });
    attendees.forEach((a) => {
      if (!typeBreakdown[a.type]) typeBreakdown[a.type] = { sold: 0, revenue: 0, capacity: 0 };
      typeBreakdown[a.type].sold += a.quantity ?? 1;
      typeBreakdown[a.type].revenue += (a.price ?? 0) * 0.95; // Net after 5% platform fee
    });

    const totalRevenue = Math.round(attendees.reduce((s, a) => s + (a.price ?? 0), 0) * 0.95); // Net after 5% platform fee
    const totalCap = (selectedEvent.tickets ?? []).reduce((s, t) => s + (parseInt(t.capacity) || 0), 0);

    const filtered = attendees.filter((a) => {
      const q = attendeeSearch.toLowerCase();
      return !q || a.id.toLowerCase().includes(q) || (a.phone || "").includes(q) || (a.email || "").toLowerCase().includes(q) || (a.type || "").toLowerCase().includes(q);
    });

    return (
      <main className="min-h-screen bg-[#050511] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 max-w-5xl">

          {/* Back */}
          <button onClick={() => { setView("dashboard"); setSelectedEvent(null); }} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          {/* Event header */}
          <div className="flex flex-col md:flex-row gap-5 items-start mb-10 bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden">
            <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">{selectedEvent.category}</span>
              <h1 className="text-2xl font-bold mt-1 mb-2">{selectedEvent.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-600" />{selectedEvent.date}{selectedEvent.time && ` · ${selectedEvent.time}`}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-600" />{selectedEvent.location}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <Link href={`/event/${selectedEvent.id}`} target="_blank">
                <button className="flex items-center gap-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition">
                  <ExternalLink className="w-3.5 h-3.5" /> View Page
                </button>
              </Link>
              <button
                onClick={() => exportAttendeesCSV(selectedEvent)}
                className="flex items-center gap-1.5 text-xs font-bold bg-green-600/15 hover:bg-green-600/25 border border-green-600/25 text-green-400 px-3 py-2 rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Ticket className="w-3 h-3 text-blue-400" />Tickets Sold</p>
              <p className="text-2xl font-bold">{attendees.length}</p>
              {totalCap > 0 && <p className="text-xs text-gray-600 mt-0.5">of {totalCap} capacity</p>}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-green-400" />Net Payout</p>
              <p className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-0.5">After 5% platform fee</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><UserCheck className="w-3 h-3 text-purple-400" />Checked In</p>
              <p className="text-2xl font-bold">{checkedInCount}</p>
              {attendees.length > 0 && <p className="text-xs text-gray-600 mt-0.5">{Math.round((checkedInCount / attendees.length) * 100)}% of attendees</p>}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3 text-orange-400" />Remaining</p>
              <p className="text-2xl font-bold">{attendees.length - checkedInCount}</p>
              <p className="text-xs text-gray-600 mt-0.5">not yet checked in</p>
            </div>
          </div>

          {/* Cancellation action panel */}
          {selectedEvent.cancelled && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-red-300">Event Cancelled</span>
                  </div>
                  {selectedEvent.cancelReason && (
                    <p className="text-sm text-red-400/70 ml-7">Reason: {selectedEvent.cancelReason}</p>
                  )}
                </div>
                {attendees.filter((a) => a.phone).length > 0 && (
                  <button
                    onClick={() => handleNotifyWhatsApp(selectedEvent)}
                    className="flex items-center gap-2 text-sm font-bold bg-green-600/15 hover:bg-green-600/25 border border-green-600/25 text-green-400 px-4 py-2.5 rounded-xl transition flex-shrink-0"
                  >
                    <Phone className="w-4 h-4" />
                    Notify via WhatsApp ({attendees.filter((a) => a.phone).length})
                  </button>
                )}
              </div>
              {attendees.length > 0 && (
                <div className="mt-5 pt-4 border-t border-red-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-red-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Refund Progress
                    </span>
                    <span className="text-sm font-bold text-orange-400">
                      {attendees.filter((a) => refunds[a.id]).length} / {attendees.length} refunded
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-700"
                      style={{ width: `${attendees.length > 0 ? Math.round((attendees.filter((a) => refunds[a.id]).length / attendees.length) * 100) : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-orange-400/60 mt-1.5">
                    KES {attendees.filter((a) => refunds[a.id]).reduce((s, a) => s + (a.price ?? 0), 0).toLocaleString()} of KES {totalRevenue.toLocaleString()} refunded
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Check-in progress bar — only for active events */}
          {!selectedEvent.cancelled && attendees.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold flex items-center gap-2"><UserCheck className="w-4 h-4 text-purple-400" />Check-in Progress</span>
                <span className="text-sm font-bold text-purple-400">{checkedInCount} / {attendees.length}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700"
                  style={{ width: `${Math.round((checkedInCount / attendees.length) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{Math.round((checkedInCount / attendees.length) * 100)}% of ticket holders checked in</p>
            </div>
          )}

          {/* Ticket type breakdown */}
          {Object.keys(typeBreakdown).length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-400" /> Ticket Type Breakdown
              </h2>
              <div className="space-y-3">
                {Object.entries(typeBreakdown).map(([name, data]) => {
                  const maxSold = Math.max(...Object.values(typeBreakdown).map((d) => d.sold), 1);
                  const pct = data.capacity > 0
                    ? Math.round((data.sold / data.capacity) * 100)
                    : data.sold > 0 ? 100 : 0;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-gray-300">{name}</span>
                        <div className="flex items-center gap-4 text-gray-500">
                          <span>{data.sold}{data.capacity > 0 ? ` / ${data.capacity}` : ""} sold</span>
                          {data.capacity > 0 && <span className={`font-bold ${pct >= 80 ? "text-red-400" : pct >= 50 ? "text-yellow-400" : "text-green-400"}`}>{pct}%</span>}
                          <span className="text-white font-bold">{data.revenue > 0 ? `KES ${data.revenue.toLocaleString()}` : "—"}</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                          style={{ width: `${data.capacity > 0 ? pct : Math.round((data.sold / Math.max(...Object.values(typeBreakdown).map(d => d.sold), 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attendees list */}
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Attendees
              <span className="text-sm font-normal text-gray-500">({attendees.length})</span>
            </h2>
            <div className="relative flex-shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                placeholder="Search by ID, phone, type…"
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition w-64 placeholder:text-gray-700"
              />
            </div>
          </div>

          {attendees.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <div className="text-4xl mb-3">🎟</div>
              <h3 className="font-bold text-lg mb-1">No tickets sold yet</h3>
              <p className="text-gray-500 text-sm">Share your event link to start selling tickets.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No attendees match your search.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((attendee: SoldTicket) => (
                <div key={attendee.id} className={`bg-white/5 border rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition ${attendee.checkedIn ? "border-green-500/20 bg-green-500/5" : "border-white/10 hover:border-white/20"}`}>
                  {/* Left: ticket info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-blue-400 text-xs font-bold uppercase bg-blue-500/10 px-2 py-0.5 rounded-full">{attendee.type}</span>
                      {attendee.checkedIn && (
                        <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" /> Checked In
                        </span>
                      )}
                      {refunds[attendee.id] && (
                        <span className="text-orange-400 text-xs font-bold bg-orange-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Refunded
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-gray-500 mb-2">#{attendee.id}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      {attendee.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-600" /> {attendee.phone}
                        </span>
                      )}
                      {attendee.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-600" /> {attendee.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Ticket className="w-3 h-3 text-gray-600" /> {attendee.quantity ?? 1} ticket{(attendee.quantity ?? 1) > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3 text-gray-600" /> KES {(attendee.price ?? 0).toLocaleString()}
                      </span>
                    </div>
                    {attendee.checkedInAt && (
                      <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Checked in at {new Date(attendee.checkedInAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>

                  {/* Right: purchase time + action buttons */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xs text-gray-600">
                      {new Date(attendee.purchasedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                    </p>
                    {selectedEvent.cancelled ? (
                      <>
                        {attendee.phone && (
                          <a
                            href={`https://wa.me/${((attendee.phone.replace(/\D/g, "")).startsWith("0") ? `254${attendee.phone.replace(/\D/g, "").slice(1)}` : attendee.phone.replace(/\D/g, "").startsWith("254") ? attendee.phone.replace(/\D/g, "") : `254${attendee.phone.replace(/\D/g, "")}`)}?text=${encodeURIComponent(`Hello! *${selectedEvent.title}* has been cancelled. Your refund of KES ${(attendee.price ?? 0).toLocaleString()} will be processed within 7 business days.\n\n— NeneTickets`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-green-600/15 text-green-400 border border-green-600/25 hover:bg-green-600/25 transition">
                              <Phone className="w-3.5 h-3.5" /> WhatsApp
                            </button>
                          </a>
                        )}
                        <button
                          onClick={() => toggleRefund(attendee.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                            refunds[attendee.id]
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-white/5 hover:text-gray-400 hover:border-white/10"
                              : "bg-white/5 text-gray-400 border border-white/10 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/30"
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          {refunds[attendee.id] ? "Refunded ✓" : "Mark Refunded"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => toggleCheckIn(attendee.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                          attendee.checkedIn
                            ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30"
                        }`}
                      >
                        {attendee.checkedIn
                          ? <><XCircle className="w-3.5 h-3.5" /> Undo Check-in</>
                          : <><CheckCheck className="w-3.5 h-3.5" /> Check In</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ─── CREATE / EDIT EVENT VIEW ────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <button onClick={() => { setView("dashboard"); resetCreateForm(); }} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* ── Form ── */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">{editingEvent ? "Edit Event" : "Create New Event"}</h1>
              <p className="text-gray-500 text-sm">{editingEvent ? "Update your event details below." : "Fill in the details and launch your event."}</p>
            </div>

            {!isPublished ? (
              <div className="space-y-5 bg-white/5 border border-white/10 p-7 rounded-3xl">

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Event Title <span className="text-red-400">*</span>
                  </label>
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Nairobi Rock Festival 2026" className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition placeholder:text-gray-700" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Description
                  </label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Tell attendees what to expect — lineup, dress code, age limit, etc." className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition resize-none placeholder:text-gray-700 text-sm" />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-3 h-3" /> Cover Image
                  </label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <div onClick={() => !imageUploading && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center group ${imageUploading ? "border-blue-500/40 bg-blue-500/5 cursor-wait" : "border-white/15 hover:border-blue-500 hover:bg-blue-500/5"}`}>
                        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-600/20 transition">
                          {imageUploading
                            ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            : <Upload className="w-4 h-4 text-blue-400" />
                          }
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white">
                          {imageUploading ? "Uploading…" : "Upload Photo"}
                        </span>
                        <span className="text-xs text-gray-600 mt-0.5">JPG, PNG, WebP</span>
                      </div>
                    </div>
                    <div className="relative">
                      <p className="text-xs text-gray-600 mb-1.5">Or pick a stock image</p>
                      <select
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition appearance-none cursor-pointer text-sm"
                      >
                        {STOCK_IMAGES.map((img) => (
                          <option key={img.value} value={img.value}>{img.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 10)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Time</label>
                    <input
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Location <span className="text-red-400">*</span>
                  </label>
                  <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. KICC, Nairobi" className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition placeholder:text-gray-700" />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
                  <div className="relative">
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition appearance-none cursor-pointer">
                      {["Music", "Sports", "Business", "Arts", "Tech", "Nightlife", "Food & Drink", "Charity", "Adventure"].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Ticket Types */}
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <label className="block text-xs font-bold text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" /> Ticket Types & Pricing
                  </label>

                  {/* Add ticket row */}
                  <div className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2">
                    <input
                      placeholder="Type name (e.g. VIP)"
                      value={newTicket.name}
                      onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                      className="col-span-3 bg-black/50 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-700"
                    />
                    <input type="number" placeholder="Price (KES)" value={newTicket.price} onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })} className="bg-black/50 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-700" />
                    <input type="number" placeholder="Capacity" value={newTicket.capacity} onChange={(e) => setNewTicket({ ...newTicket, capacity: e.target.value })} className="bg-black/50 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-700" />
                    <button onClick={addTicket} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl transition border border-blue-500/20 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mt-4">
                    {tickets.map((ticket, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 px-3.5 py-3 rounded-xl border border-white/5 gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{ticket.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            KES {parseInt(ticket.price || "0").toLocaleString()}
                            {parseInt(ticket.price || "0") > 0 && (
                              <span className="ml-1.5 text-green-500/70">→ you get KES {Math.round(parseInt(ticket.price) * 0.95).toLocaleString()}</span>
                            )}
                            {ticket.capacity && <span className="ml-2 text-gray-600">· {ticket.capacity} seats</span>}
                          </p>
                        </div>
                        <button onClick={() => removeTicket(index)} className="text-gray-600 hover:text-red-400 transition flex-shrink-0 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform fee notice */}
                {tickets.length > 0 && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <Percent className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-300 mb-0.5">Platform Fee</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        NeneTickets charges a <strong className="text-gray-300">5% platform fee</strong> per ticket sold. You receive <strong className="text-gray-300">95% of ticket sales</strong>.
                        {tickets.length > 0 && (() => {
                          const lowestPrice = Math.min(...tickets.map(t => parseInt(t.price) || 0));
                          return lowestPrice > 0 ? (
                            <span className="block mt-1 text-blue-400/70">e.g. KES {lowestPrice.toLocaleString()} ticket → you receive KES {Math.round(lowestPrice * 0.95).toLocaleString()}</span>
                          ) : null;
                        })()}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePublish}
                  disabled={isLoading || imageUploading || tickets.length === 0 || !formData.title || !formData.date || !formData.location}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {isLoading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {editingEvent ? "Saving..." : "Publishing..."}</>
                    : <><Sparkles className="w-5 h-5" /> {editingEvent ? "Save Changes" : "Launch Event"}</>
                  }
                </button>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-10 rounded-3xl text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{editingEvent ? "Event Updated! ✅" : "Event Live! 🎉"}</h2>
                <p className="text-gray-400 mb-8 text-sm">{editingEvent ? "Your changes are now live." : "Your event is now accepting ticket purchases."}</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {publishedId && (
                    <Link href={`/event/${publishedId}`} target="_blank">
                      <button className="bg-white/10 border border-white/20 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" /> View Event Page
                      </button>
                    </Link>
                  )}
                  <button onClick={() => { setView("dashboard"); resetCreateForm(); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition">
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Live Preview ── */}
          <div className="hidden lg:flex w-1/2 flex-col items-start sticky top-24 h-fit">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Preview
            </div>
            <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-52 relative bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="bg-blue-600/80 text-white text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">{formData.category}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold leading-tight mb-2">{formData.title || "Your Event Title"}</h3>
                {formData.description && (
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">{formData.description}</p>
                )}
                <div className="space-y-1 mb-4">
                  <p className="text-gray-400 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-gray-600" />
                    {formData.date || "Date"}{formData.time && ` · ${formData.time}`}
                  </p>
                  <p className="text-gray-400 text-xs flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gray-600" />
                    {formData.location || "Location"}
                  </p>
                </div>
                {tickets.length > 0 && (
                  <div className="pt-3 border-t border-white/10 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">From</p>
                      <p className="text-xl font-bold">KES {Math.min(...tickets.map(t => parseInt(t.price || "0") || 0)).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{tickets.length} ticket type{tickets.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
