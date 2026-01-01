import React, { useState } from 'react';
import './App.css';

const AviasalesWidget = () => {
  const [origin, setOrigin] = useState(''); 
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (origin) params.append('origin_name', origin);
    if (destination) params.append('destination_name', destination);
    if (date) params.append('depart_date', date);
    
    // Открываем поиск
    const url = `https://www.aviasales.ru/?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="widget-container">
      <h3 style={{ 
        color: 'white', 
        textAlign: 'center', 
        marginBottom: '25px',
        textTransform: 'uppercase',
        fontFamily: 'Montserrat, sans-serif',
        textShadow: '0 2px 5px rgba(0,0,0,0.5)'
      }}>
        ✈️ ПОИСК ДЕШЕВЫХ АВИАБИЛЕТОВ
      </h3>

      <form onSubmit={handleSearch} className="widget-form">
        
        {/* Блок 1: ОТКУДА */}
        <div className="input-group">
          <label>ОТКУДА</label>
          <input 
            type="text" 
            placeholder="Город вылета" 
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
            // АВТОМАТИЧЕСКАЯ ЗАГЛАВНАЯ БУКВА
            style={{ color: '#333', textTransform: 'capitalize' }} 
          />
        </div>

        {/* Блок 2: КУДА */}
        <div className="input-group">
          <label>КУДА ЛЕТИМ?</label>
          <input 
            type="text" 
            placeholder="Город прибытия" 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            // АВТОМАТИЧЕСКАЯ ЗАГЛАВНАЯ БУКВА
            style={{ color: '#333', textTransform: 'capitalize' }}
          />
        </div>

        {/* Блок 3: ДАТА */}
        <div className="input-group">
          <label>ДАТА ВЫЛЕТА</label>
          <input 
            type="date" 
            value={date}
            min={new Date().toISOString().split('T')[0]} 
            onChange={(e) => setDate(e.target.value)}
            style={{ 
              color: '#333',
              cursor: 'pointer',
              background: 'white'
            }}
          />
        </div>

        {/* КНОПКА */}
        <button type="submit" className="search-btn">
          НАЙТИ
        </button>

      </form>
      
      <div style={{ textAlign: 'center', marginTop: '15px', opacity: 0.6, fontSize: '0.8rem', color: '#ccc' }}>
        Поиск осуществляется через Aviasales 🔵
      </div>
    </div>
  );
};

export default AviasalesWidget;