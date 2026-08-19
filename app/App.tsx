import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Global styles ─────────────────────────────────────────────────────── */
const G = `
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Manrope', sans-serif; background: #0c0c12; color: #eeeef5; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.35); border-radius: 99px; }
  input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; background: rgba(255,255,255,0.12); border-radius: 99px; outline: none; cursor: pointer; width: 100%; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #7c3aed; border: 2px solid #a78bfa; box-shadow: 0 0 10px rgba(124,58,237,0.6); cursor: pointer; }
  input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #7c3aed; border: 2px solid #a78bfa; cursor: pointer; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-dot { 0%,80%,100% { opacity:.2; transform:scale(0.8); } 40% { opacity:1; transform:scale(1); } }
  @keyframes glow-pulse { 0%,100% { opacity:.5; } 50% { opacity:1; } }
  @keyframes spin-slow { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  .dot-bounce span { display:inline-block; width:6px; height:6px; border-radius:50%; background:#a78bfa; animation: pulse-dot 1.2s ease-in-out infinite; }
  .dot-bounce span:nth-child(2) { animation-delay:.2s; }
  .dot-bounce span:nth-child(3) { animation-delay:.4s; }
  .mono { font-family: 'DM Mono', monospace; }
  .card-hover { transition: border-color .2s, background .2s, transform .2s, box-shadow .2s; }
  .card-hover:hover { border-color: rgba(124,58,237,0.45) !important; background: #17172200 !important; transform: translateY(-1px); box-shadow: 0 8px 40px rgba(124,58,237,0.12); }
  .btn-primary { background: #7c3aed; color: #fff; border: none; border-radius: 6px; padding: 8px 18px; font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: background .15s, box-shadow .15s; }
  .btn-primary:hover { background: #6d28d9; box-shadow: 0 0 18px rgba(124,58,237,0.5); }
  .btn-ghost { background: transparent; color: #8888a2; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 14px; font-family: 'Manrope', sans-serif; font-weight: 500; font-size: 12px; cursor: pointer; transition: border-color .15s, color .15s, background .15s; }
  .btn-ghost:hover { border-color: rgba(124,58,237,0.4); color: #eeeef5; background: rgba(124,58,237,0.08); }
  .btn-ghost.active { border-color: #7c3aed; color: #a78bfa; background: rgba(124,58,237,0.15); }
  .tag { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:600; }
  .tag-green { background: rgba(16,185,129,.15); color: #34d399; }
  .tag-purple { background: rgba(124,58,237,.2); color: #a78bfa; }
  .tag-amber { background: rgba(245,158,11,.15); color: #fbbf24; }
  .tag-blue { background: rgba(59,130,246,.15); color: #60a5fa; }
  .tag-red { background: rgba(239,68,68,.15); color: #f87171; }
  .tag-pink { background: rgba(236,72,153,.15); color: #f472b6; }
  .ai-panel { position: fixed; right: 0; top: 0; height: 100vh; width: 400px; background: #0f0f18; border-left: 1px solid rgba(124,58,237,0.2); z-index: 60; display: flex; flex-direction: column; transform: translateX(100%); transition: transform .3s cubic-bezier(.16,1,.3,1); box-shadow: -8px 0 40px rgba(124,58,237,0.1); }
  .ai-panel.open { transform: translateX(0); }
  .ai-msg-user { background: rgba(124,58,237,0.18); border: 1px solid rgba(124,58,237,0.3); border-radius: 12px 12px 2px 12px; }
  .ai-msg-bot { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 2px 12px 12px 12px; }
  .filter-chip { padding: 6px 14px; border-radius: 99px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #8888a2; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; white-space:nowrap; }
  .filter-chip:hover { border-color: rgba(124,58,237,0.4); color: #c4b5fd; background: rgba(124,58,237,0.08); }
  .filter-chip.active { border-color: #7c3aed; color: #a78bfa; background: rgba(124,58,237,0.18); }
  @media (max-width: 768px) { .ai-panel { width: 100vw; } }
`;

/* ─── Data ──────────────────────────────────────────────────────────────── */
interface Offer {
  id: number; developer: string; project: string;
  price: number; price_with_renovation: number; price_with_program: number; benefit: number;
  min_down: number; term_months: number; interest_rate: number;
  is_interest_free: boolean; payment_type: "fixed" | "monthly" | "quarterly" | "deferred";
  has_key_early: boolean; is_for_pregnant: boolean; is_for_families: boolean;
  can_switch_mortgage: boolean; region: string; metro: string;
  description: string; discount: string | null;
}

