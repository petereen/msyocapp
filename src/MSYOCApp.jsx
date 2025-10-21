import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import SchedulePage from './pages/SchedulePage.jsx';
import { supabase } from './lib/supabase.ts';
import { getEventsByDay, getFavorites, toggleFavorite } from './services/events';
import { CalendarPlus, MapPin, Heart, Bell, User, Clock, Mail, Phone, ExternalLink, LogIn, LogOut, Star, Filter, Info, ChevronLeft } from "lucide-react";

/**
 * MSYOC 2025 – Conference App (client‑only prototype)
 * ----------------------------------------------------
 * • Schedule with tracks & favorites
 * • Speaker list & details modal
 * • Interactive venue map (SVG + hotspots)
 * • Info/Contacts
 * • Lightweight account (local only) + notification opt‑in for favorites
 * • LocalStorage persistence for profile & favorites
 * • In‑page reminder toasts + Web Notification API (when granted)
 *
 * Notes:
 * - This is a single‑file React component. Tailwind & shadcn/ui are assumed available.
 * - Notifications are scheduled while the page is open. For background/push, convert to PWA + service worker later.
 */

// -------- Sample Data (edit for your real event) --------
const CONFERENCE_TZ = "Asia/Istanbul"; // user timezone assumed
const days = [
  { id: "2025-11-04", label: "11 сарын 04 (Мягмар)" },
  { id: "2025-11-05", label: "11 сарын 05 (Лхагва)" },
  { id: "2025-11-06", label: "11 сарын 06 (Пүрэв)" },
];

const tracks = [
  { id: "main", name: "Үндсэн үйл ажиллагаа", color: "bg-indigo-100 text-indigo-700" },
  { id: "iltgel", name: "Илтгэл", color: "bg-emerald-100 text-emerald-700" },
  { id: "conference", name: "Хэлэлцүүлэг", color: "bg-orange-100 text-orange-700" },
  { id: "free", name: "Чөлөөт", color: "bg-pink-100 text-pink-700" },
  { id: "food", name: "Цайны цаг", color: "bg-green-100 text-green-700" },
  { id: "workshop", name: "Воркшоп", color: "bg-purple-100 text-purple-700" },
  { id: "trip", name: "Аялал", color: "bg-yellow-100 text-yellow-700" },
  { id: "NEXTGEN", name: "NEXTGEN", color: "bg-blue-100 text-blue-700" },
];

