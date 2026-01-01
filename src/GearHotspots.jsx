import React from 'react';
import './App.css';

const gearData = [
  {
    id: 1,
    title: "DJI Mini 2\nFly More Combo",
    link: "https://store.dji.com/product/mini-2-combo?vid=99471",
    img: "https://se-cdn.djiits.com/tpc/uploads/carousel/image/408497bfeb9bacb9af7db445bfdc51d2@ultra.jpg"
  },
  {
    id: 2,
    title: "DJI Pocket 2\nCreator Combo",
    link: "https://store.dji.com/product/pocket-2-combo?vid=98661",
    img: "https://se-cdn.djiits.com/tpc/uploads/carousel/image/95752848b0b65e0f53301b4c313588fc@ultra.jpg"
  },
  {
    id: 3,
    title: "Osmo Action 4\nAdventure Combo",
    link: "https://store.dji.com/product/osmo-action-4-adventure-combo?vid=144681",
    img: "https://se-cdn.djiits.com/tpc/uploads/carousel/image/5d6f65b6499e2665ee67ac772b4718e5@ultra.webp"
  },
  {
    id: 4,
    title: "FIFINE T683\nUSB Condenser",
    link: "https://fifinemicrophone.com/collections/microphones/products/fifine-t683-usb-microphone-bundle",
    img: "https://fifinemicrophone.com/cdn/shop/products/FIFINET683USBMicrophoneKit.jpg?v=1640145447&width=990"
  },
  {
    id: 5,
    title: "Hollyland LARK M2\nCombo Version",
    link: "https://www.hollyland.com/product/lark-m2",
    img: "https://cdn.hollyland.com/file/product/6301/choosev2/combo-black-box.png"
  },
  {
    id: 6,
    title: "Hollyland LARK A1\nDuo Version",
    link: "https://www.hollyland.com/product/lark-a1",
    img: "https://cdn.hollyland.com/file/product/larka1/acc-middle3.png"
  },
  {
    id: 7,
    title: "Acer Nitro V 15\nAMD",
    link: "https://www.acer.com/de-de/laptops/nitro",
    img: "https://avatars.mds.yandex.net/get-mpic/5194288/k_plus_zvs3bXZZ4LRKY2CM5R6v/optimize"
  },
  {
    id: 8,
    title: "Adobe\nPremiere Pro",
    link: "https://www.adobe.com/ru/wam/ppro.html",
    img: "https://macrosoft.store/1304-large_default/adobe-premiere-pro-2023-windows.jpg"
  }
];

const GearHotspots = () => {
  return (
    <div className="gear-cards-grid">
      {gearData.map((item) => (
        <a 
          key={item.id} 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="gear-card"
          style={{ backgroundImage: `url('${item.img}')` }}
        >
          <div className="gear-overlay">
            {/* whiteSpace: 'pre-line' позволяет работать переносу строки \n */}
            <h3 className="gear-title" style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
              {item.title}
            </h3>
            <span className="gear-btn">Подробнее</span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default GearHotspots;