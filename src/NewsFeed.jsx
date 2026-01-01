import React, { useState, useEffect } from 'react';
import './App.css';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Функция загрузки новостей
  const fetchNews = async () => {
    setLoading(true);
    setError(false);

    // 1. Рамблер Путешествия (Самые активные в праздники)
    const feed1 = 'https://travel.rambler.ru/rss/';
    // 2. Лента.ру Путешествия
    const feed2 = 'https://lenta.ru/rss/articles/travel';
    // 3. АТОР (Официальные, но в праздники молчат)
    const feed3 = 'https://www.atorus.ru/rss/news';

    // Трюк против кеширования: добавляем случайное число к запросу
    const timeBuster = Date.now(); 

    try {
      // Пробуем Рамблер
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed1)}&api_key=kq9b3524y6w7x8254553255&t=${timeBuster}`);
      const data = await res.json();

      if (data.status === 'ok' && data.items.length > 0) {
        setNews(data.items.slice(0, 6)); // Берем 6 свежих
      } else {
        throw new Error("Rambler empty");
      }
    } catch (err) {
      console.log("Рамблер спит, будим Ленту...");
      try {
        // Пробуем Ленту
        const res2 = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed2)}&t=${timeBuster}`);
        const data2 = await res2.json();
        setNews(data2.items.slice(0, 6));
      } catch (e) {
        console.log("Все спят :(");
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция для поиска картинки в RSS (они вечно прячут их в разных местах)
  const getImage = (item) => {
    if (item.enclosure?.link) return item.enclosure.link;
    if (item.thumbnail) return item.thumbnail;
    // Ищем в описании
    const imgMatch = item.description?.match(/src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];
    return '/images/hero-bg.jpg'; // Заглушка
  };

  return (
    <div className="news-container">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>НОВОСТИ ТУРИЗМА</h2>
        <button 
          onClick={fetchNews} 
          style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', 
            transition: 'transform 0.5s', transform: loading ? 'rotate(360deg)' : 'none'
          }}
          title="Обновить новости"
        >
          🔄
        </button>
      </div>
      
      {loading && <div style={{ textAlign: 'center', color: '#666' }}>Загружаем свежие сплетни...</div>}
      
      {!loading && error && (
        <div style={{ textAlign: 'center', color: '#666' }}>
          Источники отдыхают. Попробуйте позже. 🎄
        </div>
      )}

      <div className="news-grid">
        {!loading && news.map((item, index) => (
          <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="news-card">
            <div className="news-img-wrap">
              <img 
                src={getImage(item)} 
                alt="news" 
                onError={(e) => {e.target.onerror = null; e.target.src = '/images/hero-bg.jpg'}} 
              />
              <div className="news-date">{formatDate(item.pubDate)}</div>
            </div>
            
            <div className="news-content">
              <h4>{item.title}</h4>
              <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
                <span className="news-btn">ЧИТАТЬ</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;