const speakers = [
  {
    id: "spk1",
    name: "Дамдиндоржийн Бэхбаяр",
    title: "Mongolian Economy сэтгүүлийн үүсгэн байгуулагч, Ерөнхий Эрхлэгч, сэтгүүлч",
    avatar: "DB",
    bio: "- 2011 оноос өнөөг хүртэл Mongolian Economy сэтгүүлийн Ерөнхий Эрхлэгч,\n - 2009-2010 он, МҮХАҮТ-ын 'Бизнес ба Хөгжил' сэтгүүлийн Ерөнхий Эрхлэгч - 2000-2008 он, \n 'Өнөөдөр' сонины Эдийн засаг, бизнесийн албаны сэтгүүлч",
    socials: { linkedin: "https://www.linkedin.com", x: "https://x.com" },
  },
  {
    id: "spk2",
    name: "Батхүүгийн Наранбадрах",
    title: "Түүхч, эдийн засагч Монгол адууны диваажин бодлого хөтөлбөрийг санаачлагч",
    avatar: "BN",
    bio: "- НҮБ-ын Энх тайвны элч \n - Монгол адууны диваажин 3000 малчны хөдөлгөөн нь Монгол улсад цөлжилтийн эсрэг малчны 8 бодлого бүхий хөтөлбөр бөгөөд 2022 онд НҮБ-ын Тогтвортой Хөгжлийн манлайлагч санаачлага шагнал авсан\n - 2024 оны Нобелийн Энх Тайвны шагналтан зарлах ёслолын нээлтийг 'Unconditional love is the secret ingredient for peace' 8 минутын илтгэлээр нээж байсан",
    socials: { website: "https://example.com" },
  },
  {
    id: "spk3",
    name: "Хандсүрэнгийн Хатанбаатар",
    title: "Монголын оюун ухааны академийн Үүсгэн байгуулагч, МУГБ",
    avatar: "HH",
    bio: "Монголын оюун ухааны академийн Үүсгэн байгуулагч, МУГБ",
  },
  {
    id: "spk4",
    name: "Ёндонгийн Отгонбаяр",
    title: "Монголын оюун ухааны академийн Үүсгэн байгуулагч, МУГБ",
    avatar: "YO",
    bio: "- 1989-1991 Гадаад хэргийн яаманд атташе, I нарийн бичгийн дарга \n- 1991-1996 Монгол Улсаас Энэтхэгт суугаа Элчин яаманд II нарийн бичгийн дарга \n - 1996-1997 Гадаад хэргийн яамны Олон улсын байгууллагын хэлтэст ажилтан, НҮБ-тай холбоотой төлөөлөгч \n - 1997-2000 “Баянгол” зочид буудал ХХК-ийн захирал, ерөнхий менежер \n - 2000-2001 Гадаад хэргийн яаманд Бодлого, Төлөвлөлтийн хэлтсийн I нарийн бичгийн дарга \n - 2001-2004 Ерөнхий сайдын гадаад бодлогын зөвлөх \n - 2004-2008 Монгол Ардын Хувьсгалт Нам (МАХН, одоогийн МАН)-ын нарийн бичгийн дарга, Ерөнхий нарийн бичгийн дарга \n - 2006-2007 Улаанбаатар хотын МАХН-ын хорооны дарга \n - 2008-2012 Боловсрол, Соёл, Шинжлэх Ухааны сайд \n - 2012-2016 Улсын Их Хурлын гишүүн \n - 2016-2017 Боловсрол, Соёл, Шинжлэх Ухаан, Спортын дэд сайд \n - 2017-2022 Монгол Улсаас АНУ-д суух Онц бөгөөд Бүрэн эрхт Элчин сайд \n - 2022 оноос “Мэргэн сайд Агданбуугийн Амар сан” хөшүүрэг / тэргүүн",
  },
  {
    id: "spk5",
    name: "Оюун-Эрдэнэ Сүрэнжав",
    title: "ХЧМЗ НҮТББ-ын Оюутан, залуучуудын хорооны тэргүүн",
    avatar: "OS",
    bio: "ХЧМЗ НҮТББ-ын Оюутан, залуучуудын хорооны тэргүүн",
  },
  {
    id: "spk6",
    name: "Саранзаяа",
    title: "",
    avatar: "S",
    bio: "",
  },
  {
    id: "spk7",
    name: "Долгион",
    title: "ХЧМЗ НҮТББ-ын",
    avatar: "D",
    bio: "",
  },
];


// -------- Utilities --------
const formatTimeRange = (startIso, endIso) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(s) + " – " + new Intl.DateTimeFormat(undefined, { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  }).format(e);
};

const dayOf = (iso) => new Date(iso).toISOString().slice(0, 10);

// Local storage helpers
const LS_PROFILE = "msyoc.profile";
const LS_FAVS = "msyoc.favorites";
const LS_NOTIFY = "msyoc.notify";

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

// Web Notification wrapper
async function requestNotifications() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch { return "denied"; }
}

function notify({ title, body }) {
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(title, { body }); } catch {}
  }
}

