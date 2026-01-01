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
      title: '🎒 Генератор Списка',
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
    if (activePanel) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [activePanel]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPanel = (key) => {
    setActivePanel(key);
  };

  const closePanel = () => {
    setActivePanel(null);
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
        <div className="logo" onClick={scrollToTop}>ПУТЕШЕСТВИЕ В ОБЪЕКТИВЕ 🎥</div>
        <nav className="nav">
          <a href="#hero">Главная</a>
          <a href="#destinations">Направления</a>
          <a href="#roulette">Рулетка</a>
          <a href="#news">Новости</a>
          <a href="#team">Команда</a>
          <a href="#amy">С собакой</a>
          <a href="#contact">Контакты</a>
        </nav>
        
        {/* КНОПКА СОТРУДНИЧЕСТВО (ОРАНЖЕВАЯ) */}
        <a href="https://t.me/gavrilenko_ira" target="_blank" rel="noopener noreferrer" className="header-collab-btn">
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
          background: `url('/images/destinations-section-bg.jpg') no-repeat center center`,
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

      {/* РУЛЕТКА */}
      <section id="roulette" className="roulette-section" style={{ 
        background: `url('/images/stats-bg.jpg') no-repeat center center`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        padding: '80px 20px',
        borderTop: '1px solid #333'
      }}>
        <TravelRoulette />
      </section>

      {/* ВИДЖЕТЫ БРОНИРОВАНИЯ */}
      <section className="textured-bg" style={{ 
        padding: '80px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
         <TravelWidgets />
      </section>

      {/* СТАТИСТИКА */}
      <section style={{ 
        background: `url('/images/stats-bg.jpg') no-repeat center center`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        padding: '60px 0',
        borderTop: '1px solid #333' 
      }}>
        <Odometer />
      </section>

      {/* КОМАНДА */}
      <section id="team" className="textured-bg" style={{ padding: '100px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <TeamBlock />
      </section>

      {/* СОЦСЕТИ - ИСПРАВЛЕННЫЕ ИКОНКИ */}
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
                
                {/* VK: УЗНАВАЕМАЯ ИКОНКА */}
                <a href="https://vk.com/travel_in_lens" target="_blank" rel="noopener noreferrer" className="glass-row-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M15.07 2H8.93C5.1 2 2 5.1 2 8.93v6.14C2 18.9 5.1 22 8.93 22h6.14c3.83 0 6.93-3.1 6.93-6.93V8.93C22 5.1 18.9 2 15.07 2zm-1.29 16.2h-1.66c-3.6 0-5.71-2.46-5.83-6.55h1.77c.08 3 1.38 3.56 1.41 1.05h1.66v2.1c.96-.11 2.03-1.15 2.4-3.15h1.68c-.62 3.65-3.3 5.44-3.3 6.1v.45z"/></svg>
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
                {/* INSTAGRAM: УЗНАВАЕМАЯ ИКОНКА (КВАДРАТИК) */}
                <a href="https://instagram.com/travel_in_lens" target="_blank" rel="noopener noreferrer" className="glass-row-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
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

      {/* НОВОСТИ */}
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
                  <img src="/images/amy-docs.jpg" alt="Документы" />
                </div>
                <div className="item-info">
                  <h4 style={{color: 'white', marginTop: '15px', fontSize: '1.2rem'}}>📜 Документы</h4>
                  <p style={{color: '#ccc'}}>Ветпаспорт и справки</p>
                </div>
             </div>
             <div className="item-card" onClick={() => openPanel('meds')} style={{cursor: 'pointer'}}>
                <div className="item-img-wrap" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', height: '220px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                  <img src="/images/amy-meds.jpg" alt="Аптечка" />
                </div>
                <div className="item-info">
                  <h4 style={{color: 'white', marginTop: '15px', fontSize: '1.2rem'}}>💊 Аптечка</h4>
                  <p style={{color: '#ccc'}}>Что брать с собой</p>
                </div>
             </div>
             <div className="item-card" onClick={() => openPanel('hotel')} style={{cursor: 'pointer'}}>
                <div className="item-img-wrap" style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', height: '220px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                  <img src="/images/amy-hotel.jpg" alt="Отели" />
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
          background: `url('/images/tips-section-bg.jpg') no-repeat center center`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
      }}>
        <div className="content-wrap">
          <h2 style={{color: '#333'}}>💡 Гайды и Советы</h2>
          <p className="subtitle" style={{color: '#555'}}>Экономия и еда</p>
          
          <div className="placeholder-grid">
             <div className="img-card-btn" style={{ backgroundImage: "url('/images/tips-money.jpg')" }} onClick={() => openPanel('money')}>
                <div className="img-card-overlay">💰 Экономия</div>
             </div>
             <div className="img-card-btn" style={{ backgroundImage: "url('/images/tips-food.jpg')" }} onClick={() => openPanel('food')}>
                <div className="img-card-overlay">🍔 Гастро-туры</div>
             </div>
             <div className="img-card-btn" style={{ backgroundImage: "url('/images/tips-check.jpg')" }} onClick={() => openPanel('checklist')}>
                <div className="img-card-overlay">🎒 Чек-лист</div>
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
        background: `url('/images/vote-bg.jpg') no-repeat center center`,
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
        <a href="https://t.me/gavrilenko_ira" target="_blank" rel="noopener noreferrer" className="btn-action" style={{marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '10px'}}>
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