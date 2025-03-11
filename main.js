import 'ol/ol.css'; // Import OpenLayers styles
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj'; // Import fromLonLat
import Overlay from 'ol/Overlay';
import { Point } from 'ol/geom'; // Добавлено!
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'; // Добавлено!
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source'; // Добавлено!

// Увеличенный список городов (пример) - можете еще расширить
const cities = [
    { name: 'Tokyo', country: 'JP', population: 37833000, longitude: 139.75, latitude: 35.69 },
    { name: 'Delhi', country: 'IN', population: 31000000, longitude: 77.20, latitude: 28.61 },
    { name: 'Shanghai', country: 'CN', population: 27058000, longitude: 121.47, latitude: 31.23 },
    { name: 'Sao Paulo', country: 'BR', population: 22043000, longitude: -46.63, latitude: -23.55 },
    { name: 'Cairo', country: 'EG', population: 21750000, longitude: 31.23, latitude: 30.04 },
    { name: 'London', country: 'GB', population: 8982000, longitude: -0.12, latitude: 51.51 },
    { name: 'New York', country: 'US', population: 8804000, longitude: -74.00, latitude: 40.71 },
    { name: 'Sydney', country: 'AU', population: 5312000, longitude: 151.21, latitude: -33.87 },
    { name: 'Moscow', country: 'RU', population: 13010000, longitude: 37.62, latitude: 55.75 },
    { name: 'St. Petersburg', country: 'RU', population: 5384000, longitude: 30.31, latitude: 59.93 },  // Добавлен
    { name: 'Kazan', country: 'RU', population: 1257000, longitude: 49.12, latitude: 55.79 },  // Добавлен
    { name: 'Novosibirsk', country: 'RU', population: 1612000, longitude: 82.93, latitude: 55.03 },  // Добавлен
    { name: 'Yekaterinburg', country: 'RU', population: 1495000, longitude: 60.61, latitude: 56.83 },  // Добавлен
    { name: 'Nizhny Novgorod', country: 'RU', population: 1252000, longitude: 44.00, latitude: 56.32 },  // Добавлен
    { name: 'Chelyabinsk', country: 'RU', population: 1196000, longitude: 61.40, latitude: 55.16 },  // Добавлен
    { name: 'Samara', country: 'RU', population: 1157000, longitude: 50.15, latitude: 53.20 },  // Добавлен
    { name: 'Omsk', country: 'RU', population: 1178000, longitude: 73.37, latitude: 54.95 },  // Добавлен
    { name: 'Rostov-on-Don', country: 'RU', population: 1130000, longitude: 39.72, latitude: 47.23 },  // Добавлен
    { name: 'Ufa', country: 'RU', population: 1129000, longitude: 56.02, latitude: 54.74 },  // Добавлен
    { name: 'Krasnoyarsk', country: 'RU', population: 1093000, longitude: 92.86, latitude: 56.01 },  // Добавлен
    { name: 'Voronezh', country: 'RU', population: 1058000, longitude: 39.20, latitude: 51.67 },  // Добавлен
    { name: 'Perm', country: 'RU', population: 1055000, longitude: 56.23, latitude: 58.01 },  // Добавлен

    { name: 'Johannesburg', country: 'ZA', population: 5960000, longitude: 28.04, latitude: -26.20 },
    { name: 'Mexico City', country: 'MX', population: 21919000, longitude: -99.13, latitude: 19.43 },
    { name: 'Paris', country: 'FR', population: 2141000, longitude: 2.35, latitude: 48.86 },
    { name: 'Toronto', country: 'CA', population: 2794000, longitude: -79.38, latitude: 43.65 },
    { name: 'Rio de Janeiro', country: 'BR', population: 6718903, longitude: -43.17, latitude: -22.91 },
    { name: 'Lagos', country: 'NG', population: 14862000, longitude: 3.39, latitude: 6.52 },
    { name: 'Los Angeles', country: 'US', population: 3971000, longitude: -118.24, latitude: 34.05 },
    { name: 'Jakarta', country: 'ID', population: 10770000, longitude: 106.82, latitude: -6.18 },
    { name: 'Buenos Aires', country: 'AR', population: 3075000, longitude: -58.38, latitude: -34.60 },
    { name: 'Istanbul', country: 'TR', population: 15462000, longitude: 28.98, latitude: 41.01 },
    { name: 'Karachi', country: 'PK', population: 14910000, longitude: 67.01, latitude: 24.86 },
    { name: 'Kolkata', country: 'IN', population: 14900000, longitude: 88.36, latitude: 22.57 },
    { name: 'Dhaka', country: 'BD', population: 21000000, longitude: 90.41, latitude: 23.72 },
    { name: 'Kinshasa', country: 'CD', population: 14970000, longitude: 15.32, latitude: -4.33 },
    { name: 'Tianjin', country: 'CN', population: 13866000, longitude: 117.20, latitude: 39.13 },
    { name: 'Guangzhou', country: 'CN', population: 18735000, longitude: 113.26, latitude: 23.13 },
    { name: 'Bangkok', country: 'TH', population: 10539000, longitude: 100.50, latitude: 13.75 },
    { name: 'Tehran', country: 'IR', population: 9387000, longitude: 51.39, latitude: 35.68 },
    { name: 'Ho Chi Minh City', country: 'VN', population: 8993000, longitude: 106.66, latitude: 10.76 },
    { name: 'Chicago', country: 'US', population: 2746000, longitude: -87.62, latitude: 41.88 },
    { name: 'Madrid', country: 'ES', population: 3223000, longitude: -3.70, latitude: 40.42 },
    { name: 'Rome', country: 'IT', population: 2860000, longitude: 12.49, latitude: 41.90 },
    { name: 'Seoul', country: 'KR', population: 9776000, longitude: 126.98, latitude: 37.57 },
    { name: 'Mumbai', country: 'IN', population: 12478000, longitude: 72.88, latitude: 19.07 },
    { name: 'Osaka', country: 'JP', population: 2750000, longitude: 135.50, latitude: 34.69 },
    { name: 'Johannesburg', country: 'ZA', population: 5635000, longitude: 28.04, latitude: -26.20 },
    { name: 'Sydney', country: 'AU', population: 5312000, longitude: 151.21, latitude: -33.87 },
    { name: 'Casablanca', country: 'MA', population: 3350000, longitude: -7.60, latitude: 33.57 },
    { name: 'Hanoi', country: 'VN', population: 8053000, longitude: 105.85, latitude: 21.02 },
    { name: 'Bogota', country: 'CO', population: 7412000, longitude: -74.07, latitude: 4.71 },
    { name: 'Lima', country: 'PE', population: 9752000, longitude: -77.03, latitude: -12.04 },
    { name: 'Nairobi', country: 'KE', population: 4397000, longitude: 36.82, latitude: -1.29 },
    { name: 'Addis Ababa', country: 'ET', population: 5278000, longitude: 38.75, latitude: 9.02 },
    { name: 'Dar es Salaam', country: 'TZ', population: 5381000, longitude: 39.27, latitude: -6.79 },
    { name: 'Manila', country: 'PH', population: 14180000, longitude: 120.98, latitude: 14.59 },
    { name: 'Kyiv', country: 'UA', population: 2952000, longitude: 30.52, latitude: 50.45 }
];

