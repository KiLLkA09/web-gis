import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { Point } from 'ol/geom';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';


const apiUrl = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=100&refine=cou_name_en%3A%22Russian%20Federation%22';

// Функция для масштабирования размера круга
function getCircleRadius(population) {
    const minRadius = 5;
    const maxRadius = 30;
    const minPopulation = 1000; // Минимальная популяция (API фильтрует по 1000)
    const maxPopulation = 20000000; // Примерное максимальное население (можно найти в данных)

    const radius = minRadius + (population - minPopulation) * (maxRadius - minRadius) / (maxPopulation - minPopulation);
    return radius;
}

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
        })
    ],
    view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
    }),
    overlays: [popupOverlay]
});

// Функция для получения данных о городах с API
async function fetchCities() {
    try {
        const response = await fetch(apiUrl);

        if (!response.ok) { // Проверяем статус ответа
            console.error(`Ошибка при получении данных: ${response.status} ${response.statusText}`);
            return; // Выходим из функции, если произошла ошибка
        }

        const data = await response.json();
        console.log(data); // Добавлено: выводим структуру данных в консоль

        if (data && data.results) { // Проверяем, что data и data.results определены
            // Обработка данных и создание features
            const cityFeatures = data.results.map(city => { // Изменили data.records на data.results
                if (!city.coordinates || typeof city.coordinates.lon !== 'number' || typeof city.coordinates.lat !== 'number') {
                    return null; // Пропускаем города с некорректными координатами
                }
                const { lon: longitude, lat: latitude } = city.coordinates; // Extract coordinates
                const coordinates = fromLonLat([longitude, latitude]);
                const radius = getCircleRadius(city.population);

                return {
                    geometry: new Point(coordinates),
                    style: new Style({
                        image: new CircleStyle({
                            radius: radius,
                            fill: new Fill({ color: 'rgba(255, 0, 0, 0.4)' }),
                            stroke: new Stroke({ color: '#ff0000', width: 1 })
                        })
                    }),
                    name: city.name,
                    population: city.population,
                    country: city.country_code
                };
            }).filter(city => city !== null); // Убираем null (города с неверными координатами)

            // Создание слоя с городами
            const citySource = new VectorSource({
                features: cityFeatures.map(feature => {
                    const { geometry, style, name, population, country } = feature;
                    const olFeature = new Feature({
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

            // Добавляем слой с городами на карту (удаляем старый слой, если есть)
            map.getLayers().forEach(layer => {
                if (layer instanceof VectorLayer) {
                    map.removeLayer(layer); // Удаление старого cityLayer, если он есть
                }
            });
            map.addLayer(cityLayer); // Добавление нового cityLayer

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
        } else {
            console.error('Ошибка: data или data.results не определены.');
        }


    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        // Обработка ошибки (отобразить сообщение пользователю, например)
    }
}

// Вызов функции для загрузки данных при загрузке страницы
fetchCities();

// Добавление события изменения размера окна для адаптивности
window.addEventListener('resize', () => {
  map.updateSize();
});