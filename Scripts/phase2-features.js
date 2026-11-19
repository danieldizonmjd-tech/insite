/**
 * InSite Phase 2 Enhanced Features
 * Advanced functionality for transit, parks, and community features
 */

class Phase2Features {
    constructor(map) {
        this.map = map;
        this.realTimeTransitData = new Map();
        this.parkReviews = this.loadReviews();
        this.parkPhotos = this.loadPhotos();
        this.bikeShareStations = [];
        this.userFavorites = this.loadFavorites();
        this.weatherData = null;
        this.updateInterval = null;
    }

    // ==================== REAL-TIME TRANSIT TRACKING ====================
    
    async initRealTimeTransit() {
        console.log('🚀 Initializing real-time transit tracking...');
        
        // In production, this would connect to GTFS-RT feeds
        // For now, we'll simulate real-time data
        this.updateInterval = setInterval(() => this.updateTransitPositions(), 30000);
        
        return this.simulateRealTimeData();
    }

    async simulateRealTimeData() {
        // Simulated real-time arrival predictions
        const mockArrivals = {
            'MARTA': [
                { route: '1', stop: 'Five Points', arrival: 3, delay: 0 },
                { route: '2', stop: 'Peachtree Center', arrival: 7, delay: 2 },
                { route: '3', stop: 'Lindbergh', arrival: 12, delay: -1 }
            ],
            'CobbLinc': [
                { route: '10', stop: 'Cumberland', arrival: 5, delay: 1 },
                { route: '20', stop: 'Town Center', arrival: 15, delay: 0 }
            ]
        };

        this.realTimeTransitData = mockArrivals;
        return mockArrivals;
    }

    updateTransitPositions() {
        console.log('🔄 Updating real-time transit positions...');
        // Update marker positions based on real-time data
        this.simulateRealTimeData();
    }

    getRealTimeArrivals(stopId) {
        // Return predicted arrivals for a specific stop
        const arrivals = [];
        for (const [agency, predictions] of Object.entries(this.realTimeTransitData)) {
            predictions.forEach(pred => {
                arrivals.push({
                    agency,
                    ...pred,
                    formattedTime: this.formatArrivalTime(pred.arrival, pred.delay)
                });
            });
        }
        return arrivals.sort((a, b) => (a.arrival + a.delay) - (b.arrival + b.delay));
    }

    formatArrivalTime(minutes, delay) {
        const totalMinutes = minutes + delay;
        if (totalMinutes <= 0) return 'Arriving Now';
        if (totalMinutes === 1) return '1 min';
        return `${totalMinutes} mins`;
    }

    // ==================== PARK REVIEWS SYSTEM ====================

    loadReviews() {
        const stored = localStorage.getItem('insite_park_reviews');
        return stored ? JSON.parse(stored) : {};
    }

    saveReviews() {
        localStorage.setItem('insite_park_reviews', JSON.stringify(this.parkReviews));
    }

    addParkReview(parkId, parkName, rating, comment, userName = 'Anonymous') {
        if (!this.parkReviews[parkId]) {
            this.parkReviews[parkId] = {
                parkName,
                reviews: [],
                averageRating: 0
            };
        }

        const review = {
            id: Date.now(),
            rating: Math.max(1, Math.min(5, rating)), // Ensure 1-5 range
            comment,
            userName,
            date: new Date().toISOString(),
            helpful: 0
        };

        this.parkReviews[parkId].reviews.unshift(review);
        this.updateAverageRating(parkId);
        this.saveReviews();

        return review;
    }

    updateAverageRating(parkId) {
        const parkData = this.parkReviews[parkId];
        if (parkData && parkData.reviews.length > 0) {
            const sum = parkData.reviews.reduce((acc, r) => acc + r.rating, 0);
            parkData.averageRating = (sum / parkData.reviews.length).toFixed(1);
        }
    }

    getParkReviews(parkId) {
        return this.parkReviews[parkId] || { parkName: '', reviews: [], averageRating: 0 };
    }

