import React from 'react';
import './App.css';

const TeamBlock = () => {
  const team = [
    {
      name: "Ира",
      role: "Голос и Душа",
      desc: "Придумывает маршруты и красиво говорит в кадре",
      img1: "/images/team-ira-1.jpg", 
      img2: "/images/team-ira-2.jpg"  
    },
    {
      name: "Саша",
      role: "Глаз и Монтаж",
      desc: "Видит мир через объектив и не спит ночами",
      img1: "/images/team-alex-1.jpg",
      img2: "/images/team-alex-2.jpg"
    },
    {
      name: "Дима",
      role: "Тексты и Дегустация",
      desc: "Главный критик всего, знайте кому нужно угодить",
      img1: "/images/team-dima-1.jpg",
      img2: "/images/team-dima-2.jpg"
    },
    {
      name: "Эми",
      role: "Главный пассажир",
      desc: "Контроль качества сосисок и обнимашек",
      img1: "/images/team-amy-1.jpg",
      img2: "/images/team-amy-2.jpg"
    }
  ];

  return (
    <div className="team-container wide-wrap">
      <h2 style={{ color: 'white', marginBottom: '10px', fontSize: '2.5rem' }}>👋 Команда</h2>
      <p className="subtitle" style={{ color: '#aaa', marginBottom: '50px' }}>Лица за кадром (наведите, чтобы узнать правду)</p>
      
      <div className="team-grid">
        {team.map((member, index) => (
          // Добавили класс team-card-interactive для эффектов
          <div key={index} className="team-card team-card-interactive">
            <div className="team-photo-wrap">
              <img src={member.img1} alt={member.name} className="photo-main" 
                   onError={(e) => {e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x400/333/ccc?text=PHOTO'}} />
              <img src={member.img2} alt={member.name} className="photo-hover" 
                   onError={(e) => {e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x400/FF5722/fff?text=FUNNY'}} />
            </div>
            <div className="team-info">
              <h3>{member.name}</h3>
              <div className="team-role">{member.role}</div>
              <p>{member.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamBlock;