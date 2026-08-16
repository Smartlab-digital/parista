"use client";

import { useState } from "react";
import { VisualEditorProvider } from "./VisualEditor";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

type Variant = "air" | "pro" | "care";

const variants: Array<{ id: Variant; number: string; title: string; note: string }> = [
  { id: "air", number: "01", title: "Воздух", note: "Лёгкий e-commerce" },
  { id: "pro", number: "02", title: "Инженерный", note: "Экспертность и подбор" },
  { id: "care", number: "03", title: "С заботой", note: "Сервис под ключ" },
];

const conditionerTypes = [
  { title: "Настенные кондиционеры", href: "https://parista.ru/catalog/nastennye-kondicionery/" },
  { title: "Колонные кондиционеры", href: "https://parista.ru/catalog/kolonnye-kondicionery/" },
  { title: "Напольно-потолочные кондиционеры", href: "https://parista.ru/catalog/napolno-potolochnye-kondizionery/" },
  { title: "Кассетные кондиционеры", href: "https://parista.ru/catalog/kassetnye-kondizionery/" },
  { title: "Канальные кондиционеры", href: "https://parista.ru/catalog/kanalnye-kondizionery/" },
  { title: "Мульти сплит системы", href: "https://parista.ru/catalog/multi-split-sistemy/" },
  { title: "Мобильные кондиционеры", href: "https://parista.ru/catalog/mobilnye-kondizionery/" },
];

const categories = [
  { title: "Кондиционеры", note: "7 категорий для дома и бизнеса", image: "/category-conditioner.png", tone: "blue", links: conditionerTypes },
  { title: "Вентиляция", note: "Приточная и вытяжная", image: "/ventilation-equipment.png", tone: "mint", links: [
    { title: "Бризеры", href: "https://parista.ru/catalog/pritochnaya-ventilyatsiya/" },
    { title: "Приточная вентиляция", href: "https://parista.ru/catalog/pritochnaya-ventilyatsiya/" },
    { title: "Канальные вентиляторы", href: "https://parista.ru/catalog/kanalnye-ventilyatory/" },
  ] },
  { title: "Воздух", note: "Очистители и увлажнители", image: "/category-air.png", tone: "lilac", links: [
    { title: "Очистители воздуха", href: "https://parista.ru/catalog/vozdukh/" },
    { title: "Увлажнители воздуха", href: "https://parista.ru/catalog/vozdukh/" },
    { title: "Осушители воздуха", href: "https://parista.ru/catalog/vozdukh/" },
  ] },
  { title: "Аксессуары", note: "Всё для монтажа", image: "/accessories-equipment.png", tone: "sand", links: [
    { title: "Блоки распределители", href: "https://parista.ru/catalog/bloki-raspredeliteli/" },
  ] },
  { title: "VRF‑системы", note: "Для зданий и сложных объектов", image: "/vrf-equipment-source.webp", tone: "vrf", items: ["Канальные блоки", "Кассетные блоки", "Наружные блоки"] },
];

const certificates = [
  { image: "/certificates/certificate-1.webp", title: "Сертификат Daikin" },
  { image: "/certificates/certificate-2.webp", title: "Сертификат Cherebrooke" },
  { image: "/certificates/certificate-3.webp", title: "Сертификат Breezart" },
  { image: "/certificates/certificate-4.webp", title: "Сертификат Kalashnikov" },
  { image: "/certificates/certificate-5.webp", title: "Сертификат Ballu" },
];

const brands = [
  { name: "Haier", image: "/brands/haier.png", href: "https://parista.ru/brends/haier/" },
  { name: "Funai", image: "/brands/funai.png", href: "https://parista.ru/brends/funai/" },
  { name: "Ballu", image: "/brands/ballu.png", href: "https://parista.ru/brends/ballu-machine/" },
  { name: "Royal Thermo", image: "/brands/royal-thermo.jpg", href: "https://parista.ru/brends/royal-thermo/" },
  { name: "Kalashnikov", image: "/brands/kalashnikov.png", href: "https://parista.ru/brends/kalashnikov/" },
  { name: "Coolberg", image: "/brands/coolberg.png", href: "https://parista.ru/brends/coolberg/" },
  { name: "Energolux", image: "/brands/energolux.png", href: "https://parista.ru/brends/energolux/" },
  { name: "Ferrum", image: "/brands/ferrum.png", href: "https://parista.ru/brends/ferrum/" },
  { name: "Electrolux", image: "/brands/electrolux.png", href: "https://parista.ru/brends/electrolux/" },
  { name: "Hisense", image: "/brands/hisense.png", href: "https://parista.ru/brends/hisense/" },
];