    markReviewHelpful(parkId, reviewId) {
        const parkData = this.parkReviews[parkId];
        if (parkData) {
            const review = parkData.reviews.find(r => r.id === reviewId);
            if (review) {
                review.helpful = (review.helpful || 0) + 1;
                this.saveReviews();
            }
        }
    }

    generateReviewHTML(parkId, parkName) {
        const parkData = this.getParkReviews(parkId);
        const reviews = parkData.reviews.slice(0, 5); // Show top 5

        const starsHTML = (rating) => {
            return '⭐'.repeat(Math.floor(rating)) + 
                   (rating % 1 >= 0.5 ? '✨' : '') +
                   '☆'.repeat(Math.floor(5 - rating));
        };

        let html = `
            <div style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: #fff; font-size: 16px;">⭐ Reviews</h4>
                    ${parkData.averageRating > 0 ? 
                        `<div style="font-size: 20px; font-weight: 700; color: #FFD700;">
                            ${parkData.averageRating} ${starsHTML(parseFloat(parkData.averageRating))}
                        </div>` : 
                        '<span style="color: #999; font-size: 12px;">No reviews yet</span>'
                    }
                </div>
        `;

        if (reviews.length > 0) {
            html += '<div style="max-height: 200px; overflow-y: auto; margin: 10px 0;">';
            reviews.forEach(review => {
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #4f46e5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <strong style="color: #fff; font-size: 13px;">${review.userName}</strong>
                            <span style="font-size: 14px;">${starsHTML(review.rating)}</span>
                        </div>
                        <p style="margin: 8px 0; color: #ddd; font-size: 12px; line-height: 1.5;">${review.comment}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                            <span style="color: #999; font-size: 11px;">${new Date(review.date).toLocaleDateString()}</span>
                            <button onclick="markReviewHelpful('${parkId}', ${review.id})" 
                                    style="background: none; border: none; color: #999; font-size: 11px; cursor: pointer;">
                                👍 Helpful (${review.helpful || 0})
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += `
            <button onclick="openReviewForm('${parkId}', '${parkName}')" 
                    style="width: 100%; padding: 10px; background: linear-gradient(135deg, #4f46e5, #6366f1); 
                           border: none; color: white; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px;">
                ✍️ Write a Review
            </button>
        </div>
        `;

        return html;
    }

    // ==================== PHOTO GALLERIES ====================

    loadPhotos() {
        const stored = localStorage.getItem('insite_park_photos');
        return stored ? JSON.parse(stored) : {};
    }

    savePhotos() {
        localStorage.setItem('insite_park_photos', JSON.stringify(this.parkPhotos));
    }

    addParkPhoto(parkId, photoUrl, caption = '', userName = 'Anonymous') {
        if (!this.parkPhotos[parkId]) {
            this.parkPhotos[parkId] = [];
        }

        const photo = {
            id: Date.now(),
            url: photoUrl,
            caption,
            userName,
            date: new Date().toISOString(),
            likes: 0
        };

        this.parkPhotos[parkId].unshift(photo);
        this.savePhotos();
        return photo;
    }

    getParkPhotos(parkId) {
        return this.parkPhotos[parkId] || [];
    }

    generatePhotoGalleryHTML(parkId) {
        const photos = this.getParkPhotos(parkId).slice(0, 6);

        if (photos.length === 0) {
            return `
                <div style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; text-align: center;">
                    <p style="color: #999; margin: 10px 0;">📸 No photos yet</p>
                    <button onclick="openPhotoUpload('${parkId}')" 
                            style="padding: 8px 16px; background: linear-gradient(135deg, #06b6d4, #0ea5e9); 
                                   border: none; color: white; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Upload First Photo
                    </button>
                </div>
            `;
        }

        let html = `
            <div style="margin: 15px 0;">
                <h4 style="margin: 0 0 10px 0; color: #fff; font-size: 16px;">📸 Photo Gallery</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
        `;

        photos.forEach(photo => {
            html += `
                <div style="position: relative; padding-bottom: 100%; background: rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; cursor: pointer;"
                     onclick="viewPhoto('${photo.url}', '${photo.caption}')">
                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white;">
                        🖼️
                    </div>
                    ${photo.caption ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); padding: 5px; font-size: 10px; color: white;">${photo.caption}</div>` : ''}
                </div>
            `;
        });

        html += `
                </div>
                <button onclick="openPhotoUpload('${parkId}')" 
                        style="width: 100%; padding: 8px; background: rgba(255,255,255,0.1); 
                               border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; 
                               font-weight: 600; cursor: pointer; margin-top: 10px;">
                    + Add Photo
                </button>
            </div>
        `;

        return html;
    }

    // ==================== BIKE SHARE INTEGRATION ====================

    async loadBikeShareData() {
        console.log('🚴 Loading bike share stations...');

        // Simulated bike share data for Atlanta area
        // In production, this would fetch from Relay Bike Share API or similar
        this.bikeShareStations = [
            { id: 1, name: 'Centennial Olympic Park', lat: 33.7631, lng: -84.3926, bikes: 8, docks: 15, ebikes: 3 },
            { id: 2, name: 'Georgia Tech Campus', lat: 33.7756, lng: -84.3963, bikes: 12, docks: 20, ebikes: 5 },
            { id: 3, name: 'Piedmont Park North', lat: 33.7879, lng: -84.3723, bikes: 6, docks: 18, ebikes: 2 },
            { id: 4, name: 'Ponce City Market', lat: 33.7721, lng: -84.3651, bikes: 10, docks: 16, ebikes: 4 },
            { id: 5, name: 'Krog Street Market', lat: 33.7587, lng: -84.3634, bikes: 7, docks: 14, ebikes: 2 },
            { id: 6, name: 'West End MARTA', lat: 33.7356, lng: -84.4125, bikes: 5, docks: 12, ebikes: 1 },
            { id: 7, name: 'Atlantic Station', lat: 33.7913, lng: -84.3969, bikes: 9, docks: 18, ebikes: 3 },
            { id: 8, name: 'Grant Park', lat: 33.7443, lng: -84.3715, bikes: 4, docks: 10, ebikes: 1 }
        ];

        return this.bikeShareStations;
    }

    displayBikeShareStations() {
        const layer = L.layerGroup();

        this.bikeShareStations.forEach(station => {
            const availabilityPercent = (station.bikes / station.docks) * 100;
            const color = availabilityPercent > 60 ? '#10b981' : 
                         availabilityPercent > 30 ? '#f59e0b' : '#ef4444';

            const marker = L.circleMarker([station.lat, station.lng], {
                radius: 10,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });

            const popupContent = `
                <div style="min-width: 200px; padding: 5px;">
                    <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px; font-weight: 700;">
                        🚴 ${station.name}
                    </h3>
                    <div style="display: grid; gap: 8px; margin: 12px 0;">
                        <div style="display: flex; justify-content: space-between; padding: 8px; background: #f0f9ff; border-radius: 6px;">
                            <span style="font-weight: 600; color: #0284c7;">Available Bikes:</span>
                            <strong style="color: #0284c7; font-size: 18px;">${station.bikes}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px; background: #f0fdf4; border-radius: 6px;">
                            <span style="font-weight: 600; color: #16a34a;">E-Bikes:</span>
                            <strong style="color: #16a34a; font-size: 18px;">${station.ebikes}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px; background: #fef3c7; border-radius: 6px;">
                            <span style="font-weight: 600; color: #ca8a04;">Empty Docks:</span>
                            <strong style="color: #ca8a04; font-size: 18px;">${station.docks - station.bikes}</strong>
                        </div>
                    </div>
                    <div style="margin-top: 12px; padding: 10px; background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius: 8px; text-align: center;">
                        <a href="https://relay.bike" target="_blank" 
                           style="color: white; text-decoration: none; font-weight: 600; font-size: 14px;">
                            🚲 Rent a Bike →
                        </a>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            layer.addLayer(marker);
        });

        return layer;
    }

    // ==================== WEATHER INTEGRATION ====================

    async fetchWeatherData() {
        console.log('🌤️ Fetching weather data...');

        // Simulated weather data
        // In production, use OpenWeatherMap API or similar
        this.weatherData = {
            temp: Math.round(60 + Math.random() * 25),
            feelsLike: Math.round(60 + Math.random() * 25),
            condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
            humidity: Math.round(50 + Math.random() * 30),
            windSpeed: Math.round(5 + Math.random() * 10),
            uvIndex: Math.round(1 + Math.random() * 10),
            airQuality: 'Good',
            recommendation: ''
        };

        // Generate activity recommendation based on weather
        this.weatherData.recommendation = this.generateWeatherRecommendation(this.weatherData);

        return this.weatherData;
    }

    generateWeatherRecommendation(weather) {
        if (weather.condition === 'Rainy') {
            return '☔ Consider indoor activities or bring an umbrella!';
        }
        if (weather.temp > 85) {
            return '🌡️ Hot day! Stay hydrated and seek shade during peak hours.';
        }
        if (weather.temp < 40) {
            return '🧥 Bundle up! It\'s cold outside.';
        }
        if (weather.uvIndex > 7) {
            return '☀️ High UV index. Don\'t forget sunscreen!';
        }
        return '✨ Perfect weather for outdoor activities!';
    }

    createWeatherWidget() {
        const control = L.control({ position: 'topright' });

        control.onAdd = () => {
            const div = L.DomUtil.create('div', 'weather-widget');
            div.style.cssText = `
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                padding: 16px;
                color: white;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                min-width: 200px;
            `;

            const weather = this.weatherData;
            const conditionEmoji = {
                'Sunny': '☀️',
                'Partly Cloudy': '⛅',
                'Cloudy': '☁️',
                'Rainy': '🌧️'
            }[weather.condition] || '🌤️';

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 14px; font-weight: 700;">Atlanta Weather</span>
                    <span style="font-size: 24px;">${conditionEmoji}</span>
                </div>
                <div style="font-size: 32px; font-weight: 800; margin: 10px 0;">${weather.temp}°F</div>
                <div style="font-size: 13px; opacity: 0.9; margin-bottom: 10px;">${weather.condition}</div>
                <div style="font-size: 11px; opacity: 0.7; line-height: 1.6;">
                    Feels like: ${weather.feelsLike}°F<br>
                    💧 Humidity: ${weather.humidity}%<br>
                    💨 Wind: ${weather.windSpeed} mph<br>
                    ☀️ UV Index: ${weather.uvIndex}
                </div>
                <div style="margin-top: 12px; padding: 10px; background: rgba(79, 70, 229, 0.2); 
                            border-radius: 8px; font-size: 11px; line-height: 1.4;">
                    ${weather.recommendation}
                </div>
            `;

            return div;
        };

        return control;
    }

    // ==================== FAVORITES SYSTEM ====================

    loadFavorites() {
        const stored = localStorage.getItem('insite_favorites');
        return stored ? JSON.parse(stored) : [];
    }

    saveFavorites() {
        localStorage.setItem('insite_favorites', JSON.stringify(this.userFavorites));
        // Sync to Firestore if user is authenticated
        if (typeof firebaseAuth !== 'undefined' && firebaseAuth.currentUser && typeof UserData !== 'undefined') {
            UserData.setFavorites(firebaseAuth.currentUser.uid, this.userFavorites);
        }
    }

    addToFavorites(location) {
        const exists = this.userFavorites.find(f => f.id === location.id && f.type === location.type);
        
        if (exists) {
            return false; // Already in favorites
        }

        this.userFavorites.unshift({
            ...location,
            addedAt: new Date().toISOString()
        });

        this.saveFavorites();
        return true;
    }

    removeFromFavorites(locationId, locationType) {
        this.userFavorites = this.userFavorites.filter(
            f => !(f.id === locationId && f.type === locationType)
        );
        this.saveFavorites();
    }

    isFavorite(locationId, locationType) {
        return this.userFavorites.some(f => f.id === locationId && f.type === locationType);
    }

    getFavoriteButton(location) {
        const isFav = this.isFavorite(location.id, location.type);
        
        return `
            <button onclick="toggleFavorite(${JSON.stringify(location).replace(/"/g, '&quot;')})" 
                    style="background: ${isFav ? '#ef4444' : 'rgba(255,255,255,0.1)'}; 
                           border: 1px solid ${isFav ? '#ef4444' : 'rgba(255,255,255,0.2)'}; 
                           color: white; padding: 8px 16px; border-radius: 8px; 
                           font-weight: 600; cursor: pointer; transition: all 0.3s;">
                ${isFav ? '❤️ Saved' : '🤍 Save'}
            </button>
        `;
    }

    displayFavoritesList() {
        if (this.userFavorites.length === 0) {
            return '<p style="color: #999; text-align: center; padding: 20px;">No favorites yet. Start exploring!</p>';
        }

        let html = '<div style="display: grid; gap: 12px;">';

        this.userFavorites.forEach(fav => {
            const icon = fav.type === 'park' ? '🌳' : 
                        fav.type === 'transit' ? '🚇' : '📍';

            html += `
                <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 10px; 
                            border-left: 4px solid #4f46e5; cursor: pointer;"
                     onclick="flyToLocation(${fav.lat}, ${fav.lng})">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 700; color: white; margin-bottom: 4px;">
                                ${icon} ${fav.name}
                            </div>
                            <div style="font-size: 11px; color: #999;">
                                Added ${new Date(fav.addedAt).toLocaleDateString()}
                            </div>
                        </div>
                        <button onclick="event.stopPropagation(); removeFromFavorites('${fav.id}', '${fav.type}')"
                                style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 20px;">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    // ==================== CARBON FOOTPRINT CALCULATOR ====================

    calculateTransitCarbonSavings(distanceMiles, mode) {
        // Average CO2 emissions in kg per mile
        const emissions = {
            car: 0.404,        // Single occupancy vehicle
            transit: 0.140,    // Public transit
            bike: 0,           // Zero emissions
            walk: 0            // Zero emissions
        };

        const carEmissions = distanceMiles * emissions.car;
        const transitEmissions = distanceMiles * emissions[mode];
        const savings = carEmissions - transitEmissions;

        return {
            distance: distanceMiles,
            mode,
            carEmissions: carEmissions.toFixed(2),
            transitEmissions: transitEmissions.toFixed(2),
            savings: savings.toFixed(2),
            treesEquivalent: (savings / 21.77).toFixed(1) // One tree absorbs ~21.77 kg CO2/year
        };
    }

    generateCarbonFootprintWidget(journey) {
        const calc = this.calculateTransitCarbonSavings(journey.distance, journey.mode);

        return `
            <div style="margin: 15px 0; padding: 15px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1)); 
                        border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <h4 style="margin: 0 0 10px 0; color: #10b981; font-size: 16px;">🌱 Environmental Impact</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #fff;">CO₂ Saved:</span>
                        <strong style="color: #10b981; font-size: 18px;">${calc.savings} kg</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #fff;">Trees Equivalent:</span>
                        <strong style="color: #10b981;">🌳 ${calc.treesEquivalent}</strong>
                    </div>
                    <div style="font-size: 11px; color: #a7f3d0; margin-top: 8px; line-height: 1.5;">
                        By choosing ${journey.mode} instead of driving, you're helping reduce carbon emissions 
                        and contributing to a cleaner Atlanta!
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== CLEANUP ====================

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Make Phase2Features available globally
window.Phase2Features = Phase2Features;