const OFFERS: Offer[] = [
  { id:1, developer:"ГК ФСК", project:"Amber City", price:35000000, price_with_renovation:37500000, price_with_program:33250000, benefit:4250000, min_down:20, term_months:9, interest_rate:0, is_interest_free:true, payment_type:"fixed", has_key_early:false, is_for_pregnant:true, is_for_families:false, can_switch_mortgage:true, region:"Кунцево", metro:"Кунцевская", description:"Беспроцентная рассрочка для беременных с ПВ 20%", discount:null },
  { id:2, developer:"ГК ФСК", project:"Sydney City", price:32000000, price_with_renovation:34000000, price_with_program:30400000, benefit:3600000, min_down:20, term_months:2, interest_rate:0, is_interest_free:true, payment_type:"fixed", has_key_early:false, is_for_pregnant:false, is_for_families:true, can_switch_mortgage:true, region:"Кунцево", metro:"Кунцевская", description:"Рассрочка для семей с переходом на семейную ипотеку", discount:null },
  { id:3, developer:"ПИОНЕР", project:"ПРАЙД", price:28000000, price_with_renovation:29500000, price_with_program:28000000, benefit:1500000, min_down:80, term_months:24, interest_rate:0, is_interest_free:true, payment_type:"monthly", has_key_early:false, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Южнопортовый", metro:"Волгоградский пр-т", description:"Рассрочка с ежемесячными платежами до 12.2026", discount:null },
  { id:4, developer:"Sminex", project:"Foriver", price:42000000, price_with_renovation:44500000, price_with_program:42000000, benefit:2500000, min_down:30, term_months:9, interest_rate:0, is_interest_free:true, payment_type:"monthly", has_key_early:true, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Нагатино-Садовники", metro:"Технопарк", description:"Беспроцентная рассрочка — ключи до полной оплаты", discount:null },
  { id:5, developer:"Level Group", project:"Левел Южнопортовая", price:18000000, price_with_renovation:26500000, price_with_program:18000000, benefit:8500000, min_down:30, term_months:12, interest_rate:14, is_interest_free:false, payment_type:"monthly", has_key_early:false, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Южнопортовый", metro:"Волгоградский пр-т", description:"Скидка 32% + рассрочка 14% годовых", discount:"Скидка 32%" },
  { id:6, developer:"MR Group", project:"Слава 2 очередь", price:38000000, price_with_renovation:40000000, price_with_program:38000000, benefit:2000000, min_down:40, term_months:24, interest_rate:0, is_interest_free:true, payment_type:"fixed", has_key_early:false, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Басманный", metro:"Бауманская", description:"Беспроцентная рассрочка до апреля 2027", discount:null },
  { id:7, developer:"ЛСР", project:"ЗилАрт Спарк", price:24000000, price_with_renovation:25300000, price_with_program:22800000, benefit:2500000, min_down:30, term_months:36, interest_rate:0, is_interest_free:true, payment_type:"fixed", has_key_early:false, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Даниловский", metro:"Технопарк, Тульская", description:"Скидка 5% по схеме «5 раз по 20%»", discount:"Скидка 5%" },
  { id:8, developer:"ГК Основа", project:"Мираполис", price:22000000, price_with_renovation:23000000, price_with_program:22000000, benefit:1000000, min_down:50, term_months:36, interest_rate:0, is_interest_free:true, payment_type:"fixed", has_key_early:false, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Митино", metro:"Пятницкое шоссе", description:"Беспроцентная траншевая рассрочка до 12.2027", discount:null },
  { id:9, developer:"Страна Девелопмент", project:"АУРУС Резиденции", price:25000000, price_with_renovation:27000000, price_with_program:25000000, benefit:2000000, min_down:30, term_months:60, interest_rate:0, is_interest_free:true, payment_type:"quarterly", has_key_early:false, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Хамовники", metro:"Спортивная", description:"0% рассрочка на 5 лет — уникальное предложение рынка", discount:null },
  { id:10, developer:"ГК Самолёт", project:"Все проекты", price:15000000, price_with_renovation:16500000, price_with_program:15000000, benefit:1500000, min_down:20, term_months:36, interest_rate:0, is_interest_free:true, payment_type:"deferred", has_key_early:true, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:true, region:"Разные районы", metro:"Различные", description:"Рассрочка до РВЭ — ключи до окончательной оплаты", discount:null },
  { id:11, developer:"ГК Эталон", project:"Шагал (все очереди)", price:19000000, price_with_renovation:20500000, price_with_program:19000000, benefit:1500000, min_down:10, term_months:36, interest_rate:0, is_interest_free:true, payment_type:"fixed", has_key_early:false, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Даниловский", metro:"Тульская, Автозаводская", description:"Фиксированные платежи, минимальный ПВ всего 10%", discount:null },
  { id:12, developer:"Stone RETAIL", project:"Stone RETAIL", price:30000000, price_with_renovation:32000000, price_with_program:30000000, benefit:2000000, min_down:30, term_months:24, interest_rate:0, is_interest_free:true, payment_type:"deferred", has_key_early:false, is_for_pregnant:false, is_for_families:false, can_switch_mortgage:false, region:"Центр", metro:"Центральные", description:"Беспроцентная рассрочка для коммерческой недвижимости", discount:null },
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmt = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1).replace(/\.0$/,"")+" млн ₽" : n.toLocaleString("ru-RU")+" ₽";
const fmtFull = (n: number) => n.toLocaleString("ru-RU")+" ₽";
const PT_LABEL: Record<string,string> = { fixed:"Фикс.", monthly:"Ежем.", quarterly:"Ежекв.", deferred:"Отлож." };
const PT_FULL: Record<string,string> = { fixed:"Фиксированный", monthly:"Ежемесячный", quarterly:"Ежеквартальный", deferred:"Отложенный" };

/* ─── AI Agent ──────────────────────────────────────────────────────────── */
interface AIMsg { id: number; role: "user"|"bot"; text: string; chips?: string[]; filterApplied?: string; }

type Group = "family"|"investor"|"individual";
interface FilterState { group: Group|null; types: string[]; specials: string[]; pvMax: number; termMax: number; }

function buildAIResponse(
  text: string,
  filters: FilterState,
  budget: number,
  visible: Offer[]
): { text: string; chips: string[]; newFilters?: Partial<FilterState> } {
  const t = text.toLowerCase();
  const freeCount = OFFERS.filter(o => o.is_interest_free).length;
  const keyCount  = OFFERS.filter(o => o.has_key_early).length;

  if (/^(привет|здравств|добрый|хай|hi|hello)/i.test(t.trim())) {
    return {
      text: `Привет! Я АРГО — AI-помощник РассрочкаПортала. Помогу найти лучшую рассрочку в Москве.\n\nСейчас в базе **${OFFERS.length} ЖК** с программами от 12+ застройщиков. Что вас интересует?`,
      chips: ["Хочу 0% рассрочку","Для семьи с детьми","Инвестиционная покупка","Объясни, что такое рассрочка"],
    };
  }
  if (/0%|беспроцент|нулев/.test(t)) {
    return {
      text: `Нашёл **${freeCount} предложений с 0% ставкой**. Выделю лучшие:\n\n• **АУРУС Резиденции** — 0% на целых 5 лет, Хамовники\n• **Foriver (Sminex)** — 0% + ключи до оплаты, Технопарк\n• **ЗилАрт Спарк** — 0% + скидка 5%, Даниловский\n\nПрименить фильтр «только 0%»?`,
      chips: ["Да, применить фильтр","Расскажи про АУРУС","Что значит 0% рассрочка?","Сравнить с ипотекой"],
      newFilters: { types: ["interest_free"] },
    };
  }
  if (/ключи до|ключи сейчас|въехать сразу/.test(t)) {
    return {
      text: `С **ключами до оплаты** — ${keyCount} предложения:\n\n• **Foriver** — заезжаете сразу при ПВ 30%\n• **ГК Самолёт** — ключи до РВЭ, ПВ от 20%\n\nЭто редкая схема: вы живёте в квартире, пока продолжаете платить рассрочку.`,
      chips: ["Применить фильтр «Ключи»","Чем отличается от аренды?","Показать все предложения"],
      newFilters: { types: ["key_early"] },
    };
  }
  if (/семья|детей|дети|ребёнок|беременн|маткапитал|матерински/.test(t)) {
    return {
      text: `Для семей с детьми и беременных есть особые программы:\n\n• **Amber City (ФСК)** — спецпрограмма для беременных, 0% на 9 мес\n• **Sydney City (ФСК)** — для семей + переход на семейную ипотеку под 6%\n\nСемейная ипотека после рассрочки — мощная комбинация: фиксируете цену сейчас, рефинансируете позже.`,
      chips: ["Показать семейные программы","Как работает переход на ипотеку?","Маткапитал как первый взнос?"],
      newFilters: { group: "family", specials: ["is_for_families"] },
    };
  }
  if (/инвест|доходн|roi|окупа|студи|сдава/.test(t)) {
    return {
      text: `Для инвестора приоритет — максимальная скидка и минимальный ПВ:\n\n• **Левел Южнопортовая** — скидка **32%** к рынку, ПВ 30%\n• **ЗилАрт Спарк** — скидка 5% + схема «5×20»\n• **ГК Самолёт** — ключи до оплаты, можно сдавать сразу\n\nПри бюджете ${budget} млн ₽ у вас есть реальный выбор.`,
      chips: ["Показать инвест-предложения","Посчитать ROI","Какой район ликвиднее?"],
      newFilters: { group: "investor" },
    };
  }
  if (/ипотека|сравн.*ипотек|ипотек.*сравн/.test(t)) {
    const loanEx = 20_000_000;
    const rate = 19;
    const mIpoteka = Math.round(loanEx*(rate/100/12)/(1-Math.pow(1+rate/100/12,-360)));
    const mRassrochka = Math.round(loanEx/36);
    return {
      text: `**Рассрочка vs Ипотека** (пример: кредит 20 млн):\n\n**Ипотека 19%, 30 лет:**\nПлатёж: ${fmt(mIpoteka)}/мес\nПереплата: ~${fmt(mIpoteka*360 - loanEx)}\n\n**Рассрочка 0%, 36 мес:**\nПлатёж: ${fmt(mRassrochka)}/мес\nПереплата: **0 ₽**\n\nВывод: рассрочка выгоднее финансово, но требует высокого ежемесячного платежа.`,
      chips: ["Рассчитать под мой бюджет","Показать все 0% предложения","Как выбрать срок?"],
    };
  }
  if (/что так|как работ|объясни|что значит рассрочк/.test(t)) {
    return {
      text: `**Рассрочка от застройщика** — способ купить квартиру без банка:\n\n1. Вы вносите **ПВ** (от 10% до 80% цены)\n2. Остаток делится на ежемесячные платежи\n3. Ставка: 0% или до 14% — зависит от программы\n4. Срок: от 2 до 60 месяцев\n\nГлавное преимущество — **нет одобрения банка**, быстро, без справок.`,
      chips: ["Какой ПВ мне нужен?","Что будет если не платить?","Показать 0% предложения"],
    };
  }
  if (/как выбрать|с чего начать|помог|посовет|не знаю/.test(t)) {
    return {
      text: `Алгоритм выбора рассрочки:\n\n1. **Определите бюджет** — ПВ + ежемесячный платёж\n2. **Выберите цель**: жить, сдавать, перепродать\n3. **Срок**: если есть деньги — берите короткую 0%, если нет — ищите длинную\n4. **Проверьте застройщика** в реестре ДОМ.РФ\n\nХотите — подберу под ваш бюджет ${budget} млн ₽?`,
      chips: [`Подбери под ${budget} млн ₽`,"Только надёжные застройщики","Показать все предложения"],
    };
  }
  if (/подбер|под.*млн|под.*бюджет/.test(t)) {
    const max = budget * 1e6 * 0.85;
    const suitable = OFFERS.filter(o => o.price <= max);
    return {
      text: `При бюджете **${budget} млн ₽** (ПВ ~15–20%) доступны квартиры до **${fmt(max)}**.\n\nПодходящих предложений: **${suitable.length} ЖК**. Лучшие варианты:\n${suitable.slice(0,3).map(o=>`• ${o.project} — ${fmt(o.price_with_program)}`).join("\n")}`,
      chips: ["Показать все подходящие","Уточнить по типу","Хочу ещё дешевле"],
    };
  }
  if (/аурус/.test(t)) {
    const o = OFFERS.find(x=>x.id===9)!;
    return {
      text: `**${o.project}** (${o.developer})\n\n📍 ${o.region} · 🚇 ${o.metro}\n💰 ${fmtFull(o.price)}\n📅 ${o.term_months} мес, ${o.interest_rate}% годовых\n🏦 ПВ от ${o.min_down}%\nПлатёж: ~${fmt(Math.round(o.price*(1-o.min_down/100)/o.term_months))}/мес\n\n${o.description}`,
      chips: ["Добавить в сравнение","Как связаться?","Показать похожие"],
    };
  }
  if (/foriver|форивер/.test(t)) {
    const o = OFFERS.find(x=>x.id===4)!;
    return {
      text: `**${o.project}** (${o.developer})\n\n📍 ${o.region} · 🚇 ${o.metro}\n💰 ${fmtFull(o.price)}\n📅 ${o.term_months} мес, ${o.interest_rate}% годовых\n🔑 Ключи до полной оплаты!\nПлатёж: ~${fmt(Math.round(o.price*(1-o.min_down/100)/o.term_months))}/мес`,
      chips: ["Добавить в сравнение","Как связаться?","Показать похожие"],
    };
  }
  if (/да.*фильтр|применить|применит/.test(t) && filters.types.includes("interest_free")) {
    return {
      text: `Фильтр «0% рассрочка» применён — сейчас показано **${visible.length} предложений**. Хотите уточнить ещё что-нибудь?`,
      chips: ["Добавить фильтр «Ключи»","Отсортировать по цене","Сравнить лучшие 3"],
    };
  }
  if (/скидк|дешевл|выгодн/.test(t)) {
    const top = [...OFFERS].sort((a,b)=>b.benefit-a.benefit).slice(0,3);
    return {
      text: `Максимальная выгода по программам:\n\n${top.map((o,i)=>`${i+1}. **${o.project}** — экономия ${fmt(o.benefit)}`).join("\n")}\n\nОсобняком — **Левел Южнопортовая**: скидка 32% к рыночной цене.`,
      chips: ["Показать топ по выгоде","Что включает выгода?","Сравнить"],
    };
  }

  // fallback
  return {
    text: `Я понял ваш запрос, но давайте уточним. Чем могу помочь конкретнее?\n\nВ базе сейчас **${visible.length} предложений** по вашим параметрам.`,
    chips: ["0% рассрочки","Ключи до оплаты","Для семьи","Сравнение с ипотекой","Топ по выгоде"],
  };
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 px-5 py-3 rounded-xl border ${accent ? "border-purple-500/30 bg-purple-500/10" : "border-white/6 bg-white/3"}`}>
      <span className="mono text-sm font-medium" style={{ color: accent ? "#a78bfa" : "#eeeef5" }}>{value}</span>
      <span className="text-xs" style={{ color:"#8888a2" }}>{label}</span>
    </div>
  );
}

function BadgeTags({ offer }: { offer: Offer }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {offer.is_interest_free && <span className="tag tag-green">0%</span>}
      {offer.has_key_early && <span className="tag tag-blue">🔑 Ключи</span>}
      {offer.is_for_pregnant && <span className="tag tag-pink">🤰 Беременным</span>}
      {offer.is_for_families && <span className="tag tag-amber">👨‍👩‍👧 Семейная</span>}
      {offer.payment_type === "deferred" && <span className="tag tag-purple">⏸ Отложенный</span>}
      {offer.discount && <span className="tag tag-red">🔥 {offer.discount}</span>}
      {offer.term_months >= 60 && <span className="tag tag-amber">⭐ 5 лет</span>}
      {offer.can_switch_mortgage && <span className="tag tag-blue">🔄 → Ипотека</span>}
    </div>
  );
}

function OfferCard({
  offer, isCompare, isFav,
  onCompare, onFav, onDetail,
}: {
  offer: Offer; isCompare: boolean; isFav: boolean;
  onCompare: (id: number) => void; onFav: (id: number) => void; onDetail: (id: number) => void;
}) {
  const monthly = Math.round(offer.price * (1 - offer.min_down / 100) / offer.term_months);

  return (
    <div
      className="card-hover rounded-2xl overflow-hidden fade-up"
      style={{ background:"#13131c", border:"1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Top bar */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="mono text-xs" style={{ color:"#8888a2" }}>{offer.developer}</span>
            {offer.discount && <span className="tag tag-red text-[10px]">🔥 {offer.discount}</span>}
          </div>
          <h3 className="text-lg font-bold truncate" style={{ color:"#eeeef5" }}>{offer.project}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color:"#8888a2" }}>
            <span>📍 {offer.region}</span>
            <span>🚇 {offer.metro.split(",")[0]}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <button
            onClick={() => onFav(offer.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: isFav ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isFav ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`, color: isFav ? "#f472b6" : "#8888a2" }}
            title="В избранное"
          >♥</button>
          <button
            onClick={() => onCompare(offer.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs font-bold"
            style={{ background: isCompare ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border:`1px solid ${isCompare ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`, color: isCompare ? "#a78bfa" : "#8888a2" }}
            title="Сравнить"
          >≡</button>
        </div>
      </div>

      {/* Tags */}
      <div className="px-5 py-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <BadgeTags offer={offer} />
        <p className="text-xs mt-2 leading-relaxed" style={{ color:"#8888a2" }}>{offer.description}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 px-5 py-3 gap-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        {[
          { label:"ПВ", val:`${offer.min_down}%` },
          { label:"Срок", val:`${offer.term_months} мес` },
          { label:"Ставка", val:`${offer.interest_rate}%`, green: offer.interest_rate===0 },
          { label:"Платёж/мес", val:fmt(monthly) },
        ].map(s => (
          <div key={s.label} className="flex flex-col">
            <span className="text-xs mb-0.5" style={{ color:"#8888a2" }}>{s.label}</span>
            <span className="mono text-sm font-medium" style={{ color: s.green ? "#34d399" : "#eeeef5" }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Price block */}
      <div className="px-5 py-4 flex items-end justify-between">
        <div className="flex-1">
          <div className="text-xs mb-1" style={{ color:"#8888a2" }}>Базовая цена</div>
          <div className="mono font-bold text-xl" style={{ color:"#eeeef5" }}>{fmtFull(offer.price)}</div>
          {offer.benefit > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="line-through mono text-xs" style={{ color:"#555566" }}>{fmtFull(offer.price_with_renovation)}</span>
              <span className="tag tag-green mono text-xs">+{fmt(offer.benefit)}</span>
            </div>
          )}
        </div>
        {offer.price_with_program < offer.price && (
          <div className="text-right">
            <div className="text-xs mb-0.5" style={{ color:"#8888a2" }}>С программой</div>
            <div className="mono font-bold text-base" style={{ color:"#fbbf24" }}>{fmtFull(offer.price_with_program)}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5">
        <button onClick={() => onDetail(offer.id)} className="btn-primary w-full py-2.5 text-sm">
          Подробнее →
        </button>
      </div>
    </div>
  );
}

/* ─── Detail Modal ──────────────────────────────────────────────────────── */
function DetailModal({
  offer, compareList, favorites,
  onClose, onCompare, onFav, onContact,
}: {
  offer: Offer; compareList: number[]; favorites: number[];
  onClose: () => void; onCompare: (id:number)=>void; onFav: (id:number)=>void; onContact: (id:number)=>void;
}) {
  const [pv, setPv] = useState(offer.min_down);
  const [term, setTerm] = useState(offer.term_months);
  const loan = offer.price * (1 - pv / 100);
  const monthly = Math.round(loan / term);
  const total = loan * (1 + offer.interest_rate / 100 * term / 12);
  const overpay = Math.round(total - loan);
  const MRATE = 19;
  const mktMonthly = Math.round(loan*(MRATE/100/12)/(1-Math.pow(1+MRATE/100/12,-360)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl" style={{ background:"#13131c", border:"1px solid rgba(124,58,237,0.2)" }}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 z-10" style={{ background:"#13131c", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div className="mono text-xs mb-1" style={{ color:"#8888a2" }}>{offer.developer}</div>
            <h2 className="text-xl font-bold" style={{ color:"#eeeef5" }}>{offer.project}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background:"rgba(255,255,255,0.06)", color:"#8888a2" }}>×</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)" }}>
              <div className="text-sm font-semibold mb-3" style={{ color:"#a78bfa" }}>📍 Расположение</div>
              <div className="text-sm" style={{ color:"#eeeef5" }}>{offer.region}</div>
              <div className="text-xs mt-1" style={{ color:"#8888a2" }}>🚇 {offer.metro}</div>
            </div>
            <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-sm font-semibold mb-3" style={{ color:"#eeeef5" }}>📋 Параметры программы</div>
              <div className="space-y-2">
                {[
                  ["ПВ", `${offer.min_down}%  (${fmt(offer.price*offer.min_down/100)})`],
                  ["Срок", `${offer.term_months} мес`],
                  ["Ставка", `${offer.interest_rate}% годовых`],
                  ["Тип", PT_FULL[offer.payment_type]],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color:"#8888a2" }}>{k}</span>
                    <span className="mono text-xs font-medium" style={{ color: k==="Ставка"&&offer.interest_rate===0?"#34d399":"#eeeef5" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Price summary */}
            <div className="rounded-xl p-4" style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)" }}>
              <div className="text-sm font-semibold mb-3" style={{ color:"#fbbf24" }}>💰 Стоимость</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color:"#8888a2" }}>С отделкой:</span>
                  <span className="mono text-xs line-through" style={{ color:"#555566" }}>{fmtFull(offer.price_with_renovation)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color:"#8888a2" }}>Базовая:</span>
                  <span className="mono text-sm font-bold" style={{ color:"#eeeef5" }}>{fmtFull(offer.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color:"#8888a2" }}>С программой:</span>
                  <span className="mono text-sm font-bold" style={{ color:"#fbbf24" }}>{fmtFull(offer.price_with_program)}</span>
                </div>
                <div className="flex justify-between pt-2" style={{ borderTop:"1px solid rgba(245,158,11,0.2)" }}>
                  <span className="text-xs font-semibold" style={{ color:"#34d399" }}>Ваша выгода:</span>
                  <span className="mono text-sm font-bold" style={{ color:"#34d399" }}>+{fmtFull(offer.benefit)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color:"#8888a2" }}>Особые условия</div>
              <BadgeTags offer={offer} />
            </div>
          </div>

          {/* Right — calculator */}
          <div className="space-y-4">
            <div className="rounded-xl p-5" style={{ background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.25)" }}>
              <div className="text-sm font-semibold mb-4" style={{ color:"#a78bfa" }}>🧮 Калькулятор</div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs" style={{ color:"#8888a2" }}>Первоначальный взнос</span>
                  <span className="mono text-xs font-bold" style={{ color:"#eeeef5" }}>{pv}%  ({fmt(offer.price*pv/100)})</span>
                </div>
                <input type="range" min={Math.max(0,offer.min_down)} max={80} value={pv} onChange={e=>setPv(+e.target.value)} />
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs" style={{ color:"#8888a2" }}>Срок рассрочки</span>
                  <span className="mono text-xs font-bold" style={{ color:"#eeeef5" }}>{term} мес</span>
                </div>
                <input type="range" min={2} max={60} value={term} onChange={e=>setTerm(+e.target.value)} />
              </div>
              <div className="rounded-lg p-3 space-y-2" style={{ background:"rgba(0,0,0,0.25)" }}>
                {[
                  ["Кредит", fmt(loan)],
                  ["Платёж/мес", fmt(monthly), "#a78bfa"],
                  ["Итого", fmt(Math.round(total))],
                  ["Переплата", overpay===0 ? "0 ₽" : fmt(overpay), overpay===0?"#34d399":"#f87171"],
                ].map(([k,v,c]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-xs" style={{ color:"#8888a2" }}>{k}</span>
                    <span className="mono text-sm font-bold" style={{ color: (c as string)||"#eeeef5" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* vs Mortgage */}
            <div className="rounded-xl p-4" style={{ background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)" }}>
              <div className="text-sm font-semibold mb-3" style={{ color:"#34d399" }}>📊 vs Ипотека {MRATE}%</div>
              <div className="space-y-2">
                {[
                  ["Ипотека 30 лет", fmt(mktMonthly)+"/мес", "#f87171"],
                  ["Рассрочка", fmt(monthly)+"/мес", "#34d399"],
                  ["Экономия в мес", fmt(Math.max(0,mktMonthly-monthly)), "#a78bfa"],
                ].map(([k,v,c]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-xs" style={{ color:"#8888a2" }}>{k}</span>
                    <span className="mono text-sm font-bold" style={{ color:c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div className="space-y-2">
              <button onClick={()=>onContact(offer.id)} className="btn-primary w-full py-3">📞 Связаться с застройщиком</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={()=>{onCompare(offer.id);onClose();}} className={`btn-ghost ${compareList.includes(offer.id)?"active":""}`}>
                  {compareList.includes(offer.id)?"✓ В сравнении":"📊 Сравнить"}
                </button>
                <button onClick={()=>{onFav(offer.id);}} className={`btn-ghost ${favorites.includes(offer.id)?"active":""}`}>
                  {favorites.includes(offer.id)?"♥ Избранное":"🤍 В избранное"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Comparison Modal ──────────────────────────────────────────────────── */
function ComparisonModal({ ids, onClose }: { ids: number[]; onClose: () => void }) {
  const items = ids.map(id => OFFERS.find(o=>o.id===id)!);
  const MRATE = 19;
  const maxBenefit = Math.max(...items.map(o=>o.benefit));
  const rows: [string, (o:Offer)=>React.ReactNode, string?][] = [
    ["Базовая цена", o=><span className="mono font-bold">{fmtFull(o.price)}</span>],
    ["С программой", o=><span className="mono font-bold" style={{color:"#fbbf24"}}>{fmtFull(o.price_with_program)}</span>],
    ["Выгода", o=><span className="mono font-bold" style={{color:"#34d399"}}>+{fmtFull(o.benefit)}</span>, "rgba(16,185,129,0.06)"],
    ["ПВ", o=>`${o.min_down}%`],
    ["Срок", o=>`${o.term_months} мес`],
    ["Ставка", o=><span style={{color:o.interest_rate===0?"#34d399":""}} className="mono font-bold">{o.interest_rate}%</span>],
    ["Платёж/мес", o=><span className="mono font-bold" style={{color:"#a78bfa"}}>{fmt(Math.round(o.price*(1-o.min_down/100)/o.term_months))}</span>],
    ["Переплата", o=>{const l=o.price*(1-o.min_down/100);const ov=l*(1+o.interest_rate/100*o.term_months/12)-l;return<span className="mono" style={{color:ov===0?"#34d399":"#f87171"}}>{ov===0?"0 ₽":fmt(Math.round(ov))}</span>;}],
    ["Ипотека 30л 19%", o=>{const l=o.price*(1-o.min_down/100);return<span className="mono" style={{color:"#8888a2"}}>{fmt(Math.round(l*(MRATE/100/12)/(1-Math.pow(1+MRATE/100/12,-360))))}/мес</span>;}, "rgba(124,58,237,0.05)"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)"}}>
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl" style={{background:"#13131c",border:"1px solid rgba(124,58,237,0.2)"}}>
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 z-10" style={{background:"#13131c",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <h2 className="text-xl font-bold" style={{color:"#eeeef5"}}>📊 Сравнение предложений</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{background:"rgba(255,255,255,0.06)",color:"#8888a2"}}>×</button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <th className="text-left p-3 w-40 text-xs font-semibold" style={{color:"#8888a2"}}>Параметр</th>
                {items.map(o=>(
                  <th key={o.id} className="text-left p-3">
                    <div className="mono text-xs" style={{color:"#8888a2"}}>{o.developer}</div>
                    <div className="font-bold text-sm" style={{color:"#eeeef5"}}>{o.project}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, render, bg]) => (
                <tr key={label} style={{borderBottom:"1px solid rgba(255,255,255,0.04)", background:bg||"transparent"}}>
                  <td className="p-3 text-xs" style={{color:"#8888a2"}}>{label}</td>
                  {items.map(o=><td key={o.id} className="p-3 text-sm">{render(o)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Benefit bars */}
          <div className="mt-6 rounded-xl p-5" style={{background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.15)"}}>
            <div className="text-sm font-semibold mb-4" style={{color:"#a78bfa"}}>Визуализация выгоды</div>
            <div className="space-y-3">
              {items.map(o=>{
                const w = maxBenefit>0 ? Math.max(6, Math.round(o.benefit/maxBenefit*100)) : 20;
                return (
                  <div key={o.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{color:"#eeeef5"}}>{o.project}</span>
                      <span className="mono" style={{color:"#34d399"}}>+{fmt(o.benefit)}</span>
                    </div>
                    <div className="h-5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
                      <div className="h-full rounded-full" style={{width:`${w}%`,background:"linear-gradient(90deg,#7c3aed,#34d399)",transition:"width .5s ease"}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Contact Modal ─────────────────────────────────────────────────────── */
function ContactModal({ offer, onClose, onAction }: { offer: Offer; onClose: ()=>void; onAction: (t:string)=>void }) {
  const btns = [
    { type:"call",      label:"📞 Позвонить менеджеру",   bg:"#059669", hover:"#047857" },
    { type:"whatsapp",  label:"💬 Написать в WhatsApp",   bg:"#16a34a", hover:"#15803d" },
    { type:"visit",     label:"🏠 Записаться на просмотр", bg:"#7c3aed", hover:"#6d28d9" },
    { type:"lead",      label:"📝 Оставить заявку",       bg:"rgba(255,255,255,0.07)", hover:"rgba(255,255,255,0.12)", color:"#eeeef5" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)"}}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{background:"#13131c",border:"1px solid rgba(124,58,237,0.2)"}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{color:"#eeeef5"}}>Связаться</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-lg" style={{background:"rgba(255,255,255,0.06)",color:"#8888a2"}}>×</button>
        </div>
        <p className="text-xs mb-5" style={{color:"#8888a2"}}>ЖК: <span className="font-semibold" style={{color:"#eeeef5"}}>{offer.developer} — {offer.project}</span></p>
        <div className="space-y-2.5">
          {btns.map(b=>(
            <button key={b.type} onClick={()=>onAction(b.type)}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{background:b.bg, color:b.color||"#fff"}}
            >{b.label}</button>
          ))}
        </div>
        <div className="mt-4 pt-4" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <button onClick={()=>onAction("subscription")} className="w-full text-sm" style={{color:"#a78bfa"}}>
            🔔 Подписаться на обновления по ЖК
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AI Panel ──────────────────────────────────────────────────────────── */
function AIPanel({
  open, onClose, filters, budget, visible,
  onApplyFilters,
}: {
  open: boolean; onClose: ()=>void;
  filters: FilterState; budget: number; visible: Offer[];
  onApplyFilters: (f: Partial<FilterState>) => void;
}) {
  const [msgs, setMsgs] = useState<AIMsg[]>([
    {
      id: 0, role:"bot",
      text: "Привет! Я **АРГО** — AI-помощник РассрочкаПортала.\n\nПомогу найти рассрочку под ваши цели, объясню условия и сравню предложения.",
      chips: ["Хочу 0% рассрочку","Для семьи с детьми","Инвестиционная покупка","Как выбрать?"],
    }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (open) setTimeout(()=>inputRef.current?.focus(), 350);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, typing]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: AIMsg = { id: nextId.current++, role:"user", text: text.trim() };
    setMsgs(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const delay = 700 + Math.random() * 600;
    setTimeout(() => {
      const resp = buildAIResponse(text, filters, budget, visible);
      const botMsg: AIMsg = { id: nextId.current++, role:"bot", text: resp.text, chips: resp.chips };
      setMsgs(prev => [...prev, botMsg]);
      setTyping(false);
      if (resp.newFilters) onApplyFilters(resp.newFilters);
    }, delay);
  }, [filters, budget, visible, onApplyFilters]);

  const renderText = (t: string) =>
    t.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i} className="block">
          {parts.map((p, j) => j%2===1 ? <strong key={j} style={{color:"#eeeef5"}}>{p}</strong> : <span key={j}>{p}</span>)}
        </span>
      );
    });

  return (
    <div className={`ai-panel ${open ? "open" : ""}`}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{borderBottom:"1px solid rgba(124,58,237,0.2)"}}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff"}}>АИ</div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{background:"#34d399",borderColor:"#0f0f18"}} />
          </div>
          <div>
            <div className="font-bold text-sm" style={{color:"#eeeef5"}}>АРГО</div>
            <div className="mono text-xs" style={{color:"#34d399"}}>● онлайн</div>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{background:"rgba(255,255,255,0.06)",color:"#8888a2"}}>×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {msgs.map(msg => (
          <div key={msg.id} className={`flex ${msg.role==="user"?"justify-end":"justify-start"} fade-up`}>
            <div className="max-w-[88%]">
              <div className={`px-4 py-3 text-xs leading-relaxed ${msg.role==="user"?"ai-msg-user":"ai-msg-bot"}`} style={{color:msg.role==="user"?"#eeeef5":"#b0b0c8"}}>
                {renderText(msg.text)}
              </div>
              {msg.chips && msg.chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.chips.map(c=>(
                    <button key={c} onClick={()=>sendMessage(c)} className="text-xs px-3 py-1.5 rounded-full transition-all" style={{background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.25)",color:"#a78bfa"}}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start fade-up">
            <div className="ai-msg-bot px-4 py-3">
              <div className="dot-bounce flex gap-1">
                <span/><span/><span/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-4" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sendMessage(input)}
            placeholder="Спросите АРГО..."
            className="flex-1 text-xs px-4 py-3 rounded-xl outline-none"
            style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"#eeeef5",fontFamily:"'Manrope',sans-serif"}}
          />
          <button onClick={()=>sendMessage(input)} className="btn-primary px-4 rounded-xl text-sm">→</button>
        </div>
        <p className="mono text-center text-xs mt-2" style={{color:"rgba(136,136,162,0.5)"}}>АРГО · РассрочкаПортал AI</p>
      </div>
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────────────────────────── */
export default function App() {
  const [budget, setBudget] = useState(30);
  const [filters, setFilters] = useState<FilterState>({ group:null, types:[], specials:[], pvMax:50, termMax:60 });
  const [compareList, setCompareList] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [detailId, setDetailId] = useState<number|null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [contactId, setContactId] = useState<number|null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [toast, setToast] = useState<string|null>(null);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const filtered = OFFERS.filter(o => {
    if (showFavsOnly && !favorites.includes(o.id)) return false;
    if (o.price > budget * 1e6 * 0.85) return false;
    if (o.min_down > filters.pvMax) return false;
    if (o.term_months > filters.termMax) return false;
    if (filters.types.length > 0) {
      const match = filters.types.some(t => {
        if (t==="interest_free") return o.is_interest_free;
        if (t==="key_early") return o.has_key_early;
        if (t==="deferred") return o.payment_type==="deferred";
        if (t==="fixed") return o.payment_type==="fixed";
        if (t==="monthly") return o.payment_type==="monthly";
        if (t==="switch_mortgage") return o.can_switch_mortgage;
        return false;
      });
      if (!match) return false;
    }
    if (filters.group==="family" && filters.specials.length > 0) {
      const match = filters.specials.some(s => {
        if (s==="is_for_families") return o.is_for_families;
        if (s==="is_for_pregnant") return o.is_for_pregnant;
        return false;
      });
      if (!match) return false;
    }
    return true;
  });

  const toggleType = (t: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(t) ? prev.types.filter(x=>x!==t) : [...prev.types, t]
    }));
  };

  const toggleCompare = (id: number) => {
    if (compareList.includes(id)) {
      setCompareList(l=>l.filter(x=>x!==id)); showToast("Удалено из сравнения");
    } else {
      if (compareList.length>=4) { showToast("Максимум 4 объекта"); return; }
      setCompareList(l=>[...l,id]); showToast("Добавлено в сравнение");
    }
  };

  const toggleFav = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(l=>l.filter(x=>x!==id)); showToast("Удалено из избранного");
    } else {
      setFavorites(l=>[...l,id]); showToast("Добавлено в избранное ♥");
    }
  };

  const applyAIFilters = useCallback((partial: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...partial }));
    showToast("АРГО применил фильтры");
  }, [showToast]);

  const groupBtns: { key: Group|null; label: string }[] = [
    {key:null, label:"Все"},
    {key:"family", label:"👨‍👩‍👧 Семья"},
    {key:"investor", label:"💰 Инвестор"},
    {key:"individual", label:"👤 Физлицо"},
  ];

  const quickTypes = [
    { key:"interest_free", label:"0% ставка" },
    { key:"key_early", label:"🔑 Ключи до оплаты" },
    { key:"deferred", label:"⏸ Отложенный" },
    { key:"switch_mortgage", label:"🔄 → Ипотека" },
  ];

  const interestFree0 = OFFERS.filter(o=>o.is_interest_free).length;
  const keyEarlyCount = OFFERS.filter(o=>o.has_key_early).length;
  const maxBenefit = Math.max(...OFFERS.map(o=>o.benefit));

  return (
    <div className="min-h-screen" style={{background:"#0c0c12",fontFamily:"'Manrope',sans-serif"}}>
      <style>{G}</style>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40" style={{background:"rgba(12,12,18,0.9)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-base" style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff"}}>Р</div>
            <div>
              <div className="font-extrabold text-sm leading-tight" style={{color:"#eeeef5"}}>РассрочкаПортал</div>
              <div className="mono text-xs" style={{color:"#8888a2"}}>Москва · 12 застройщиков</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#catalog" className="btn-ghost">Каталог</a>
            <button
              onClick={()=>{ if(compareList.length<2){showToast("Добавьте минимум 2 ЖК");}else{setShowComparison(true);}}}
              className={`btn-ghost relative ${compareList.length>0?"active":""}`}
            >
              Сравнение {compareList.length>0&&<span className="ml-1 mono text-xs px-1.5 py-0.5 rounded-full" style={{background:"#7c3aed",color:"#fff"}}>{compareList.length}</span>}
            </button>
            <button
              onClick={()=>{ setShowFavsOnly(p=>!p); showToast(showFavsOnly?"Показаны все":"Только избранные"); }}
              className={`btn-ghost ${showFavsOnly?"active":""}`}
            >
              Избранное {favorites.length>0&&<span className="ml-1 mono text-xs px-1.5 py-0.5 rounded-full" style={{background:"#ec4899",color:"#fff"}}>{favorites.length}</span>}
            </button>
          </nav>
          <button
            onClick={()=>setAiOpen(p=>!p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
            style={{background:aiOpen?"rgba(124,58,237,0.3)":"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.4)",color:"#a78bfa",boxShadow:aiOpen?"0 0 20px rgba(124,58,237,0.3)":""}}
          >
            <span className="text-base">✦</span> АРГО AI
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 px-5">
        <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.22) 0%, transparent 70%)"}} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)"}} />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 mono text-xs" style={{background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.25)",color:"#a78bfa"}}>
            ✦ AI-подбор рассрочек · Москва 2025
          </div>
          <h1 className="font-extrabold text-4xl md:text-6xl leading-tight mb-5" style={{color:"#eeeef5",letterSpacing:"-0.03em"}}>
            Найдите лучшую<br />
            <span style={{background:"linear-gradient(135deg,#a78bfa,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>рассрочку</span> в Москве
          </h1>
          <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto" style={{color:"#8888a2"}}>
            Сравнивайте программы 12+ застройщиков. Беспроцентные рассрочки, скидки до 32%, ключи до оплаты — всё в одном месте.
          </p>
          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <StatPill label="застройщиков" value="12" accent />
            <StatPill label="0% предложений" value={`${interestFree0}`} accent />
            <StatPill label="ключи до оплаты" value={`${keyEarlyCount}`} />
            <StatPill label="макс. выгода" value={fmt(maxBenefit)} />
          </div>
          {/* Budget slider */}
          <div className="max-w-xl mx-auto rounded-2xl p-6" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{color:"#eeeef5"}}>Ваш бюджет</span>
              <span className="mono font-bold text-xl" style={{color:"#a78bfa"}}>{budget} млн ₽</span>
            </div>
            <input type="range" min={5} max={100} value={budget} onChange={e=>setBudget(+e.target.value)} />
            <div className="flex justify-between mono text-xs mt-2" style={{color:"#8888a2"}}>
              <span>5 млн</span>
              <span style={{color:"#8888a2"}}>Квартиры до {Math.round(budget*0.85)} млн при ПВ 15%</span>
              <span>100 млн</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={()=>setAiOpen(true)} className="btn-primary px-8 py-3 text-sm">✦ Спросить АРГО</button>
            <a href="#catalog" className="btn-ghost px-8 py-3 text-sm">Смотреть каталог →</a>
          </div>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div id="catalog" className="sticky top-16 z-30 px-5 py-3" style={{background:"rgba(12,12,18,0.95)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto pb-1">
          <span className="mono text-xs shrink-0" style={{color:"#8888a2"}}>Группа:</span>
          {groupBtns.map(g=>(
            <button key={String(g.key)} onClick={()=>setFilters(prev=>({...prev,group:g.key}))} className={`filter-chip shrink-0 ${filters.group===g.key?"active":""}`}>{g.label}</button>
          ))}
          <div className="w-px h-5 shrink-0" style={{background:"rgba(255,255,255,0.1)"}} />
          <span className="mono text-xs shrink-0" style={{color:"#8888a2"}}>Тип:</span>
          {quickTypes.map(qt=>(
            <button key={qt.key} onClick={()=>toggleType(qt.key)} className={`filter-chip shrink-0 ${filters.types.includes(qt.key)?"active":""}`}>{qt.label}</button>
          ))}
          <div className="w-px h-5 shrink-0" style={{background:"rgba(255,255,255,0.1)"}} />
          {(filters.types.length>0||filters.group!==null||showFavsOnly) && (
            <button onClick={()=>{setFilters({group:null,types:[],specials:[],pvMax:50,termMax:60});setShowFavsOnly(false);}} className="filter-chip shrink-0 text-red-400" style={{borderColor:"rgba(239,68,68,0.3)"}}>✕ Сбросить</button>
          )}
          <div className="ml-auto shrink-0 mono text-xs" style={{color:"#8888a2"}}>
            {filtered.length} / {OFFERS.length} ЖК
          </div>
        </div>
      </div>

      {/* ── Catalog ── */}
      <main className="max-w-7xl mx-auto px-5 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2" style={{color:"#eeeef5"}}>Ничего не найдено</h3>
            <p className="mb-6 text-sm" style={{color:"#8888a2"}}>Попробуйте расширить бюджет, снять фильтры или спросить АРГО</p>
            <div className="flex justify-center gap-3">
              <button onClick={()=>setFilters({group:null,types:[],specials:[],pvMax:50,termMax:60})} className="btn-primary">Сбросить фильтры</button>
              <button onClick={()=>setAiOpen(true)} className="btn-ghost">Спросить АРГО →</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(o=>(
              <OfferCard
                key={o.id} offer={o}
                isCompare={compareList.includes(o.id)}
                isFav={favorites.includes(o.id)}
                onCompare={toggleCompare}
                onFav={toggleFav}
                onDetail={setDetailId}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 px-5 py-12" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold" style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff"}}>Р</div>
              <span className="font-bold" style={{color:"#eeeef5"}}>РассрочкаПортал</span>
            </div>
            <p className="text-xs leading-relaxed" style={{color:"#8888a2"}}>Агрегатор рассрочек от застройщиков Москвы. Данные обновляются ежедневно.</p>
          </div>
          <div>
            <div className="text-xs font-semibold mb-3" style={{color:"#eeeef5"}}>Покупателям</div>
            <ul className="space-y-2 text-xs" style={{color:"#8888a2"}}>
              {["Каталог ЖК","Калькулятор рассрочки","Сравнение с ипотекой","Гайд покупателя"].map(l=>(
                <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold mb-3" style={{color:"#eeeef5"}}>Контакты</div>
            <ul className="space-y-2 text-xs" style={{color:"#8888a2"}}>
              <li>📞 8 (800) 555-35-35</li>
              <li>💬 WhatsApp</li>
              <li>📧 info@rassrochka.ru</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 mono text-xs text-center" style={{borderTop:"1px solid rgba(255,255,255,0.05)",color:"#555566"}}>
          © 2025 РассрочкаПортал
        </div>
      </footer>

      {/* ── Modals ── */}
      {detailId !== null && (
        <DetailModal
          offer={OFFERS.find(o=>o.id===detailId)!}
          compareList={compareList} favorites={favorites}
          onClose={()=>setDetailId(null)}
          onCompare={toggleCompare} onFav={toggleFav}
          onContact={id=>{setDetailId(null);setContactId(id);}}
        />
      )}
      {showComparison && compareList.length>=2 && (
        <ComparisonModal ids={compareList} onClose={()=>setShowComparison(false)} />
      )}
      {contactId !== null && (
        <ContactModal
          offer={OFFERS.find(o=>o.id===contactId)!}
          onClose={()=>setContactId(null)}
          onAction={type=>{
            const o = OFFERS.find(x=>x.id===contactId)!;
            const L: Record<string,string> = {call:"📞 Звонок",whatsapp:"💬 WhatsApp",visit:"🏠 Просмотр записан",lead:"📝 Заявка отправлена",subscription:"🔔 Подписка оформлена"};
            showToast(`${L[type]}: ${o.project}`);
            setContactId(null);
          }}
        />
      )}

      {/* ── AI Panel ── */}
      <AIPanel
        open={aiOpen} onClose={()=>setAiOpen(false)}
        filters={filters} budget={budget} visible={filtered}
        onApplyFilters={applyAIFilters}
      />
      {aiOpen && <div className="fixed inset-0 z-50 md:hidden" onClick={()=>setAiOpen(false)} style={{background:"rgba(0,0,0,0.5)"}} />}

      {/* AI FAB */}
      {!aiOpen && (
        <button
          onClick={()=>setAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 font-bold text-xs shadow-2xl transition-all hover:scale-105"
          style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",boxShadow:"0 0 30px rgba(124,58,237,0.5)"}}
        >
          <span className="text-lg leading-none">✦</span>
          <span style={{fontSize:"9px",opacity:.85}}>АРГО</span>
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl mono text-xs fade-up" style={{background:"rgba(20,20,28,0.97)",border:"1px solid rgba(124,58,237,0.3)",color:"#eeeef5",boxShadow:"0 8px 30px rgba(0,0,0,0.5)"}}>
          {toast}
        </div>
      )}
    </div>
  );
}
