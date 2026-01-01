import React, { useState, useEffect } from 'react';
import './App.css';

const LiveStatus = () => {
  // --- СОСТОЯНИЯ ДЛЯ ДАННЫХ ---
  const [time, setTime] = useState('');
  const [weather, setWeather] = useState(null);
  const [currency, setCurrency] = useState(null);

  // 1. ЖИВОЕ ВРЕМЯ (Тикает каждую секунду)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. ЖИВАЯ ПОГОДА (Москва)
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61&current_weather=true')
      .then(res => res.json())
      .then(data => setWeather(Math.round(data.current_weather.temperature)))
      .catch(e => console.error(e));
  }, []);

  // 3. ЖИВОЙ КУРС ВАЛЮТ
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        const usd = data.rates.RUB.toFixed(1);
        const eur = (data.rates.RUB / data.rates.EUR).toFixed(1); // Считаем евро через кросс-курс
        setCurrency({ usd, eur });
      })
      .catch(e => console.error(e));
  }, []);

  // --- КОНТЕНТ: СТАРОЕ + НОВОЕ ---
  const tickerContent = (
    <>
      {/* Твои оригинальные статусы */}
      <span className="ticker-item">
        🚗 Статус: <strong>Монтируем выпуск</strong>
      </span>
      <span className="ticker-separator">///</span>

      <span className="ticker-item">
        🎧 В наушниках: <strong>Легкий рок</strong>
      </span>
      <span className="ticker-separator">///</span>

      <span className="ticker-item">
        📍 Сейчас: <strong>Москва</strong>
      </span>
      <span className="ticker-separator">///</span>

      {/* Новые полезные фишки */}
      <span className="ticker-item">
        🕒 Время: <strong>{time}</strong>
      </span>
      <span className="ticker-separator">///</span>

      {weather !== null && (
        <>
          <span className="ticker-item">
            ☀️ Погода: <strong>{weather > 0 ? `+${weather}` : weather}°C</strong>
          </span>
          <span className="ticker-separator">///</span>
        </>
      )}

      {currency && (
        <>
          <span className="ticker-item">
            💰 Курс: <strong>$ {currency.usd} / € {currency.eur}</strong>
          </span>
          <span className="ticker-separator">///</span>
        </>
      )}
    </>
  );

  return (
    <div className="live-status-container">
      <div className="ticker-track">
        <div className="ticker-content">
          {/* Дублируем 4 раза для бесконечной ленты без дыр */}
          {tickerContent}
          {tickerContent}
          {tickerContent}
          {tickerContent}
        </div>
      </div>
    </div>
  );
};

export default LiveStatus;