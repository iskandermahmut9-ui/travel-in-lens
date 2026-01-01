import React from 'react';
import './App.css';

const Odometer = () => {
  const stats = [
    { 
      icon: "🗺️", 
      value: "34/89", 
      label: "Субъектов РФ" 
    },
    { 
      icon: "🌍", 
      value: "11/205", 
      label: "Стран мира" 
    },
    { 
      icon: "🛣️", 
      // Используем неразрывный пробел для разделения тысяч
      value: "9\u00A0430", 
      label: "Пройдено км" 
    },
    { 
      icon: "☕", 
      value: "152", 
      label: "Чашек кофе" 
    },
    { 
      icon: "🦴", 
      value: "89", 
      label: "Вкусняшек Эми" 
    },
    { 
      icon: "🎥", 
      value: "12 TB", 
      label: "Отснято материала" 
    }
  ];

  return (
    <div className="odometer-section">
      {stats.map((item, index) => (
        <div key={index} className="odo-item">
          <div className="odo-icon">{item.icon}</div>
          {/* Добавили класс для длинных значений, чтобы уменьшить шрифт если надо */}
          <div className={`odo-number ${item.value.length > 6 ? 'long-value' : ''}`}>
            {item.value}
          </div>
          <div className="odo-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default Odometer;