import React, { useState, useEffect } from 'react';
import './App.css';

const VoteBlock = () => {
  const [votes, setVotes] = useState({ opt1: 0, opt2: 0 });
  const [userVoted, setUserVoted] = useState(null); 
  const [animate, setAnimate] = useState(false);

  // Опции (Исправлено на Калининград)
  const option1 = "Беларусь 🇧🇾";
  const option2 = "Калининград 🏰"; 

  useEffect(() => {
    // 1. Проверяем выбор пользователя
    const savedVote = localStorage.getItem('travelVoteChoice');
    if (savedVote) {
      setUserVoted(savedVote);
    }

    // 2. Генерируем случайные голоса
    const randomVotes1 = Math.floor(Math.random() * 800) + 400; 
    const randomVotes2 = Math.floor(Math.random() * 800) + 400; 

    setVotes({ opt1: randomVotes1, opt2: randomVotes2 });
    
    // Запуск анимации
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleVote = (option) => {
    if (userVoted) return; 

    setVotes(prev => ({
      ...prev,
      [option]: prev[option] + 1
    }));

    setUserVoted(option);
    localStorage.setItem('travelVoteChoice', option); 
  };

  // ФУНКЦИЯ СБРОСА (Для тестов)
  const resetTestVote = (e) => {
    e.stopPropagation();
    localStorage.removeItem('travelVoteChoice');
    setUserVoted(null);
    setAnimate(false);
    setTimeout(() => setAnimate(true), 100);
  };

  const total = votes.opt1 + votes.opt2;
  const percent1 = total === 0 ? 50 : Math.round((votes.opt1 / total) * 100);
  const percent2 = total === 0 ? 50 : 100 - percent1;

  return (
    <div className="vote-container">
      <h2 style={{ color: '#333' }}>🔥 СЛЕДУЮЩИЙ ТРИП?</h2>
      <p className="subtitle">Помогите нам выбрать направление</p>

      {/* Кнопка сброса (видна только если уже проголосовал) */}
      {userVoted && (
        <button onClick={resetTestVote} style={{marginBottom: '15px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', opacity: 0.7}}>
          🔄 Сбросить голос (Тест)
        </button>
      )}

      <div className="vote-grid">
        
        {/* КАРТОЧКА 1 */}
        <div 
          className={`vote-card ${userVoted === 'opt1' ? 'voted' : ''}`} 
          style={{ backgroundImage: "url('/images/vote-1.jpg')" }} 
          onClick={() => handleVote('opt1')}
        >
          <div className="vote-dimmer"></div>
          
          <div 
            className="vote-bar" 
            style={{ 
              height: animate ? `${percent1}%` : '0%',
              // Прозрачные цвета (0.75)
              background: userVoted === 'opt1' 
                ? 'rgba(27, 58, 43, 0.75)'   // Прозрачный зеленый
                : 'rgba(255, 87, 34, 0.75)'  // Прозрачный оранжевый
            }}
          ></div>
          
          <div className="vote-content">
            <h3>{option1}</h3>
            {userVoted ? (
              <div className="vote-result">
                {percent1}%
              </div>
            ) : (
              <button className="vote-btn">Голосовать</button>
            )}
          </div>
        </div>

        {/* КАРТОЧКА 2 */}
        <div 
          className={`vote-card ${userVoted === 'opt2' ? 'voted' : ''}`} 
          style={{ backgroundImage: "url('/images/vote-2.jpg')" }} 
          onClick={() => handleVote('opt2')}
        >
          <div className="vote-dimmer"></div>
          
          <div 
            className="vote-bar" 
            style={{ 
              height: animate ? `${percent2}%` : '0%',
              background: userVoted === 'opt2' 
                ? 'rgba(27, 58, 43, 0.75)' 
                : 'rgba(255, 87, 34, 0.75)' 
            }}
          ></div>
          
          <div className="vote-content">
            <h3>{option2}</h3>
            {userVoted ? (
              <div className="vote-result">
                {percent2}%
              </div>
            ) : (
              <button className="vote-btn">Голосовать</button>
            )}
          </div>
        </div>

      </div>
      
      {userVoted && (
        <p style={{ marginTop: '20px', color: '#666', fontWeight: 'bold' }}>
          Спасибо! Ваш голос учтен. ✅
        </p>
      )}
    </div>
  );
};

export default VoteBlock;