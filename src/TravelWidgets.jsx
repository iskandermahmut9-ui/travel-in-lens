import React, { useState } from 'react';
import './App.css';

const TravelWidgets = () => {
  // ТВОЙ ID ПАРТНЕРА
  const MARKER = '560281'; 

  const [activeTab, setActiveTab] = useState('flights'); // flights | trains | housing | tours

  // Состояние полей
  // АВИА и ЖД
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [dateStart, setDateStart] = useState('');
  
  // ЖИЛЬЕ и ТУРЫ
  const [city, setCity] = useState(''); 
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Юридическая информация
  const legalInfo = {
    flights: "Реклама. Go Travel Un Limited. ИНН 58937560",
    trains: "Реклама. ООО «Новые Туристические Технологии». ИНН 7724929270",
    housing: "Реклама. ООО «Суточно.ру». ИНН 7709908155",
    tours: "Реклама. ООО «Тревел Технологии». ИНН 7731340252"
  };

  // ✈️ 1. AVIASALES (Умный поиск работает!)
  const handleFlightSearch = (e) => {
    e.preventDefault();
    
    if (origin && destination) {
      // Прямая ссылка на поиск с параметрами
      // Формат даты должен быть YYYY-MM-DD (html input date так и отдаёт)
      const url = `https://www.aviasales.ru/search?origin_name=${encodeURIComponent(origin)}&destination_name=${encodeURIComponent(destination)}&depart_date=${dateStart}&marker=${MARKER}&with_request=true`;
      window.open(url, '_blank');
    } else {
      // Если поля пустые — ведем на главную через рефералку
      window.open('https://aviasales.tpx.lt/1LGp6wNq', '_blank');
    }
  };

  // 🚂 2. TUTU (Поиск по названиям сложен, ведем на главную)
  const handleTrainSearch = (e) => {
    e.preventDefault();
    // Tutu требует ID станций, а не названия. 
    // Оставляем реферальный редирект на главную.
    window.open('https://tutu.tpx.lt/Iv3kOyyx', '_blank');
  };

  // 🏠 3. SUTOCHNO (Умный поиск работает!)
  const handleHousingSearch = (e) => {
    e.preventDefault();
    
    if (city) {
      // Прямая ссылка на поиск Суточно
      // guests_adults=2 (по умолчанию ищем на двоих)
      const url = `https://sutochno.ru/front/searchapp/search?query=${encodeURIComponent(city)}&date_begin=${checkIn}&date_end=${checkOut}&guests_adults=2&marker=${MARKER}`;
      window.open(url, '_blank');
    } else {
      window.open('https://sutochno.tpx.lt/umu1GYNc', '_blank');
    }
  };

  // 🏖 4. TRAVELATA (Сложный поиск, ведем на главную)
  const handleTourSearch = (e) => {
    e.preventDefault();
    window.open('https://travelata.tpx.lt/HLQGEsWZ', '_blank');
  };

  return (
    <div className="widget-container">
      
      <h3 style={{ 
        color: 'white', 
        textAlign: 'center', 
        marginBottom: '20px',
        textTransform: 'uppercase',
        fontFamily: 'Montserrat, sans-serif',
        textShadow: '0 2px 5px rgba(0,0,0,0.5)'
      }}>
        🌍 ЗАБРОНИРУЙ СВОЕ ПУТЕШЕСТВИЕ
      </h3>

      {/* --- ВКЛАДКИ --- */}
      <div className="widget-tabs">
        <button 
          className={`widget-tab ${activeTab === 'flights' ? 'active' : ''}`}
          onClick={() => setActiveTab('flights')}
        >
          ✈️ Авиа
        </button>
        <button 
          className={`widget-tab ${activeTab === 'trains' ? 'active' : ''}`}
          onClick={() => setActiveTab('trains')}
        >
          🚂 Ж/Д
        </button>
        <button 
          className={`widget-tab ${activeTab === 'housing' ? 'active' : ''}`}
          onClick={() => setActiveTab('housing')}
        >
          🏠 Жилье
        </button>
        <button 
          className={`widget-tab ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          🏖 Туры
        </button>
      </div>

      {/* --- ФОРМА 1: АВИА --- */}
      {activeTab === 'flights' && (
        <form onSubmit={handleFlightSearch} className="widget-form fade-in">
          <div className="input-group">
            <label>ОТКУДА</label>
            <input 
              type="text" 
              placeholder="Москва" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)} 
              required
            />
          </div>
          <div className="input-group">
            <label>КУДА</label>
            <input 
              type="text" 
              placeholder="Сочи" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
              required
            />
          </div>
          <div className="input-group">
            <label>ДАТА</label>
            <input 
              type="date" 
              value={dateStart} 
              onChange={(e) => setDateStart(e.target.value)} 
            />
          </div>
          <button type="submit" className="search-btn" style={{ background: '#FF5722' }}>Найти</button>
        </form>
      )}

      {/* --- ФОРМА 2: Ж/Д --- */}
      {activeTab === 'trains' && (
        <form onSubmit={handleTrainSearch} className="widget-form fade-in">
          <div className="input-group">
            <label>ОТКУДА</label>
            <input type="text" placeholder="Москва" />
          </div>
          <div className="input-group">
            <label>КУДА</label>
            <input type="text" placeholder="Санкт-Петербург" />
          </div>
          <div className="input-group">
            <label>ДАТА</label>
            <input type="date" />
          </div>
          <button type="submit" className="search-btn" style={{ background: '#D32F2F' }}>Поезд</button>
        </form>
      )}

      {/* --- ФОРМА 3: ЖИЛЬЕ --- */}
      {activeTab === 'housing' && (
        <form onSubmit={handleHousingSearch} className="widget-form fade-in">
          <div className="input-group" style={{ flex: 2 }}>
            <label>КУДА ЕДЕМ?</label>
            <input 
              type="text" 
              placeholder="Город (например: Казань)" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              required
            />
          </div>
          <div className="input-group">
            <label>ЗАЕЗД</label>
            <input 
              type="date" 
              value={checkIn} 
              onChange={(e) => setCheckIn(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label>ВЫЕЗД</label>
            <input 
              type="date" 
              value={checkOut} 
              onChange={(e) => setCheckOut(e.target.value)} 
            />
          </div>
          <button type="submit" className="search-btn" style={{ background: '#2196F3' }}>Жилье</button>
        </form>
      )}

      {/* --- ФОРМА 4: ТУРЫ --- */}
      {activeTab === 'tours' && (
        <form onSubmit={handleTourSearch} className="widget-form fade-in">
          <div className="input-group" style={{ flex: 2 }}>
            <label>КУДА ХОТИТЕ В ТУР?</label>
            <input type="text" placeholder="Турция / Египет" />
          </div>
          <div className="input-group">
            <label>ДАТА ВЫЛЕТА</label>
            <input type="date" />
          </div>
          <button type="submit" className="search-btn" style={{ background: '#FF4040' }}>Найти Тур</button>
        </form>
      )}

      {/* ДИНАМИЧЕСКАЯ ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        opacity: 0.5, 
        fontSize: '0.65rem', 
        color: '#ccc',
        fontFamily: 'Open Sans, sans-serif' 
      }}>
        {legalInfo[activeTab]}
      </div>

    </div>
  );
};

export default TravelWidgets;