// -------- Main App --------
export default function MSYOCApp() {
  const [tab, setTab] = useState("home");
  const [profile, setProfile] = useLocalStorage(LS_PROFILE, { name: "", email: "" });
  const [favorites, setFavorites] = useLocalStorage(LS_FAVS, []);
  const [notifyOnFavs, setNotifyOnFavs] = useLocalStorage(LS_NOTIFY, true);
  const [filterDay, setFilterDay] = useState(days[0].id);
  const [filterTrack, setFilterTrack] = useState("all");
  const [query, setQuery] = useState("");
  const [speakerOpen, setSpeakerOpen] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load events from database
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const events = await getEventsByDay(filterDay);
        // Transform database events to match your existing format
        const transformedEvents = events.map(event => ({
          id: event.id || crypto.randomUUID(), // Generate UUID if missing
          title: event.title,
          start: event.start_at,
          end: event.end_at,
          track: event.track,
          venue: event.location,
          speakers: event.speaker ? [event.speaker] : [],
          description: event.description
        }));
        setSchedule(transformedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        // Show error message to user
        pushToast({ 
          title: "Алдаа", 
          text: "Үйл ажиллагааны мэдээлэл ачаалахад алдаа гарлаа. Сүлжээний холболтыг шалгана уу." 
        });
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [filterDay]);

  // Load user favorites from database
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const userFavorites = await getFavorites(user.id);
          setFavorites(userFavorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
          pushToast({ 
            title: "Алдаа", 
            text: "Хадгалсан үйл ажиллагаа ачаалахад алдаа гарлаа." 
          });
        }
      } else {
        // Clear favorites when user logs out
        setFavorites([]);
      }
    };

    loadFavorites();
  }, [user]);

  // Derived
  const favSet = useMemo(() => new Set(favorites), [favorites]);
  const eventsForDay = useMemo(() => schedule.filter((e) => dayOf(e.start) === filterDay), [filterDay]);

  const filtered = useMemo(() => {
    return eventsForDay.filter((e) =>
      (filterTrack === "all" || e.track === filterTrack) &&
      (query.trim() === "" || e.title.toLowerCase().includes(query.toLowerCase()))
    );
  }, [eventsForDay, filterTrack, query]);

  // Notification scheduling while app is open
  useEffect(() => {
    if (!notifyOnFavs) return;
    const timers = [];
    for (const e of schedule) {
      if (!favSet.has(e.id)) continue;
      const start = new Date(e.start).getTime();
      const now = Date.now();
      const leadMs = 5 * 60 * 1000; // 5 minutes before
      const fireAt = start - leadMs;
      if (fireAt > now) {
        const timeout = fireAt - now;
        const t = setTimeout(() => {
          notify({
            title: `Удахгүй эхэллээ: ${e.title}`,
            body: `${formatTimeRange(e.start, e.end)} @ ${e.venue}`,
          });
          pushToast({ title: "Сануулга", text: `${e.title} 5 минутын дараа эхэлнэ.` });
        }, timeout);
        timers.push(t);
      }
    }
    return () => timers.forEach(clearTimeout);
  }, [favorites, notifyOnFavs]);

  async function toggleFav(id) {
    if (!user) {
      pushToast({ title: "Нэвтрэх шаардлагатай", text: "Үйл ажиллагааг хадгалахын тулд нэвтрэх хэрэгтэй." });
      return;
    }

    try {
      const isFavorite = favorites.includes(id);
      await toggleFavorite(user.id, id, !isFavorite);
      setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      
      if (isFavorite) {
        pushToast({ title: "Амжилттай", text: "Үйл ажиллагааг хадгалсан үйл ажиллагаанаас хасав." });
      } else {
        pushToast({ title: "Амжилттай", text: "Үйл ажиллагааг хадгаллаа." });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      let errorMessage = 'Тодорхойгүй алдаа';
      
      if (error.message.includes('invalid input syntax for type uuid')) {
        errorMessage = 'Үйл ажиллагааны ID буруу байна. Админд хандана уу.';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'Энэ үйл ажиллагаа аль хэдийн хадгалагдсан байна.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      pushToast({ 
        title: "Алдаа", 
        text: `Үйл ажиллагааг хадгалахад алдаа гарлаа: ${errorMessage}` 
      });
    }
  }

  function pushToast(t) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }

  function addToCalendar(event) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MSYOC 2025//Event//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@msyoc2025.com`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.venue || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    link.click();
    
    pushToast({ title: "Амжилттай", text: "Үйл ажиллагаа календарт нэмэгдлээ." });
  }

  async function scheduleNotification(event) {
    if (!('Notification' in window)) {
      pushToast({ title: "Алдаа", text: "Энэ хөтөч мэдэгдэл дэмжихгүй байна." });
      return;
    }

    if (Notification.permission === 'denied') {
      pushToast({ title: "Алдаа", text: "Мэдэгдлийн зөвшөөрөл татсан байна. Тохиргоонд орж идэвхжүүлнэ үү." });
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        pushToast({ title: "Алдаа", text: "Мэдэгдлийн зөвшөөрөл авах боломжгүй." });
        return;
      }
    }

    const eventTime = new Date(event.start);
    const notificationTime = new Date(eventTime.getTime() - 5 * 60 * 1000); // 5 minutes before
    const now = new Date();

    if (notificationTime <= now) {
      pushToast({ title: "Алдаа", text: "Үйл ажиллагаа эхлэхэд 5 минутаас бага үлдсэн байна." });
      return;
    }

    const timeoutId = setTimeout(() => {
      new Notification(event.title, {
        body: `${event.venue ? event.venue + ' - ' : ''}${event.description || ''}`,
        icon: '/favicon.ico',
        tag: event.id
      });
    }, notificationTime.getTime() - now.getTime());

    pushToast({ 
      title: "Амжилттай", 
      text: `${event.title} үйл ажиллагаанд 5 минутын өмнө мэдэгдэх болно.` 
    });
  }

  async function enableNotifications() {
    const perm = await requestNotifications();
    if (perm === "granted") {
      setNotifyOnFavs(true);
      pushToast({ title: "Мэдэгдлийн горим асаасан", text: "Хадгалсан үйл ажиллагааг 5 минутын өмнө мэдэгдэх болно." });
    } else if (perm === "denied") {
      setNotifyOnFavs(false);
      pushToast({ title: "Мэдэгдлийн тохиргоог унтраасан байна", text: "Та браузерын мэдэгдлийн тохиргоогоо асаагаарай." });
    }
  }

  const trackBadge = (id) => {
    const t = tracks.find((x) => x.id === id);
    if (!t) return null;
    return <Badge className={`${t.color} font-medium`}>{t.name}</Badge>;
  };

  const speakerById = (id) => speakers.find((s) => s.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsContent value="home">
            <PageBar isHome={true} onBack={() => setTab("home")} onProfile={() => setTab("profile")} onFav={() => setTab("favorites")} favorites={favSet} />
            <HomeView onNavigate={setTab} />
          </TabsContent>

          <TabsContent value="schedule">
            <PageBar isHome={false} onBack={() => setTab("home")} onProfile={() => setTab("profile")} onFav={() => setTab("favorites")} favorites={favSet} />
            <ScheduleView
              favorites={favSet}
              onToggleFav={toggleFav}
              filterDay={filterDay}
              setFilterDay={setFilterDay}
              filterTrack={filterTrack}
              setFilterTrack={setFilterTrack}
              query={query}
              setQuery={setQuery}
              trackBadge={trackBadge}
              onOpenSpeaker={setSpeakerOpen}
              schedule={schedule}
              addToCalendar={addToCalendar}
              scheduleNotification={scheduleNotification}
            />
          </TabsContent>

          <TabsContent value="panel">
            <PageBar isHome={false} onBack={() => setTab("home")} onProfile={() => setTab("profile")} onFav={() => setTab("favorites")} favorites={favSet} />
            <PanelView onOpenSpeaker={setSpeakerOpen} trackBadge={trackBadge} schedule={schedule} />
          </TabsContent>

          <TabsContent value="speakers">
            <PageBar isHome={false} onBack={() => setTab("home")} onProfile={() => setTab("profile")} onFav={() => setTab("favorites")} favorites={favSet} />
            <SpeakersView onOpen={(s) => setSpeakerOpen(s)} />
          </TabsContent>

          <TabsContent value="map">
            <PageBar isHome={false} onBack={() => setTab("home")} onProfile={() => setTab("profile")} onFav={() => setTab("favorites")} favorites={favSet} />
            <VenueMap onSelect={(zone) => pushToast({ title: zone.name, text: zone.desc })} />
          </TabsContent>

          <TabsContent value="info">
            <PageBar isHome={false} onBack={() => setTab("home")} onProfile={() => setTab("profile")} onFav={() => setTab("favorites")} favorites={favSet} />
            <InfoView />
          </TabsContent>

          <TabsContent value="profile">
            <PageBar isHome={false} onBack={() => setTab("home")} onProfile={() => setTab("profile")} onFav={() => setTab("favorites")} favorites={favSet} />
            <ProfileView profile={profile} setProfile={setProfile} notifyOnFavs={notifyOnFavs} setNotifyOnFavs={setNotifyOnFavs} onEnableNotifications={enableNotifications} user={user} favorites={favorites} />
          </TabsContent>

          <TabsContent value="favorites">
            <PageBar isHome={false} onBack={() => setTab("home")} onProfile={() => setTab("profile")} onFav={() => setTab("favorites")} favorites={favSet} />
            <FavoritesView favorites={favSet} onToggleFav={toggleFav} trackBadge={trackBadge} onOpenSpeaker={setSpeakerOpen} schedule={schedule} />
          </TabsContent>

        </Tabs>
      </main>

      <SpeakerDialog speakerId={speakerOpen} onOpenChange={setSpeakerOpen} />

      <ToastStack toasts={toasts} />

      <footer className="max-w-7xl mx-auto p-6 text-xs text-neutral-500 flex items-center justify-between">
        <span>© MSYOC 2025· Бүх эрх хуулиар хамгаалагдсан</span>
        <a className="underline" href="#" onClick={(e)=>{e.preventDefault(); window.scrollTo({top:0, behavior:"smooth"});}}>Дээшээ буцах</a>
      </footer>
    </div>
  );
}