// Функция для масштабирования размера круга в зависимости от населения
function getCircleRadius(population) {
    // Настройка масштабирования (можете настроить по своему желанию)
    const minRadius = 5; // Минимальный радиус
    const maxRadius = 30; // Максимальный радиус
    const minPopulation = Math.min(...cities.map(city => city.population)); // Минимальное население
    const maxPopulation = Math.max(...cities.map(city => city.population)); // Максимальное население

    // Линейное масштабирование
    const radius = minRadius + (population - minPopulation) * (maxRadius - minRadius) / (maxPopulation - minPopulation);
    return radius;
}

// Создание векторов для городов
const cityFeatures = cities.map(city => {
    const coordinates = fromLonLat([city.longitude, city.latitude]); // Преобразование координат
    const radius = getCircleRadius(city.population);

    return {
        geometry: new Point(coordinates),
        style: new Style({
            image: new CircleStyle({
                radius: radius,
                fill: new Fill({ color: 'rgba(255, 0, 0, 0.4)' }), // Красные круги с прозрачностью
                stroke: new Stroke({ color: '#ff0000', width: 1 }) // Обводка кругов
            })
        }),
        name: city.name,
        population: city.population,
        country: city.country
    };
});

// Создание слоя с городами
import Feature from 'ol/Feature'; // Добавили импорт
const citySource = new VectorSource({
    features: cityFeatures.map(feature => {
        const { geometry, style, name, population, country } = feature;
        const olFeature = new Feature({ // Теперь Feature, а не ol.Feature
            geometry: geometry,
            name: name,
            population: population,
            country: country
        });
        olFeature.setStyle(style);
        return olFeature;
    })
});

const cityLayer = new VectorLayer({
    source: citySource
});

// Создание overlay для отображения информации о городе
const popup = document.createElement('div');
popup.id = 'popup';
document.body.appendChild(popup);

const popupOverlay = new Overlay({
    element: popup,
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

// Создание карты
const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        }),
        cityLayer
    ],
    view: new View({
        center: fromLonLat([0, 0]), // Центр карты (начальный)
        zoom: 2 // Начальный масштаб
    }),
    overlays: [popupOverlay] // Добавление overlay на карту
});

// Обработчик для отображения информации о городе при клике
map.on('click', (event) => {
    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
        if (feature) {
            const name = feature.get('name');
            const population = feature.get('population');
            const country = feature.get('country');
            const coordinate = feature.getGeometry().getCoordinates();

            // Формирование контента для popup
            const content = `<b>${name}, ${country}</b><br>Population: ${population.toLocaleString()}`;

            // Установка контента и позиции для overlay
            popupOverlay.getElement().innerHTML = content;
            popupOverlay.setPosition(coordinate);
        } else {
            // Если клик не на городе, скрываем popup
            popupOverlay.setPosition(undefined);
        }
    });
});

// Добавление события изменения размера окна для адаптивности
window.addEventListener('resize', () => {
  map.updateSize(); // Обновление размера карты при изменении размера окна
});