import { useState, useMemo } from 'react';
import { myTrips } from './tripsData'; 
import './App.css';

function Destinations() {
  const [activeTab, setActiveTab] = useState('moscow'); 

  // Формы "клякс"
  const blobShapes = [
    "60% 40% 30% 70% / 60% 30% 70% 40%", 
    "30% 70% 70% 30% / 30% 30% 70% 70%", 
    "50% 50% 20% 80% / 25% 80% 20% 75%", 
    "70% 30% 30% 70% / 60% 40% 60% 40%", 
    "40% 60% 70% 30% / 50% 60% 30% 60%", 
    "30% 70% 50% 50% / 30% 30% 70% 70%", 
    "75% 25% 20% 80% / 75% 45% 55% 25%", 
    "60% 40% 30% 70% / 70% 30% 70% 30%", 
    "40% 60% 60% 40% / 40% 40% 60% 60%", 
    "20% 80% 20% 80% / 50% 60% 40% 50%"  
  ];

  const destinationsData = useMemo(() => {
    const asiaKeywords = ['турция', 'аланья', 'махмутлар', 'анкара', 'стамбул', 'конья', 'казахстан', 'атырау', 'уральск', 'озинки', 'грузия', 'тбилиси', 'абхазия', 'сухум'];
    const europeKeywords = ['кипр'];

    const moscowItems = myTrips.filter(t => t.city.toLowerCase().includes('москва'));
    const europeItems = myTrips.filter(t => europeKeywords.some(k => t.city.toLowerCase().includes(k)));
    const asiaItems = myTrips.filter(t => asiaKeywords.some(k => t.city.toLowerCase().includes(k)));
    const russiaItems = myTrips.filter(t => {
      const city = t.city.toLowerCase();
      return !city.includes('москва') && !europeKeywords.some(k => city.includes(k)) && !asiaKeywords.some(k => city.includes(k));
    });

    return {
      moscow: { title: "Москва", items: moscowItems },
      russia: { title: "Россия", items: russiaItems },
      asia:   { title: "Азия", items: asiaItems },
      europe: { title: "Европа", items: europeItems }
    };
  }, []);

  return (
    <div className="destinations-container">
      
      <h2 className="section-title">КУДА ОТПРАВИМСЯ?</h2>

      {/* Табы */}
      <div className="tabs-row">
        <button className={`tab-btn ${activeTab === 'moscow' ? 'active' : ''}`} onClick={() => setActiveTab('moscow')}>🕌 МОСКВА</button>
        <button className={`tab-btn ${activeTab === 'russia' ? 'active' : ''}`} onClick={() => setActiveTab('russia')}>🇷🇺 РОССИЯ</button>
        <button className={`tab-btn ${activeTab === 'asia' ? 'active' : ''}`} onClick={() => setActiveTab('asia')}>🌏 АЗИЯ</button>
        <button className={`tab-btn ${activeTab === 'europe' ? 'active' : ''}`} onClick={() => setActiveTab('europe')}>🏰 ЕВРОПА</button>
      </div>

      {/* Сетка результатов */}
      <div className="items-grid fade-in">
        {destinationsData[activeTab].items.length === 0 ? (
          <p style={{textAlign: 'center', width: '100%', color: '#fff', fontSize: '1.2rem'}}>В этом разделе пока нет видео.</p>
        ) : (
          destinationsData[activeTab].items.map((item, index) => {
            const randomShape = blobShapes[index % blobShapes.length];

            return (
              <a 
                key={item.id} 
                href={item.videoLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="item-card-link"
              >
                <div className="item-card blob-style">
                  <div 
                    className="item-img-wrap"
                    style={{ borderRadius: randomShape }} 
                  >
                    <img src={item.img} alt={item.city} />
                    {/* КНОПКА PLAY */}
                    <div className="play-overlay">
                       <div className="play-icon">▶</div>
                    </div>
                  </div>
                  <div className="item-info">
                    {/* Только заголовок */}
                    <h4>{item.city}</h4>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>

    </div>
  );
}

export default Destinations;