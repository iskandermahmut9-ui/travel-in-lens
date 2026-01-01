import React, { useState, useEffect } from 'react';
import './App.css';

const SmartChecklist = () => {
  // Настройки
  const [transport, setTransport] = useState('car'); // car | plane
  const [season, setSeason] = useState('summer');    // summer | winter
  const [pet, setPet] = useState(true);              // true | false

  const [items, setItems] = useState([]);

  // База вещей
  const allItems = [
    { id: 1, text: 'Паспорт РФ / Загран', tags: ['all'] },
    { id: 2, text: 'Деньги (нал + карты)', tags: ['all'] },
    { id: 3, text: 'Пауэрбанк + кабели', tags: ['all'] },
    { id: 4, text: 'Аптечка человеческая', tags: ['all'] },
    { id: 5, text: 'Ветпаспорт + Справки', tags: ['pet'] },
    { id: 6, text: 'Корм (с запасом на 2 дня)', tags: ['pet'] },
    { id: 7, text: 'Миски складные', tags: ['pet'] },
    { id: 8, text: 'Плед для собаки', tags: ['pet'] },
    { id: 9, text: 'Водительские права + СТС', tags: ['car'] },
    { id: 10, text: 'Домкрат + Запаска', tags: ['car'] },
    { id: 11, text: 'Термос с чаем', tags: ['car', 'winter'] },
    { id: 12, text: 'Подушка под шею', tags: ['plane', 'car'] },
    { id: 13, text: 'Билеты (скачать на телефон)', tags: ['plane'] },
    { id: 14, text: 'Наушники с шумоподавлением', tags: ['plane'] },
    { id: 15, text: 'Солнцезащитные очки', tags: ['summer'] },
    { id: 16, text: 'Крем SPF 50', tags: ['summer'] },
    { id: 17, text: 'Шапка и шарф', tags: ['winter'] },
    { id: 18, text: 'Гигиеническая помада', tags: ['winter'] },
    { id: 19, text: 'Купальник / Плавки', tags: ['summer'] },
    { id: 20, text: 'Термобелье', tags: ['winter'] },
  ];

  // Генерация списка при смене настроек
  useEffect(() => {
    const newItems = allItems.filter(item => {
      // Логика фильтрации
      const isCommon = item.tags.includes('all');
      const isTransport = item.tags.includes(transport);
      const isSeason = item.tags.includes(season);
      const isPet = pet && item.tags.includes('pet');
      
      // Если вещь "общая" ИЛИ подходит по транспорту ИЛИ сезону ИЛИ питомцу
      // Но при этом исключаем конфликты (например, зимние вещи летом)
      
      // Простой вариант:
      if (item.tags.includes('all')) return true;
      if (item.tags.includes('pet') && !pet) return false;
      if (item.tags.includes('pet') && pet) return true;
      
      // Проверка на совпадение хотя бы одного тега из выбранных условий
      const activeTags = [transport, season];
      return item.tags.some(tag => activeTags.includes(tag));
    });
    
    // Добавляем поле checked
    setItems(newItems.map(i => ({ ...i, checked: false })));
  }, [transport, season, pet]);

  const toggleCheck = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <div className="checklist-wrapper">
      <div className="checklist-controls">
        <div className="control-row">
          <button className={transport === 'car' ? 'active' : ''} onClick={() => setTransport('car')}>🚗 На авто</button>
          <button className={transport === 'plane' ? 'active' : ''} onClick={() => setTransport('plane')}>✈️ Самолет</button>
        </div>
        <div className="control-row">
          <button className={season === 'summer' ? 'active' : ''} onClick={() => setSeason('summer')}>☀️ Лето</button>
          <button className={season === 'winter' ? 'active' : ''} onClick={() => setSeason('winter')}>❄️ Зима</button>
        </div>
        <div className="control-row">
          {/* Было "С Эми", стало "С животным" */}
          <button className={pet ? 'active' : ''} onClick={() => setPet(true)}>🐕 С животным</button>
          <button className={!pet ? 'active' : ''} onClick={() => setPet(false)}>🚶‍♂️ Без</button>
        </div>
      </div>

      <div className="checklist-items">
        {items.map(item => (
          <div 
            key={item.id} 
            className={`check-row ${item.checked ? 'done' : ''}`}
            onClick={() => toggleCheck(item.id)}
          >
            <div className="check-box">{item.checked ? '✔' : ''}</div>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      
      <div className="checklist-footer">
        Всего вещей: {items.length} | Собрано: {items.filter(i => i.checked).length}
      </div>
    </div>
  );
};

export default SmartChecklist;