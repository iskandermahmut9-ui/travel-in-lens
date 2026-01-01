import React, { useState } from 'react';
import './App.css';

const TravelRoulette = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState("Куда поехать?");
  const [showConfetti, setShowConfetti] = useState(false);

  const destinations = [
    "⛰ Дагестан: Горы зовут!",
    "🏰 Калининград: Европа рядом!",
    "🕌 Казань: Чак-чак ждет!",
    "🌊 Сочи: Море и пальмы!",
    "🌲 Карелия: Леса и озера!",
    "🏔 Алтай: Место силы!",
    "🐻 Камчатка: К медведям!",
    "🌉 Питер: По крышам!",
    "🌄 Северная Осетия: Пироги и виды!",
    "❄️ Мурманск: Северное сияние!",
    "🇹🇷 Турция (Стамбул): История и Босфор!",
    "🏖 Турция (Анталья): Всё включено!",
    "🇨🇳 Китай (Пекин): Великая стена!",
    "🏙 Китай (Шанхай): Киберпанк уже тут!",
    "🏝 Китай (Хайнань): Тропический рай!",
    "🇦🇪 ОАЭ (Дубай): Роскошь пустыни!",
    "🇹🇭 Таиланд: Том-Ям и массаж!",
    "🇬🇪 Грузия: Хинкали и вино!",
    "🇦🇲 Армения: Вид на Арарат!",
    "🇰🇵 КНДР: Путешествие во времени!"
  ];

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowConfetti(false);
    let counter = 0;
    const maxSpins = 25; 
    
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * destinations.length);
      setResult(destinations[random]);
      counter++;

      if (counter > maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }, 80);
  };

  return (
    <div className="roulette-container">
      <h2>🎲 Не знаешь, куда рвануть?</h2>
      <p className="subtitle">Доверься судьбе!</p>
      
      {/* СТЕКЛЯННАЯ ПЛАШКА */}
      <div className="roulette-glass-plate">
        <div className="roulette-display">
          {result}
        </div>
      </div>

      <button 
        className={`btn-action roulette-btn ${isSpinning ? 'spinning' : ''}`} 
        onClick={spin}
      >
        {isSpinning ? 'Выбираем...' : '🌀 КРУТИТЬ РУЛЕТКУ'}
      </button>

      {showConfetti && <div className="confetti">🎉</div>}
    </div>
  );
};

export default TravelRoulette;