// -------- Components --------
function PageBar({ isHome, onBack, onProfile, onFav, favorites }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isHome && (
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Буцах" className="mr-1">
              <ChevronLeft className="w-5 h-5"/>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <img 
              src="/src/assets/logo.jpg" 
              alt="MSYOC Logo" 
              className="w-9 h-9 rounded-2xl object-cover"
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold">MSYOC 2025</div>
              <div className="text-[10px] text-neutral-500">Mongolian Students’ Youth Overseas Conference</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-2xl" onClick={onFav} aria-label="Хадгалсан үйл ажиллагаанд нэмэх">
            <Heart className={`w-4 h-4 ${favorites.size ? "" : "opacity-60"}`} />
          </Button>
          <ProfileBadge profile={{}} onClick={onProfile} />
        </div>
      </div>
    </div>
  );
}

function FavoritesView({ favorites, onToggleFav, trackBadge, onOpenSpeaker, schedule }) {
  const favEvents = useMemo(() => schedule.filter(e => favorites.has(e.id)).sort((a,b)=> new Date(a.start)-new Date(b.start)), [favorites, schedule]);
  return (
    <div className="grid gap-3">
      {favEvents.length === 0 && (
        <div className="text-center text-neutral-500 py-16">Одоогоор хадгалсан үйл ажиллагаа байхгүй байна. Зүрхний дүрс дээр дарж үйл ажиллагааг хадгална уу.</div>
      )}
      {favEvents.map(e => (
        <Card key={e.id} className="rounded-2xl border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">{e.title} {trackBadge(e.track)}</h3>
                <div className="text-sm text-neutral-600 flex items-center gap-2 mt-1"><Clock className="w-4 h-4"/>{formatTimeRange(e.start, e.end)} • <MapPin className="w-4 h-4"/>{e.venue}</div>
              </div>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => onToggleFav(e.id)} aria-label="Хадгалсан үйл ажиллагаагаас хасах">
                <Heart className="w-4 h-4 fill-current" />
              </Button>
            </div>
            {e.speakers?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {e.speakers.map((sid) => {
                  const s = speakers.find((x) => x.id === sid);
                  return (
                    <button key={sid} onClick={() => onOpenSpeaker(sid)} className="text-sm inline-flex items-center gap-2 px-2 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200">
                      <AvatarMono label={s?.avatar || "SP"} />
                      <span className="font-medium">{s?.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HomeView({ onNavigate }) {
  const items = [
    { id: "schedule", label: "Хөтөлбөр", icon: Clock, desc: "Үйл ажиллагааны хуваарь" },
    { id: "speakers", label: "Илтгэгчид", icon: User, desc: "Зочин илтгэгчид" },
    { id: "map", label: "Газрын зураг", icon: MapPin, desc: "Marmaracik Genclik Kampi кемп амралтын газар" },
    { id: "info", label: "Чуулга уулзалтын тухай", icon: Info, desc: "Холбоо барих, кемпүүд" },
    { id: "panel", label: "Хэлэлцүүлгүүд", icon: Star, desc: "Хэлэлцүүлэг уулзалтууд" },
  ];
  return (
    <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
      {items.map(({ id, label, icon: Icon, desc }) => (
        <motion.button key={id} onClick={() => onNavigate(id)} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border shadow-sm active:shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 text-white grid place-items-center"><Icon className="w-5 h-5"/></div>
            <div className="text-left">
              <div className="text-base font-semibold">{label}</div>
              <div className="text-xs text-neutral-500">{desc}</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-neutral-400"/>
        </motion.button>
      ))}
    </div>
  );
}

function PanelView({ onOpenSpeaker, trackBadge, schedule }) {
  const panels = useMemo(() => schedule.filter(e => e.track === "conference"), [schedule]);
  return (
    <div className="grid gap-3 md:gap-4">
      {panels.map(e => (
        <Card key={e.id} className="rounded-2xl border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">{e.title} {trackBadge(e.track)}</h3>
                <div className="text-sm text-neutral-600 flex items-center gap-2 mt-1"><Clock className="w-4 h-4"/>{formatTimeRange(e.start, e.end)} • <MapPin className="w-4 h-4"/>{e.venue}</div>
              </div>
            </div>
            {e.speakers?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {e.speakers.map((sid) => {
                  const s = speakers.find((x) => x.id === sid);
                  return (
                    <button key={sid} onClick={() => onOpenSpeaker(sid)} className="text-sm inline-flex items-center gap-2 px-2 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200">
                      <AvatarMono label={s?.avatar || "SP"} />
                      <span className="font-medium">{s?.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
      {panels.length === 0 && (
        <div className="text-center text-neutral-500 py-16">
          <p>Хэлэлцүүлэг уулзалтууд олдсонгүй.</p>
          <p className="text-xs mt-2">Боломжтой ангилалууд: {[...new Set(schedule.map(e => e.track))].join(', ')}</p>
        </div>
      )}
    </div>
  );
}

function ScheduleView({ favorites, onToggleFav, filterDay, setFilterDay, filterTrack, setFilterTrack, query, setQuery, trackBadge, onOpenSpeaker, schedule, addToCalendar, scheduleNotification }) {
  const dayEvents = useMemo(() => schedule.filter((e) => dayOf(e.start) === filterDay), [filterDay, schedule]);
  const filtered = useMemo(() => dayEvents.filter((e) => (filterTrack === "all" || e.track === filterTrack) && (query === "" || e.title.toLowerCase().includes(query.toLowerCase()))), [dayEvents, filterTrack, query]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
        <div className="flex gap-2">
          {days.map((d) => (
            <Button key={d.id} variant={filterDay === d.id ? "default" : "outline"} onClick={() => setFilterDay(d.id)}>{d.label}</Button>
          ))}
        </div>
        <div className="md:ml-auto flex items-center gap-3">
          <Select value={filterTrack} onValueChange={setFilterTrack}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Ангилал"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ангилал</SelectItem>
              {tracks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Хайх" value={query} onChange={(e)=>setQuery(e.target.value)} className="w-48"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((e) => (
          <Card key={e.id} className="rounded-2xl shadow-sm border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">{e.title} {trackBadge(e.track)}</h3>
                  <div className="text-sm text-neutral-600 flex items-center gap-2 mt-1"><Clock className="w-4 h-4"/>{formatTimeRange(e.start, e.end)} • <MapPin className="w-4 h-4"/>{e.venue}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant={favorites.has(e.id) ? "default" : "outline"} size="icon" className="rounded-full" onClick={() => onToggleFav(e.id)} aria-label="Toggle favorite">
                    <Heart className={`w-4 h-4 ${favorites.has(e.id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>

              {e.speakers?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {e.speakers.map((sid) => {
                    const s = speakers.find((x) => x.id === sid);
                    return (
                      <button key={sid} onClick={() => onOpenSpeaker(sid)} className="text-sm inline-flex items-center gap-2 px-2 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200">
                        <AvatarMono label={s?.avatar || "SP"} />
                        <span className="font-medium">{s?.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <p className="mt-3 text-sm text-neutral-700">{e.description}</p>

              <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" className="gap-2" onClick={() => addToCalendar(e)}><CalendarPlus className="w-4 h-4"/>Календарт нэмэх (ICS)</Button>
                <Button variant="ghost" className="gap-2" onClick={() => scheduleNotification(e)}><Bell className="w-4 h-4"/>5 минутын өмнө мэдэгдэх</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-neutral-500 py-16">
          {schedule.length === 0 ? (
            <div>
              <p className="text-lg font-medium mb-2">Үйл ажиллагаа олдсонгүй</p>
              <p className="text-sm mb-4">Өгөгдлийн санд үйл ажиллагаа нэмэгдээгүй байна.</p>
            </div>
          ) : (
            "Хайлт олдсонгүй."
          )}
        </div>
      )}
    </div>
  );
}

function SpeakersView({ onOpen }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {speakers.map((s) => (
        <Card key={s.id} className="rounded-2xl border-neutral-200 hover:shadow-sm h-80 flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-3">
              <AvatarMono size="lg" label={s.avatar} />
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-neutral-600">{s.title}</div>
              </div>
            </div>
            <p className="text-sm text-neutral-700 mt-3 line-clamp-3 flex-grow whitespace-pre-line">{s.bio}</p>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" onClick={() => onOpen(s.id)} className="gap-2"><Info className="w-4 h-4"/>Дэлгэрэнгүй</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function VenueMap({ onSelect }) {

  const zones = [
    {
      id: "1",
      name: "Zone 1",
      shape: "rect",
      coords: [
        "48.44%", // x1 = 654 / 1350 * 100
        "34.17%", // y1 = 369 / 1080 * 100
        "54.30%", // x2 = 733 / 1350 * 100
        "39.44%", // y2 = 426 / 1080 * 100
      ],
    },
    {
      id: "2",
      name: "Zone 2",
      shape: "poly",
      coords: [
        "48.74%", "66.67%", // (658,720)
        "44.15%", "65.00%", // (596,702)
        "45.26%", "59.72%", // (611,645)
        "49.85%", "61.48%", // (673,664)
      ],
    },
    {
      id: "3",
      name: "Zone 3",
      shape: "poly",
      coords: [
        "22.37%", "73.98%", // (302,799)
        "24.22%", "67.59%", // (327,730)
        "29.70%", "69.72%", // (401,753)
        "28.00%", "76.11%", // (378,822)
      ],
    },
    {
      id: "4",
      name: "Zone 4",
      shape: "poly",
      coords: [
        "3.04%", "99.54%",   // (41,1075)
        "9.56%", "97.59%",   // (129,1054)
        "11.48%", "106.57%", // (155,1151)
        "4.81%", "108.43%",  // (65,1171)
      ],
    },
    {
      id: "5",
      name: "Zone 5",
      shape: "poly",
      coords: [
        "11.04%", "101.85%", // (149,1100)
        "20.44%", "98.43%",  // (276,1063)
        "21.70%", "104.26%", // (293,1126)
        "12.22%", "107.59%", // (165,1162)
        "11.56%", "104.26%", // (156,1126)
      ],
    },
    {
      id: "6",
      name: "Zone 6",
      shape: "poly",
      coords: [
        "47.26%", "96.94%", // (638,1047)
        "52.89%", "96.76%", // (714,1045)
        "53.11%", "99.72%", // (717,1077)
        "47.33%", "100.09%", // (639,1081)
      ],
    },
  ];
  
  const polygonFromZone = (z) => {
    if (z.shape === "rect") {
      const [x1, y1, x2, y2] = z.coords; // all are strings like "48.44%"
      return `polygon(${x1} ${y1}, ${x2} ${y1}, ${x2} ${y2}, ${x1} ${y2})`;
    }
    // poly: pair coords into "x y"
    const pairs = [];
    for (let i = 0; i < z.coords.length; i += 2) {
      const x = z.coords[i];
      const y = z.coords[i + 1];
      pairs.push(`${x} ${y}`); // do NOT add another % here
    }
    return `polygon(${pairs.join(", ")})`;
  };
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Газрын зураг
        </h2>
        <span className="text-sm text-neutral-500">
          Та тухайн байшин дээр дарж дэлгэрэнгүй мэдээлэл авах боломжтой
        </span>
      </div>

      <div className="relative border rounded-2xl bg-white overflow-hidden">
        <img
          src="/map/msyoc_map_marmarcik.png"
          alt="Venue map"
          className="w-full h-auto pointer-events-none" // let clicks go through
        />

        {zones.map((z) => {
          const poly = polygonFromZone(z);
          return (
            <button
              type="button"
              key={z.id}
              aria-label={z.name}
              onClick={() => onSelect?.(z)}
              className="absolute bg-transparent cursor-pointer"
              style={{
                // Make the button cover the whole image; clip-path defines the clickable area
                inset: 0,
                zIndex: 10,
                clipPath: poly,
                WebkitClipPath: poly, // Safari
                // Optional hit-area glow when hovering:
                // outline: "2px solid transparent",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}


function InfoView() {
  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <h2 className="font-semibold text-lg">MSYOC 2025 чуулга уулзалтын тухай</h2>
          <p className="text-sm text-neutral-700 mt-2">Дэлхийн өнцөг булан бүрт суралцаж буй монгол оюутан, залуус нэгэн дор цуглаж, мэдлэг, туршлагаа солилцож, мэргэжлийн болон нөхөрсөг хамт олонтой болж, шинэлэг санаа, бүтээлээ танилцуулж, эх оронч үнэт зүйлсээ бататгах түүхэн мөч.
Энэ бол зөвхөн уулзалт бус — дэлхийд өрсөлдөх чадвартай монгол залуусын хамтын ирээдүйг бүтээх түүхэн боломж юм.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <h3 className="font-semibold">Холбоо барих</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <a className="inline-flex items-center gap-2 underline" href="mailto:hello@msyoc.mn"><Mail className="w-4 h-4"/>info@msyoc.mn</a>
              <a className="inline-flex items-center gap-2 underline" href="tel:+31201234567"><Phone className="w-4 h-4"/>+90</a>
              <a className="inline-flex items-center gap-2 underline" href="https://www.instagram.com/msyoc.istanbul2025/" target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4"/>Instagram</a>
              <a className="inline-flex items-center gap-2 underline" href="https://www.facebook.com/MSOConference" target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4"/>Facebook</a>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <h3 className="font-semibold">Үйл ажиллагаа зохион байгуулагдах газар</h3>
            <p className="text-sm text-neutral-700 mt-2">Бүгд Найрамдах Турк улс, Истанбул хот,
            Marmaracik Genclik Kampi кемп амралтын газар</p>
            <div className="mt-3">
              <a className="underline inline-flex items-center gap-2" href="https://www.google.com/maps?ll=41.243383,29.089828&z=17&t=m&hl=en-GB&gl=US&mapclient=embed&cid=9241541442462148159" target="_blank" rel="noreferrer"><MapPin className="w-4 h-4"/>Google Maps дээр нээх</a>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}

function ProfileView({ profile, setProfile, notifyOnFavs, setNotifyOnFavs, onEnableNotifications, user, favorites }) {
  const [draft, setDraft] = useState(profile);
  const [signedIn, setSignedIn] = useState(!!user?.email);
  
  useEffect(() => { 
    setDraft(profile); 
    setSignedIn(!!user?.email); 
  }, [profile, user]);

  return (
    <div className="max-w-xl grid gap-4">
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarMono size="lg" label={initials(user?.user_metadata?.full_name || user?.email || "Зочин")} />
              <div>
                <div className="font-semibold">{signedIn ? (user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Guest") : "Зочин"}</div>
                <div className="text-sm text-neutral-600">{signedIn ? user?.email : "Нэвтрээгүй байна"}</div>
              </div>
            </div>
            {signedIn ? (
              <Button variant="outline" className="gap-2" onClick={() => supabase.auth.signOut()}><LogOut className="w-4 h-4"/>Гарах</Button>
            ) : null}
          </div>

          {signedIn && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600">
                <p className="font-medium mb-2">Таны мэдээлэл:</p>
                <p>• Нэвтрэх: {user?.email}</p>
                <p>• Хадгалсан үйл ажиллагаа: {favorites.length} ширхэг</p>
                <p>• Мэдэгдэл: {notifyOnFavs ? 'Идэвхжүүлсэн' : 'Унтраасан'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <h3 className="font-semibold">Мэдэгдэл</h3>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Хадгалсан үйл ажиллагааг 5 минутын өмнө мэдэгдэх</div>
              <div className="text-xs text-neutral-500">Таны браузерын мэдэгдлийн API-г тухайн апп нээлттэй үед ашиглах болно.</div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={notifyOnFavs} onCheckedChange={(v)=> setNotifyOnFavs(v)} />
              {!notifyOnFavs && (
                <Button variant="outline" size="sm" onClick={onEnableNotifications} className="gap-2"><Bell className="w-4 h-4"/>Идэвхжүүлэх</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <h3 className="font-semibold">Давуу талууд</h3>
          <ul className="mt-3 text-sm list-disc pl-5 text-neutral-700">
            <li>⭐ Үйл ажиллагааг хадгалах, үйл ажиллагааг өөрийн хуваарьт тохируулах</li>
            <li>🔔 Хадгалсан үйл ажиллагааг эхлэхээс 5 минутын өмнө мэдэгдэл хүлээн авах</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function SpeakerDialog({ speakerId, onOpenChange }) {
  const speaker = speakerId ? speakers.find((s) => s.id === speakerId) : null;
  return (
    <Dialog open={!!speakerId} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><AvatarMono label={speaker?.avatar || "SP"} /><span>{speaker?.name}</span></DialogTitle>
        </DialogHeader>
        <div className="text-sm text-neutral-700">{speaker?.title}</div>
        <Separator className="my-3"/>
        <p className="text-sm text-neutral-800 whitespace-pre-line">{speaker?.bio}</p>
      </DialogContent>
    </Dialog>
  );
}

function AvatarMono({ label = "MN", size = "md" }) {
  const sizes = { md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={`rounded-2xl bg-neutral-900/90 text-white grid place-items-center ${sizes[size]} font-semibold flex-shrink-0`}>{label}</div>
  );
}

function ProfileBadge({ profile, onClick }) {
  return (
    <button onClick={onClick} className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200">
      <Star className="w-4 h-4"/>
      <span className="hidden sm:inline text-sm">{profile?.name ? profile.name.split(" ")[0] : "Профайл"}</span>
    </button>
  );
}

function initials(name) {
  return name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 grid gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="rounded-2xl bg-neutral-900 text-white px-4 py-3 shadow-lg">
            <div className="text-sm font-semibold">{t.title}</div>
            <div className="text-xs text-white/80">{t.text}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