const products = [
  {
    brand: "Electrolux",
    name: "Smartline EACS-07HSM/N3",
    area: "20 м²",
    noise: "21 дБ",
    inverter: "Нет",
    price: "27 990 ₽",
    image: "/product-electrolux.jpg",
    badge: "Хит",
  },
  {
    brand: "Haier",
    name: "HSU-07HPL303 / HSU-07HPL103",
    area: "20 м²",
    noise: "22 дБ",
    inverter: "Нет",
    price: "25 600 ₽",
    image: "/product-haier.jpg",
    badge: "Выгодно",
  },
  {
    brand: "Royal Thermo",
    name: "Barocco RTB-07HN8 V2",
    area: "20 м²",
    noise: "23 дБ",
    inverter: "Нет",
    price: "25 400 ₽",
    image: "/product-royal.jpg",
    badge: "Новинка",
  },
];

const contentByVariant = {
  air: {
    eyebrow: "КЛИМАТ, КОТОРЫЙ ПОДХОДИТ ВАМ",
    title: <>Комфортный воздух<br />начинается с выбора</>,
    text: "Подберём кондиционер под площадь, бюджет и привычки. Доставим и установим — всё в одном заказе.",
    primary: "Подобрать оборудование",
    secondary: "Смотреть каталог",
    accent: "Монтаж в подарок",
    caption: "при покупке мульти сплит-системы",
  },
  pro: {
    eyebrow: "ИНЖЕНЕРНЫЕ РЕШЕНИЯ PARISTA",
    title: <>Проектируем климат.<br />От квартиры до бизнеса.</>,
    text: "Расчёт мощности, подбор оборудования, монтаж и сервис одной командой. Работаем с 2008 года.",
    primary: "Получить расчёт",
    secondary: "Наши проекты",
    accent: "Расчёт за 15 минут",
    caption: "предварительная смета по параметрам объекта",
  },
  care: {
    eyebrow: "PARISTA — CLIMATE | COMFORT",
    title: <>Прохлада дома.<br />Без лишних забот.</>,
    text: "Поможем выбрать, аккуратно установим и останемся на связи после покупки. Гарантия на оборудование и работы.",
    primary: "Заказать консультацию",
    secondary: "Как мы работаем",
    accent: "Всё под ключ",
    caption: "подбор, доставка, монтаж и обслуживание",
  },
};

function Logo() {
  return <img className="brand-logo" src={asset("/parista-logo.svg")} alt="Parista — climate comfort" />;
}

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

