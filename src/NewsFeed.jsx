import React, { useState, useEffect } from 'react';
import './App.css';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Список источников (самые активные)
  const feeds = [
    'https://lenta.ru/rss/articles/travel',           // Лента
    'https://ria.ru/export/rss2/tourism/index.xml',   // РИА Новости (очень активный)
    'https://www.atorus.ru/rss/news',                 // АТОР (Вестник туроператоров)
    'https://tourism.interfax.ru/rss.xml'             // Интерфакс Туризм (запасной)
  ];

  // Твой ключ от rss2json (если он перестанет работать, можно создать новый бесплатно на rss2json.com)
  const API_KEY = 'ek92e7bakejfim7qlsm5peoyhobxtziyycp2clhj'; 

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    
    // Число чтобы избежать кеша браузера
    const timeBuster = Date.now();
    
    try {
      // Запускаем скачивание со всех источников ОДНОВРЕМЕННО
      const requests = feeds.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}&api_key=${API_KEY}&count=5&t=${timeBuster}`)
        .then(res => res.json())
        .catch(err => null) // Если один источник упал, не ломаем остальные
      );

      const results = await Promise.all(requests);
      
      let allNews = [];

      // Собираем всё в одну кучу
      results.forEach(data => {
        if (data && data.status === 'ok' && data.items) {
          allNews = [...allNews, ...data.items];
        }
      });

      if (allNews.length === 0) {
        throw new Error("No news found");
      }

      // Сортируем по дате (сначала новые)
      allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      // Убираем дубликаты (иногда бывают одинаковые новости) и берем 6 штук
      const uniqueNews = [];
      const titles = new Set();
      
      for (const item of allNews) {
        if (!titles.has(item.title) && uniqueNews.length < 6) {
          titles.add(item.title);
          uniqueNews.push(item);
        }
      }

      setNews(uniqueNews);

    } catch (err) {
      console.error("Ошибка загрузки новостей:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Проверка на некорректную дату (на всякий случай)
    if (isNaN(date)) return dateString; 
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImage = (item) => {
    // 1. Ищем в стандартном поле enclosure
    if (item.enclosure?.link) return item.enclosure.link;
    if (item.thumbnail) return item.thumbnail;
    
    // 2. РИА Новости часто кладет картинку в description, но без тега img src, а просто ссылкой? 
    // Обычно rss2json вытаскивает её в enclosure.
    
    // 3. Пытаемся найти src внутри description (HTML)
    const imgMatch = item.description?.match(/src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];

    return '/images/hero-bg.jpg'; // Заглушка если совсем ничего нет
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
      
      {loading && <div style={{ textAlign: 'center', color: '#666' }}>Собираем свежие новости по всему миру...</div>}
      
      {!loading && error && (
        <div style={{ textAlign: 'center', color: '#666' }}>
          Новости пока недоступны. Возможно, лимит запросов исчерпан. 😔
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