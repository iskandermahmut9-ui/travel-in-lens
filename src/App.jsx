import React, { useState, useEffect } from 'react';
import TravelMap from './TravelMap';
import Destinations from './Destinations';
import LiveStatus from './LiveStatus';
import Odometer from './Odometer';
import VoteBlock from './VoteBlock';
import GearHotspots from './GearHotspots';
import TravelWidgets from './TravelWidgets';
import NewsFeed from './NewsFeed';
import TravelRoulette from './TravelRoulette';
import TeamBlock from './TeamBlock';
import SmartChecklist from './SmartChecklist';
import './App.css';

function App() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const panelData = {
    'docs': {
      title: '📜 Документы',
      position: 'left',
      content: (
        <>
          <p><strong>Для путешествий с собакой по России вам понадобятся:</strong></p>
          <p>1. Ветеринарный паспорт с действующими прививками (особенно от бешенства, сделанной не позднее года и не ранее 30 дней).</p>
          <p>2. Обработка от паразитов (отметки в паспорте).</p>
          <p><strong>Для выезда за границу:</strong></p>
          <p>1. Чипирование (обязательно ДО прививки от бешенства).</p>
          <p>2. Справка Форма №1 (получается в госклинике за 5 дней до вылета).</p>
          <p>3. Евросправка (обменивается на ветконтроле в аэропорту).</p>
          <p>4. Титры антител к бешенству (для Турции, Грузии, Израиля и ЕС при возвращении).</p>
        </>
      )
    },
    'meds': {
      title: '💊 Аптечка для Эми',
      position: 'center',
      content: (
        <>
          <p><strong>Базовый набор:</strong></p>
          <p>🔹 Сорбенты (Энтеросгель) — при отравлении.</p>
          <p>🔹 Антигистаминные (Супрастин) — от аллергии и укусов насекомых.</p>
          <p>🔹 Хлоргексидин — для промывания ран.</p>
          <p>🔹 Самофиксирующийся бинт (очень удобно для лап).</p>
          <p>🔹 Электронный градусник.</p>
          <p>🔹 Средство от укачивания (Серения или аналоги).</p>
          <p>Не забудьте запас корма на первые дни!</p>
        </>
      )
    },
    'hotel': {
      title: '🏨 Dog-friendly Отели',
      position: 'right',
      content: (
        <>
          <p><strong>Как мы ищем жилье:</strong></p>
          <p>Мы используем фильтр "Можно с питомцами" на островках и яндекс.путешествиях, но ВСЕГДА звоним в отель перед бронированием.</p>
          <p><strong>Нюансы:</strong></p>
          <p>1. Часто есть доплата за собаку (от 500 до 2000р).</p>
          <p>2. Могут попросить залог (депозит) на случай порчи имущества.</p>
          <p>3. Уточняйте ограничение по весу! Многие пишут "можно с собакой", но имеют в виду только шпицев до 5 кг.</p>
        </>
      )
    },
    'money': {
      title: '💰 Экономия',
      position: 'left',
      content: (
        <>
          <p><strong>Как путешествовать дешевле?</strong></p>
          <p>1. <strong>Жилье:</strong> Снимайте квартиры с кухней. Готовка завтраков дома экономит до 30% бюджета поездки.</p>
          <p>2. <strong>Билеты:</strong> Покупайте билеты во вторник или среду ночью, алгоритмы часто снижают цены в это время.</p>
          <p>3. <strong>Карты лояльности:</strong> Копите мили. Мы оплачиваем перелеты накопленными милями банка за покупки продуктов.</p>
        </>
      )
    },
    'food': {
      title: '🍔 Гастро-туры',
      position: 'center',
      content: (
        <>
          <p><strong>Наши правила еды:</strong></p>
          <p>Мы всегда пробуем 3 локальных блюда в новом регионе.</p>
          <p>📍 <strong>Дагестан:</strong> Чуду с тыквой и Курзе.</p>
          <p>📍 <strong>Калининград:</strong> Строганина из пеламиды и Марципан.</p>
          <p>📍 <strong>Казань:</strong> Эчпочмак и Чак-чак.</p>
          <p>Смотрите наши обзоры кафе на YouTube!</p>
        </>
      )
    },
    'checklist': {
      title: '🎒 Онлайн чек-лист',
      position: 'right',
      content: <SmartChecklist />
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowScrollBtn(true);
      else setShowScrollBtn(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (activePanel || menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [activePanel, menuOpen]);

  // --- OBSERVER (Авто-наведение) ---
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -25% 0px', 
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('hover-active');
        } else {
          entry.target.classList.remove('hover-active');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const targets = [
       ...document.querySelectorAll('.odo-item'),        
       ...document.querySelectorAll('.news-card'),        
       ...document.querySelectorAll('.gear-card'),        
       ...document.querySelectorAll('.team-photo-wrap'),  
       ...document.querySelectorAll('.glass-row-btn'),    
       ...document.querySelectorAll('.vote-card'),        
       ...document.querySelectorAll('.img-card-btn'), 
       ...document.querySelectorAll('#amy .item-card') 
    ];

    targets.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPanel = (key) => {
    setActivePanel(key);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const currentPanelData = activePanel ? panelData[activePanel] : null;

  return (
    <div className="app-container">
      <div className={`scroll-top-btn ${showScrollBtn ? 'visible' : ''}`} onClick={scrollToTop}>⬆</div>

      <div className={`panel-overlay-backdrop ${activePanel ? 'visible' : ''}`} onClick={closePanel}></div>

      {/* ШТОРКИ */}
      <div className={`panel-drawer panel-left ${currentPanelData?.position === 'left' ? 'open' : ''}`}>
        <button className="panel-close-btn" onClick={closePanel}>✕</button>
        <div className="panel-content">
          <h3>{currentPanelData?.title}</h3>
          {currentPanelData?.content}
        </div>
      </div>

      <div className={`panel-drawer panel-center ${currentPanelData?.position === 'center' ? 'open' : ''}`}>
        <button className="panel-close-btn" onClick={closePanel}>✕</button>
        <div className="panel-content">
          <h3>{currentPanelData?.title}</h3>
          {currentPanelData?.content}
        </div>
      </div>

      <div className={`panel-drawer panel-right ${currentPanelData?.position === 'right' ? 'open' : ''}`}>
        <button className="panel-close-btn" onClick={closePanel}>✕</button>
        <div className="panel-content">
          <h3>{currentPanelData?.title}</h3>
          {currentPanelData?.content}
        </div>
      </div>

      {/* ШАПКА */}
      <header className="header">
        <div className="header-top-row">
           <div className="logo" onClick={scrollToTop}>ПУТЕШЕСТВИЕ В ОБЪЕКТИВЕ 🎥</div>
           <div className={`burger-icon ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
             <span></span><span></span><span></span>
           </div>
        </div>
        
        <div className="mobile-collab-wrapper">
             <a href="https://t.me/gavrilenko_ira" target="_blank" rel="noopener noreferrer" className="header-collab-btn mobile-btn">Сотрудничество</a>
        </div>

        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <a href="#hero" onClick={() => setMenuOpen(false)}>Главная</a>
          <a href="#destinations" onClick={() => setMenuOpen(false)}>Направления</a>
          <a href="#roulette" onClick={() => setMenuOpen(false)}>Рулетка</a>
          <a href="#news" onClick={() => setMenuOpen(false)}>Новости</a>
          <a href="#team" onClick={() => setMenuOpen(false)}>Команда</a>
          <a href="#amy" onClick={() => setMenuOpen(false)}>С собакой</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Контакты</a>
          <a href="https://t.me/gavrilenko_ira" className="nav-collab-link" onClick={() => setMenuOpen(false)}>Сотрудничество</a>
        </nav>
        
        <a href="https://t.me/gavrilenko_ira" target="_blank" rel="noopener noreferrer" className="header-collab-btn desktop-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
          Сотрудничество
        </a>
      </header>

      <LiveStatus />

      <section id="hero" className="hero">
        <h1>ПУТЕШЕСТВУЕМ. СНИМАЕМ. ПОКАЗЫВАЕМ.</h1>
        <p>Ира, Саша, Дима и хвостатая Эми. Открываем Россию и Мир.</p>
        <div className="hero-features">
          <span>🍔 Еда</span><span>🗺️ Маршруты</span><span>💰 Экономия</span><span>🐕 Pet-friendly</span>
        </div>
        <a href="#map" className="btn-action">🎬 Смотреть карту видео</a>
      </section>

      <section id="destinations" style={{ 
          background: `url('./images/destinations-section-bg.jpg') no-repeat center center`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          padding: '80px 20px'
      }}>
         <Destinations />
      </section>

      <section id="map" className="map-section textured-bg">
        <h2>📍 Интерактивная карта</h2>
        <p>Нажмите на метку, чтобы увидеть видео из поездки</p>
        <div className="map-window">
           <TravelMap />
        </div>
      </section>

      <section id="roulette" className="roulette-section" style={{ 
        background: `url('./images/stats-bg.jpg') no-repeat center center`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        padding: '80px 20px',
        borderTop: '1px solid #333'
      }}>
        <TravelRoulette />
      </section>

      <section className="textured-bg" style={{ 
        padding: '80px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
         <TravelWidgets />
      </section>

      <section style={{ 
        backgroundImage: `url('./images/vote-bg.jpg')`, 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'center center', 
        backgroundSize: 'cover', 
        backgroundAttachment: 'fixed', 
        padding: '60px 0',
        borderTop: '1px solid #333',
        width: '100%' 
      }}>
        <Odometer />
      </section>

      <section id="team" className="textured-bg" style={{ padding: '100px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <TeamBlock />
      </section>

      <section id="social-hub" className="textured-bg" style={{ padding: '100px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="content-wrap wide-wrap">
          <h2 style={{ color: 'white', marginBottom: '10px', fontSize: '2.5rem' }}>🌐 Где нас найти</h2>
          <p className="subtitle" style={{ color: '#aaa', marginBottom: '60px', fontSize: '1.2rem' }}>Все наши площадки в один клик</p>
          <div className="social-columns-grid">
            <div className="social-col">
              <h3>Посмотреть</h3>
              <div className="social-stack">
                <a href="https://rutube.ru/u/travelinlens/" target="_blank" rel="noopener noreferrer" className="glass-row-btn">
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4.5L19 12L5 19.5V4.5Z" /></svg><span>RuTube</span>
                </a>
                
                {/* ВК - ОБНОВЛЕННАЯ ОФИЦИАЛЬНАЯ ИКОНКА */}
                <a href="https://vk.com/travel_in_lens" target="_blank" rel="noopener noreferrer" className="glass-row-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.92 5.35c.14-.46.05-.79-.65-.79h-2.15c-.55 0-.8.29-.94.61 0 0-1.1 2.64-2.66 4.36-.51.51-.74.67-1.01.67-.14 0-.34-.16-.34-.61V5.35c0-.55-.16-.79-.62-.79h-3.4c-.34 0-.55.25-.55.53 0 .56.84.69.93 2.27V10c0 .75-.13.89-.42.89-.77 0-2.64-2.79-3.75-5.97C4.19 4.37 3.97 4.15 3.4 4.15H1.25c-.62 0-.75.29-.75.61 0 .57.73 3.42 3.4 8.16 2.37 4.33 5.7 6.67 8.71 6.67 1.81 0 2.03-.41 2.03-1.11v-2.57c0-.77.16-.88.7-.88.4 0 1.08.2 2.67 1.73 1.81 1.81 2.11 2.83 3.13 2.83h2.15c.62 0 .93-.31.75-.92-.2-.59-.87-1.45-1.77-2.47-.49-.58-1.21-1.21-1.43-1.52-.31-.4-.22-.58 0-.94 0 0 2.52-3.55 2.78-4.75z"/>
                  </svg>
                  <span>ВКонтакте</span>
                </a>
                
                <a href="https://www.youtube.com/@travel_in_lens" target="_blank" rel="noopener noreferrer" className="glass-row-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg><span>YouTube</span>
                </a>
              </div>
            </div>
            <div className="social-col">
              <h3>Почитать</h3>
              <div className="social-stack">
                <a href="https://dzen.ru/travel_in_lens" target="_blank" rel="noopener noreferrer" className="glass-row-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg><span>Дзен</span>
                </a>
              </div>
            </div>
            <div className="social-col">
              <h3>Онлайн</h3>
              <div className="social-stack">
                
                {/* INSTAGRAM - ОБНОВЛЕННАЯ ОФИЦИАЛЬНАЯ ИКОНКА */}
                <a href="https://instagram.com/travel_in_lens" target="_blank" rel="noopener noreferrer" className="glass-row-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22H7.75A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5zm8.5 2.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm-4.25 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 1.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                
                <a href="https://t.me/travel_in_lens" target="_blank" rel="noopener noreferrer" className="glass-row-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg><span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="news" className="tech-cross-bg" style={{ padding: '80px 20px' }}>
        <NewsFeed />
      </section>

      <section id="amy" className="info-section green-bg textured-bg" style={{ padding: '100px 20px' }}>
        <div className="content-wrap">
          <h2 style={{color: 'white', marginBottom: '10px'}}>🐕 Путешествия с Эми</h2>
          <p className="subtitle" style={{color: '#ddd', marginBottom: '50px'}}>Нишевая польза для собачников</p>
          
          <div className="items-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
             <div className="item-card" onClick={() => openPanel('docs')} style={{cursor: 'pointer'}}>
                <div className="item-img-wrap" style={{ borderRadius: '40% 60% 70% 30% / 50% 60% 30% 60%', height: '220px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                  <img src="./images/amy-docs.jpg" alt="Документы" />
                </div>
                <div className="item-info">
                  <h4 style={{color: 'white', marginTop: '15px', fontSize: '1.2rem'}}>📜 Документы</h4>
                  <p style={{color: '#ccc'}}>Ветпаспорт и справки</p>
                </div>
             </div>
             <div className="item-card" onClick={() => openPanel('meds')} style={{cursor: 'pointer'}}>
                <div className="item-img-wrap" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', height: '220px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                  <img src="./images/amy-meds.jpg" alt="Аптечка" />
                </div>
                <div className="item-info">
                  <h4 style={{color: 'white', marginTop: '15px', fontSize: '1.2rem'}}>💊 Аптечка</h4>
                  <p style={{color: '#ccc'}}>Что брать с собой</p>
                </div>
             </div>
             <div className="item-card" onClick={() => openPanel('hotel')} style={{cursor: 'pointer'}}>
                <div className="item-img-wrap" style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', height: '220px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                  <img src="./images/amy-hotel.jpg" alt="Отели" />
                </div>
                <div className="item-info">
                  <h4 style={{color: 'white', marginTop: '15px', fontSize: '1.2rem'}}>🏨 Dog-friendly</h4>
                  <p style={{color: '#ccc'}}>Где нам рады</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section id="tips" className="info-section" style={{
          background: `url('./images/tips-section-bg.jpg') no-repeat center center`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
      }}>
        <div className="content-wrap">
          <h2 style={{color: '#333'}}>💡 Гайды и Советы</h2>
          <p className="subtitle" style={{color: '#555'}}>Экономия и еда</p>
          
          <div className="placeholder-grid">
             <div className="img-card-btn" style={{ backgroundImage: "url('./images/tips-money.jpg')" }} onClick={() => openPanel('money')}>
                <div className="img-card-overlay">💰 Экономия</div>
             </div>
             <div className="img-card-btn" style={{ backgroundImage: "url('./images/tips-food.jpg')" }} onClick={() => openPanel('food')}>
                <div className="img-card-overlay">🍔 Гастро-туры</div>
             </div>
             <div className="img-card-btn" style={{ backgroundImage: "url('./images/tips-check.jpg')" }} onClick={() => openPanel('checklist')}>
                <div className="img-card-overlay" style={{flexDirection: 'column'}}>
                  <span>🎒 Онлайн чек-лист</span>
                  <span style={{fontSize: '0.9rem', marginTop: '10px', fontWeight: '600', textTransform: 'none'}}>(попробуй, тебе понравится)</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section id="gear" className="gear-section textured-bg">
        <div className="content-wrap">
          <h2>🎥 На что мы снимаем</h2>
          <p style={{color: '#aaa', marginBottom: '30px'}}>Нажмите, чтобы посмотреть детали</p>
          <GearHotspots />
        </div>
      </section>

      <section style={{ 
        background: `url('./images/vote-bg.jpg') no-repeat center center`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        padding: '80px 20px',
        borderTop: '1px solid #333'
      }}>
        <VoteBlock />
      </section>

      <section id="contact" className="contact-section green-bg textured-bg" style={{ padding: '100px 20px' }}>
        <h2>Сотрудничество</h2>
        <p>Есть предложение? Напишите нам!</p>
        <a href="https://t.me/gavrilenko_ira" target="_blank" rel="noopener noreferrer" className="btn-action" style={{marginTop: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg> Telegram
        </a>
      </section>

      <footer className="footer textured-bg">
        <p>© 2025 <a href="https://by-alex.ru/" className="dev-link">by AL☰X</a><br/>Все права защищены.</p>
        <p style={{ fontSize: '10px', opacity: 0.4 }}>Map data © OpenStreetMap contributors</p>
      </footer>
    </div>
  );
}

export default App;