export function RedesignShowcase() {
  const [variant, setVariant] = useState<Variant>("air");
  const [activeTab, setActiveTab] = useState("Хиты продаж");
  const [cart, setCart] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const c = contentByVariant[variant];

  return (
    <VisualEditorProvider>
    <div className={`site variant-${variant}`}>
      <section className="concept-switcher" aria-label="Варианты редизайна">
        <div className="concept-intro">
          <span className="concept-kicker">PARISTA · КОНЦЕПЦИИ РЕДИЗАЙНА</span>
          <strong>Выберите направление</strong>
        </div>
        <div className="variant-tabs" role="tablist">
          {variants.map((item) => (
            <button
              key={item.id}
              className={variant === item.id ? "active" : ""}
              onClick={() => setVariant(item.id)}
              role="tab"
              aria-selected={variant === item.id}
            >
              <span>{item.number}</span>
              <b>{item.title}</b>
              <small>{item.note}</small>
            </button>
          ))}
        </div>
      </section>

      <header className="site-header">
        <div className="utility-bar wrap">
          <span>Москва · работаем ежедневно</span>
          <nav aria-label="Служебная навигация">
            <a href="#offers">Акции</a>
            <a href="#about">О нас</a>
            <a href="#services">Монтаж</a>
            <a href="#services">Сервис</a>
            <a href="#contacts">Контакты</a>
            <a href="#projects">Наши проекты</a>
          </nav>
          <a className="phone" href="tel:+74993808078">+7 (499) 380-80-78</a>
        </div>
        <div className="main-header wrap">
          <button className="mobile-menu" aria-label="Открыть меню" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <a href="#top" className="logo-link"><Logo /></a>
          <button className="catalog-button"><Icon>⌘</Icon> Каталог</button>
          <label className="search">
            <span className="sr-only">Поиск по каталогу</span>
            <input placeholder="Найти кондиционер, бренд или услугу" />
            <button aria-label="Найти">⌕</button>
          </label>
          <div className="header-actions">
            <button aria-label="Сравнение"><Icon>≋</Icon><span>Сравнение</span></button>
            <button aria-label="Избранное"><Icon>♡</Icon><span>Избранное</span></button>
            <button aria-label="Корзина"><Icon>▱</Icon><span>Корзина</span><em>{cart}</em></button>
          </div>
          <button className="callback">Обратный звонок</button>
        </div>
        <nav className={`mobile-nav ${menuOpen ? "open" : ""}`} aria-label="Мобильное меню">
          <a href="#offers">Акции</a><a href="#about">О нас</a><a href="#services">Монтаж и сервис</a><a href="#projects">Проекты</a><a href="#contacts">Контакты</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero wrap">
          <div className="hero-copy">
            <span className="eyebrow">{c.eyebrow}</span>
            <h1>{c.title}</h1>
            <p>{c.text}</p>
            <div className="hero-buttons">
              <button className="primary">{c.primary}<span>→</span></button>
              <button className="secondary">{c.secondary}</button>
            </div>
            <div className="trust-row">
              <span><b>18</b> лет на рынке</span>
              <span><b>4,9</b> рейтинг клиентов</span>
              <span><b>2 года</b> гарантии</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="sun-orbit" />
            <div className="air-ring ring-one" />
            <div className="air-ring ring-two" />
            <img src={asset("/category-conditioner.png")} alt="Настенный кондиционер" />
            <div className="promo-card">
              <span>ДО 21 СЕНТЯБРЯ</span>
              <strong>{c.accent}</strong>
              <small>{c.caption}</small>
            </div>
          </div>
        </section>

        <section className="quick-services wrap" id="services">
          <article><span className="service-3d service-3d-select" aria-hidden="true"><i /></span><div><b>Подбор оборудования</b><span>По площади и бюджету</span></div><a href="#catalog">→</a></article>
          <article><span className="service-3d service-3d-calculate" aria-hidden="true"><i /></span><div><b>Рассчитать монтаж</b><span>Смета за 15 минут</span></div><a href="#contacts">→</a></article>
          <article><span className="service-3d service-3d-repair" aria-hidden="true"><i /></span><div><b>Сервис и ремонт</b><span>Выезд специалиста</span></div><a href="#contacts">→</a></article>
        </section>

        <section className="categories section wrap" id="catalog">
          <div className="section-heading">
            <div><span className="section-kicker">КАТАЛОГ</span><h2>Всё для идеального климата</h2></div>
            <a href="#catalog">Все категории <span>→</span></a>
          </div>
          <div className="category-grid">
            {categories.map((item, index) => (
              <article className={`category-card ${item.tone} card-${index + 1}`} key={item.title}>
                <div>
                  {item.tag && <span className="category-tag">{item.tag}</span>}
                  <h3>{item.title}</h3><p>{item.note}</p>
                  {item.links && <nav className="category-links" aria-label={`Категории: ${item.title}`}>{item.links.map((link) => <a href={link.href} key={`${link.href}-${link.title}`}>{link.title}</a>)}</nav>}
                  {item.items && <ul className="category-items">{item.items.map((entry) => <li key={entry}>{entry}</li>)}</ul>}
                  {!item.links && <a className="category-more" href={item.items ? "https://parista.ru/catalog/vrf-sistemy/" : "#products"}>Смотреть <span>↗</span></a>}
                </div>
                <img src={asset(item.image)} alt="" />
              </article>
            ))}
          </div>
        </section>

        <section className="products-section section" id="products">
          <div className="wrap">
            <div className="section-heading products-heading">
              <div><span className="section-kicker">ВЫБОР ПОКУПАТЕЛЕЙ</span><h2>Популярное оборудование</h2></div>
              <div className="product-tabs" role="tablist">
                {["Хиты продаж", "Новинки", "Распродажа"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>{tab}</button>
                ))}
              </div>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.name}>
                  <div className="product-image">
                    <span className="badge">{activeTab === "Распродажа" ? "−10%" : product.badge}</span>
                    <button aria-label="Добавить в избранное">♡</button>
                    <img src={asset(product.image)} alt={`${product.brand} ${product.name}`} />
                  </div>
                  <span className="product-category">НАСТЕННЫЕ КОНДИЦИОНЕРЫ</span>
                  <h3><b>{product.brand}</b> {product.name}</h3>
                  <div className="specs"><span>Площадь <b>{product.area}</b></span><span>Шум <b>{product.noise}</b></span><span>Инвертор <b>{product.inverter}</b></span></div>
                  <div className="price-row"><strong>{product.price}</strong><button onClick={() => setCart(cart + 1)} aria-label={`Добавить ${product.name} в корзину`}>В корзину</button></div>
                  <label className="installation-option"><input type="checkbox" /><span aria-hidden="true" />Купить с установкой</label>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="project-banner wrap" id="projects">
          <div className="project-copy">
            <span className="section-kicker">PARISTA PRO</span>
            <h2>Установка, ремонт и обслуживание кондиционеров</h2>
            <p>Одна команда отвечает за результат: от замера и проекта до чистого монтажа и регулярного сервиса.</p>
            <div className="project-actions"><button className="primary">Рассчитать монтаж <span>→</span></button><a href="#projects">Посмотреть проекты</a></div>
          </div>
          <div className="project-image"><img src={asset("/service-guy.png")} alt="Специалист Parista выполняет монтаж кондиционера" /></div>
          <div className="project-fact"><b>1 500+</b><span>реализованных объектов</span></div>
        </section>

        <section className="about section wrap" id="about">
          <div className="about-copy"><span className="section-kicker">ПОЧЕМУ PARISTA</span><h2>Техника — это только начало комфорта</h2><p>Мы сохранили сильные стороны текущего сайта: широкий ассортимент, монтаж под ключ и сервис. В новой структуре покупателю проще пройти путь от задачи до готового решения.</p></div>
          <div className="benefits">
            <article><span>01</span><b>На рынке с 2008 года</b><p>Опыт в бытовых и промышленных системах.</p></article>
            <article><span>02</span><b>Гарантия качества</b><p>На оборудование и выполненные работы.</p></article>
            <article><span>03</span><b>Доступные цены</b><p>Решения под разный бюджет без переплат.</p></article>
            <article><span>04</span><b>Широкий ассортимент</b><p>Кондиционеры, вентиляция и аксессуары.</p></article>
          </div>
        </section>

        <section className="brands-section section wrap" id="brands">
          <h2>Бренды кондиционеров</h2>
          <div className="brands-grid">
            {brands.map((brand) => (
              <a href={brand.href} target="_blank" rel="noreferrer" className="brand-card" key={brand.name} aria-label={brand.name}>
                <img src={asset(brand.image)} alt={brand.name} />
              </a>
            ))}
          </div>
        </section>

        <section className="certificates-section comparison section" id="certificates">
          <div className="wrap certificates-inner">
            <div className="certificates-heading"><h2>Сертификаты</h2><a href="https://parista.ru/certificates/" target="_blank" rel="noreferrer">Смотреть все</a></div>
            <div className="certificates-grid">
              {certificates.map((certificate) => (
                <a className="certificate-card" href={asset(certificate.image)} target="_blank" rel="noreferrer" key={certificate.image}>
                  <span className="certificate-visual"><img src={asset(certificate.image)} alt={certificate.title} /></span>
                  <span>{certificate.title}</span>
                  <b aria-hidden="true">↗</b>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section wrap section" id="contacts">
          <div className="contact-copy"><span className="section-kicker">ОСТАЛИСЬ ВОПРОСЫ?</span><h2>Подберём решение для вашего пространства</h2><p>Оставьте номер — специалист Parista перезвонит, уточнит задачу и предложит подходящие варианты.</p><a href="tel:+74993808078">+7 (499) 380-80-78</a><span>info@parista.ru</span></div>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <label>Как к вам обращаться?<input placeholder="Ваше имя" required /></label>
            <label>Телефон<input inputMode="tel" placeholder="+7 (___) ___-__-__" required /></label>
            <fieldset className="captcha-field">
              <legend>Проверка, что вы не робот</legend>
              <div className="captcha-row">
                <div className="captcha-code" aria-label="Код с картинки">QPZTR</div>
                <label>Введите код с картинки <em>*</em><input name="captcha" autoComplete="off" required /></label>
              </div>
            </fieldset>
            <div className="consent-list">
              <label><input type="checkbox" required /><span aria-hidden="true" />Согласен на <a href="https://parista.ru/usloviya-ispolzovaniya/" target="_blank" rel="noreferrer">обработку персональных данных</a></label>
              <label><input type="checkbox" required /><span aria-hidden="true" />Ознакомлен с <a href="https://parista.ru/privacy-policy/" target="_blank" rel="noreferrer">политикой обработки персональных данных</a></label>
            </div>
            <button className="primary">Получить консультацию <span>→</span></button>
          </form>
        </section>
      </main>

      <footer>
        <div className="wrap footer-grid">
          <div><Logo /><p>Климатическое оборудование с установкой под ключ.</p><div className="socials"><span>VK</span><span>TG</span></div></div>
          <div><b>Покупателям</b><a href="#offers">Акции</a><a href="#catalog">Каталог</a><a href="#about">О нас</a><a href="#contacts">Доставка и оплата</a></div>
          <div><b>Услуги</b><a href="#services">Монтаж</a><a href="#services">Сервис</a><a href="#projects">Наши проекты</a><a href="#contacts">Гарантия</a></div>
          <div><b>Контакты</b><a className="footer-phone" href="tel:+74993808078">+7 (499) 380-80-78</a><a href="mailto:info@parista.ru">info@parista.ru</a></div>
        </div>
        <div className="wrap footer-bottom"><span>© Parista 2026. Все права защищены</span><a href="#contacts">Политика обработки персональных данных</a><span>Концепт редизайна</span></div>
      </footer>
    </div>
    </VisualEditorProvider>
  );
}
