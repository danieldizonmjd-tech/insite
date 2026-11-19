/**
 * Community Data Helper for InSite
 * Provides Schools, Libraries, Bikeways, and Community Infrastructure Data
 */

class CommunityHelper {
  constructor() {
    this.dataCache = {
      schools: null,
      libraries: null,
      bikeways: null,
      opportunityZones: null
    };
  }

  // ========================================
  // SCHOOLS DATA
  // ========================================
  
  // Metro Atlanta Schools with ratings (sample data - supplement with actual data from S3)
  schools = [
    // Top-Rated Public Schools
    { name: 'Walton High School', lat: 33.9417, lng: -84.4622, type: 'public', level: 'high', rating: 10, district: 'Cobb County', enrollment: 2100 },
    { name: 'Lassiter High School', lat: 33.9767, lng: -84.5147, type: 'public', level: 'high', rating: 10, district: 'Cobb County', enrollment: 2000 },
    { name: 'Northview High School', lat: 34.0333, lng: -84.2167, type: 'public', level: 'high', rating: 10, district: 'Fulton County', enrollment: 1900 },
    { name: 'Johns Creek High School', lat: 34.0297, lng: -84.1986, type: 'public', level: 'high', rating: 10, district: 'Fulton County', enrollment: 2400 },
    { name: 'Milton High School', lat: 34.1281, lng: -84.3189, type: 'public', level: 'high', rating: 10, district: 'Fulton County', enrollment: 2200 },
    { name: 'Cambridge High School', lat: 34.0436, lng: -84.2611, type: 'public', level: 'high', rating: 9, district: 'Fulton County', enrollment: 2100 },
    { name: 'Chattahoochee High School', lat: 34.0167, lng: -84.3000, type: 'public', level: 'high', rating: 9, district: 'Fulton County', enrollment: 2300 },
    { name: 'Pope High School', lat: 33.9556, lng: -84.4867, type: 'public', level: 'high', rating: 9, district: 'Cobb County', enrollment: 1800 },
    { name: 'North Gwinnett High School', lat: 34.0872, lng: -84.0683, type: 'public', level: 'high', rating: 9, district: 'Gwinnett County', enrollment: 2800 },
    { name: 'Peachtree Ridge High School', lat: 33.9956, lng: -84.0683, type: 'public', level: 'high', rating: 8, district: 'Gwinnett County', enrollment: 2600 },
    
    // Elementary Schools
    { name: 'Shakerag Elementary', lat: 34.0333, lng: -84.2500, type: 'public', level: 'elementary', rating: 10, district: 'Fulton County', enrollment: 750 },
    { name: 'Barnwell Elementary', lat: 34.0167, lng: -84.2333, type: 'public', level: 'elementary', rating: 10, district: 'Fulton County', enrollment: 680 },
    { name: 'State Bridge Crossing Elementary', lat: 34.0500, lng: -84.2167, type: 'public', level: 'elementary', rating: 10, district: 'Fulton County', enrollment: 720 },
    { name: 'Ocee Elementary', lat: 34.0333, lng: -84.2833, type: 'public', level: 'elementary', rating: 9, district: 'Fulton County', enrollment: 690 },
    { name: 'Mountain Park Elementary', lat: 34.0833, lng: -84.1833, type: 'public', level: 'elementary', rating: 9, district: 'Fulton County', enrollment: 650 },
    { name: 'Medlock Bridge Elementary', lat: 34.0167, lng: -84.1500, type: 'public', level: 'Fulton County', rating: 9, district: 'Fulton County', enrollment: 600 },
    
    // Middle Schools
    { name: 'River Trail Middle School', lat: 34.0333, lng: -84.2333, type: 'public', level: 'middle', rating: 10, district: 'Fulton County', enrollment: 1200 },
    { name: 'Autrey Mill Middle School', lat: 34.0500, lng: -84.2500, type: 'public', level: 'middle', rating: 9, district: 'Fulton County', enrollment: 1100 },
    { name: 'Holcomb Bridge Middle School', lat: 33.9833, lng: -84.2667, type: 'public', level: 'middle', rating: 9, district: 'Fulton County', enrollment: 1050 },
    
    // Private Schools
    { name: 'The Westminster Schools', lat: 33.8342, lng: -84.3878, type: 'private', level: 'k12', rating: 10, district: 'Private', enrollment: 1850, tuition: 32000 },
    { name: 'Pace Academy', lat: 33.8147, lng: -84.3914, type: 'private', level: 'k12', rating: 10, district: 'Private', enrollment: 1100, tuition: 30000 },
    { name: 'The Lovett School', lat: 33.8708, lng: -84.3742, type: 'private', level: 'k12', rating: 10, district: 'Private', enrollment: 1650, tuition: 31000 },
    { name: 'Woodward Academy', lat: 33.6528, lng: -84.3819, type: 'private', level: 'k12', rating: 10, district: 'Private', enrollment: 2700, tuition: 28000 },
    { name: "The Paideia School", lat: 33.7667, lng: -84.3333, type: 'private', level: 'k12', rating: 9, district: 'Private', enrollment: 980, tuition: 27000 },
    { name: 'Holy Innocents Episcopal School', lat: 33.9167, lng: -84.3833, type: 'private', level: 'k12', rating: 9, district: 'Private', enrollment: 1350, tuition: 26000 },
    { name: 'Atlanta International School', lat: 33.8522, lng: -84.3567, type: 'private', level: 'k12', rating: 9, district: 'Private', enrollment: 1200, tuition: 29000 },
    
    // Magnet & Charter Schools
    { name: 'Gwinnett School of Mathematics, Science, and Technology', lat: 33.9167, lng: -84.0500, type: 'magnet', level: 'high', rating: 10, district: 'Gwinnett County', enrollment: 450 },
    { name: 'DeKalb School of the Arts', lat: 33.7833, lng: -84.2667, type: 'magnet', level: 'high', rating: 9, district: 'DeKalb County', enrollment: 350 },
    { name: 'Drew Charter School', lat: 33.7500, lng: -84.3500, type: 'charter', level: 'k12', rating: 8, district: 'Atlanta Public Schools', enrollment: 1800 },
    { name: 'KIPP Atlanta Collegiate', lat: 33.7333, lng: -84.4000, type: 'charter', level: 'high', rating: 8, district: 'Atlanta Public Schools', enrollment: 600 },
    
    // Atlanta Public Schools
    { name: 'Grady High School', lat: 33.7667, lng: -84.3667, type: 'public', level: 'high', rating: 7, district: 'Atlanta Public Schools', enrollment: 1400 },
    { name: 'North Atlanta High School', lat: 33.8833, lng: -84.3500, type: 'public', level: 'high', rating: 7, district: 'Atlanta Public Schools', enrollment: 2200 },
    { name: 'Midtown High School', lat: 33.7833, lng: -84.3833, type: 'public', level: 'high', rating: 6, district: 'Atlanta Public Schools', enrollment: 1100 }
  ];

  // ========================================
  // LIBRARIES DATA
  // ========================================
  
  libraries = [
    // Atlanta-Fulton County Library System
    { name: 'Central Library', lat: 33.7589, lng: -84.3900, system: 'AFCPL', address: '1 Margaret Mitchell Square', hours: 'Mon-Sat 10am-6pm, Sun 2pm-6pm', features: ['computers', 'wifi', 'meeting_rooms', 'children_area'] },
    { name: 'Buckhead Library', lat: 33.8389, lng: -84.3686, system: 'AFCPL', address: '269 Buckhead Ave NE', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'study_rooms'] },
    { name: 'Peachtree Library', lat: 33.8125, lng: -84.3611, system: 'AFCPL', address: '1315 Peachtree St NE', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'children_area'] },
    { name: 'Ponce de Leon Library', lat: 33.7742, lng: -84.3647, system: 'AFCPL', address: '980 Ponce de Leon Ave NE', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'meeting_rooms'] },
    { name: 'Sandy Springs Library', lat: 33.9297, lng: -84.3786, system: 'AFCPL', address: '395 Mount Vernon Hwy', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm, Sun 2pm-6pm', features: ['computers', 'wifi', 'meeting_rooms', 'children_area'] },
    { name: 'Alpharetta Library', lat: 34.0750, lng: -84.2939, system: 'AFCPL', address: '10 Park Plaza', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm, Sun 2pm-6pm', features: ['computers', 'wifi', 'meeting_rooms', 'makerspace'] },
    { name: 'Roswell Library', lat: 34.0231, lng: -84.3617, system: 'AFCPL', address: '115 Norcross St', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm, Sun 2pm-6pm', features: ['computers', 'wifi', 'meeting_rooms', 'children_area'] },
    { name: 'Milton Library', lat: 34.1167, lng: -84.3333, system: 'AFCPL', address: '855 Mayfield Rd', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'study_rooms'] },
    { name: 'Johns Creek Library', lat: 34.0292, lng: -84.1986, system: 'AFCPL', address: '6855 Sargent Rd', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'meeting_rooms'] },
    { name: 'East Atlanta Library', lat: 33.7400, lng: -84.3400, system: 'AFCPL', address: '400 Flat Shoals Ave SE', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'children_area'] },
    { name: 'West End Library', lat: 33.7372, lng: -84.4128, system: 'AFCPL', address: '525 Peeples St SW', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi'] },
    { name: 'College Park Library', lat: 33.6514, lng: -84.4494, system: 'AFCPL', address: '3647 Main St', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi'] },
    
    // DeKalb County Library System
    { name: 'Decatur Library', lat: 33.7750, lng: -84.2972, system: 'DCLS', address: '215 Sycamore St', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-5pm, Sun 2pm-6pm', features: ['computers', 'wifi', 'meeting_rooms', 'children_area'] },
    { name: 'Brookhaven Library', lat: 33.8597, lng: -84.3400, system: 'DCLS', address: '1242 N Druid Hills Rd', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-5pm', features: ['computers', 'wifi', 'study_rooms'] },
    { name: 'Dunwoody Library', lat: 33.9428, lng: -84.3347, system: 'DCLS', address: '5339 Chamblee Dunwoody Rd', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-5pm', features: ['computers', 'wifi', 'meeting_rooms'] },
    { name: 'Tucker-Reid H. Cofer Library', lat: 33.8553, lng: -84.2169, system: 'DCLS', address: '5234 LaVista Rd', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-5pm', features: ['computers', 'wifi', 'children_area'] },
    { name: 'Stonecrest Library', lat: 33.6875, lng: -84.1333, system: 'DCLS', address: '3123 Klondike Rd', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-5pm', features: ['computers', 'wifi', 'meeting_rooms'] },
    
    // Cobb County Library System
    { name: 'Marietta Library', lat: 33.9528, lng: -84.5500, system: 'CCLS', address: '266 Roswell St', hours: 'Mon-Thu 10am-9pm, Fri-Sat 10am-6pm, Sun 1pm-6pm', features: ['computers', 'wifi', 'meeting_rooms', 'children_area'] },
    { name: 'East Cobb Library', lat: 33.9500, lng: -84.4167, system: 'CCLS', address: '4880 Lower Roswell Rd', hours: 'Mon-Thu 10am-9pm, Fri-Sat 10am-6pm, Sun 1pm-6pm', features: ['computers', 'wifi', 'meeting_rooms'] },
    { name: 'Vinings Library', lat: 33.8639, lng: -84.4681, system: 'CCLS', address: '4290 Paces Ferry Rd', hours: 'Mon-Thu 10am-9pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'study_rooms'] },
    { name: 'Kennesaw Library', lat: 34.0231, lng: -84.6153, system: 'CCLS', address: '2250 Lewis St', hours: 'Mon-Thu 10am-9pm, Fri-Sat 10am-6pm, Sun 1pm-6pm', features: ['computers', 'wifi', 'meeting_rooms', 'makerspace'] },
    { name: 'Powder Springs Library', lat: 33.8594, lng: -84.6836, system: 'CCLS', address: '4181 Atlanta St', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi'] },
    
    // Gwinnett County Library System
    { name: 'Lawrenceville Library', lat: 33.9561, lng: -83.9878, system: 'GCLS', address: '1001 Lawrenceville Hwy', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm, Sun 2pm-6pm', features: ['computers', 'wifi', 'meeting_rooms', 'children_area'] },
    { name: 'Duluth Library', lat: 34.0000, lng: -84.1444, system: 'GCLS', address: '3480 Duluth Park Ln', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm, Sun 2pm-6pm', features: ['computers', 'wifi', 'meeting_rooms'] },
    { name: 'Suwanee Library', lat: 34.0500, lng: -84.0667, system: 'GCLS', address: '361 Main St', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'study_rooms'] },
    { name: 'Snellville Library', lat: 33.8572, lng: -84.0000, system: 'GCLS', address: '2250 Oak Rd', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'children_area'] },
    { name: 'Peachtree Corners Library', lat: 33.9667, lng: -84.2167, system: 'GCLS', address: '5570 Spalding Dr', hours: 'Mon-Thu 10am-8pm, Fri-Sat 10am-6pm', features: ['computers', 'wifi', 'meeting_rooms'] }
  ];

  // ========================================
  // BIKEWAYS DATA
  // ========================================
  
  bikeways = [
    // Atlanta BeltLine
    { name: 'Atlanta BeltLine Eastside Trail', type: 'multi-use trail', length: 2.25, surface: 'paved', lat: 33.7699, lng: -84.3624, features: ['lit', 'scenic', 'restaurants', 'art'] },
    { name: 'Atlanta BeltLine Westside Trail', type: 'multi-use trail', length: 3.0, surface: 'paved', lat: 33.7562, lng: -84.4209, features: ['lit', 'scenic', 'parks'] },
    { name: 'Atlanta BeltLine Southside Trail', type: 'multi-use trail', length: 1.5, surface: 'paved', lat: 33.7209, lng: -84.3901, features: ['scenic', 'connecting'] },
    { name: 'Atlanta BeltLine Northeast Trail', type: 'multi-use trail', length: 1.2, surface: 'paved', lat: 33.7900, lng: -84.3550, features: ['scenic', 'parks'] },
    
    // PATH Foundation Trails
    { name: 'Silver Comet Trail', type: 'rail-trail', length: 61.5, surface: 'paved', lat: 33.8700, lng: -84.6100, features: ['long-distance', 'scenic', 'restrooms'] },
    { name: 'Arabia Mountain PATH', type: 'multi-use trail', length: 30.0, surface: 'paved', lat: 33.6689, lng: -84.1181, features: ['nature', 'scenic', 'challenging'] },
    { name: 'Stone Mountain Trail', type: 'multi-use trail', length: 19.0, surface: 'paved', lat: 33.8000, lng: -84.1700, features: ['scenic', 'connects_communities'] },
    { name: 'Suwanee Creek Greenway', type: 'greenway', length: 4.5, surface: 'paved', lat: 34.0500, lng: -84.0600, features: ['nature', 'family-friendly'] },
    { name: 'Big Creek Greenway', type: 'greenway', length: 8.0, surface: 'paved', lat: 34.0500, lng: -84.2300, features: ['nature', 'family-friendly', 'connects_parks'] },
    { name: 'Chastain Park Trail', type: 'park trail', length: 3.0, surface: 'paved', lat: 33.8519, lng: -84.3928, features: ['park', 'family-friendly', 'lit'] },
    
    // Protected Bike Lanes
    { name: 'Peachtree Street Bike Lane', type: 'protected bike lane', length: 2.5, surface: 'on-street', lat: 33.7800, lng: -84.3860, features: ['protected', 'urban', 'connects_transit'] },
    { name: '10th Street Cycle Track', type: 'cycle track', length: 1.0, surface: 'on-street', lat: 33.7810, lng: -84.3880, features: ['protected', 'bidirectional'] },
    { name: 'Ponce de Leon Bike Lane', type: 'bike lane', length: 3.0, surface: 'on-street', lat: 33.7740, lng: -84.3650, features: ['urban', 'connects_neighborhoods'] },
    { name: 'Monroe Drive Bike Lane', type: 'bike lane', length: 2.0, surface: 'on-street', lat: 33.7850, lng: -84.3700, features: ['connects_parks'] },
    
    // Suburban Trails
    { name: 'Roswell Riverwalk', type: 'riverside trail', length: 2.5, surface: 'paved', lat: 34.0231, lng: -84.3617, features: ['scenic', 'river', 'historic'] },
    { name: 'Alpharetta Big Creek Trail', type: 'greenway', length: 6.0, surface: 'paved', lat: 34.0750, lng: -84.2900, features: ['nature', 'connects_communities'] },
    { name: 'Marietta Square Loop', type: 'urban trail', length: 1.5, surface: 'paved/sidewalk', lat: 33.9528, lng: -84.5500, features: ['urban', 'historic', 'restaurants'] }
  ];

  // ========================================
  // FEDERAL OPPORTUNITY ZONES
  // ========================================
  
  opportunityZones = [
    // Atlanta Opportunity Zones
    { name: 'Downtown Atlanta OZ', census_tract: '13121001900', lat: 33.7550, lng: -84.3900, neighborhood: 'Downtown', description: 'Historic downtown core with mixed-use development potential' },
    { name: 'West End OZ', census_tract: '13121006900', lat: 33.7350, lng: -84.4150, neighborhood: 'West End', description: 'Historic neighborhood near BeltLine with redevelopment activity' },
    { name: 'Pittsburgh OZ', census_tract: '13121005800', lat: 33.7200, lng: -84.4100, neighborhood: 'Pittsburgh', description: 'Emerging neighborhood with community investment' },
    { name: 'Summerhill OZ', census_tract: '13121005300', lat: 33.7380, lng: -84.3850, neighborhood: 'Summerhill', description: 'Near Georgia State Stadium with mixed-use development' },
    { name: 'East Atlanta OZ', census_tract: '13121007300', lat: 33.7400, lng: -84.3400, neighborhood: 'East Atlanta', description: 'Vibrant neighborhood with commercial growth' },
    { name: 'Old Fourth Ward OZ', census_tract: '13121002500', lat: 33.7650, lng: -84.3700, neighborhood: 'Old Fourth Ward', description: 'BeltLine adjacent with significant investment' },
    { name: 'Westside/Vine City OZ', census_tract: '13121003600', lat: 33.7570, lng: -84.4050, neighborhood: 'Vine City', description: 'Near Mercedes-Benz Stadium with revitalization' },
    { name: 'English Avenue OZ', census_tract: '13121003200', lat: 33.7700, lng: -84.4200, neighborhood: 'English Avenue', description: 'Westside community with investment opportunities' },
    
    // Suburban Opportunity Zones
    { name: 'College Park OZ', census_tract: '13121010000', lat: 33.6514, lng: -84.4500, neighborhood: 'College Park', description: 'Near airport with transit-oriented development potential' },
    { name: 'East Point OZ', census_tract: '13121009100', lat: 33.6767, lng: -84.4400, neighborhood: 'East Point', description: 'MARTA-connected community with redevelopment' },
    { name: 'South Fulton OZ', census_tract: '13121009500', lat: 33.6200, lng: -84.4800, neighborhood: 'South Fulton', description: 'Growing area with industrial and residential mix' },
    { name: 'Stonecrest OZ', census_tract: '13089033100', lat: 33.6875, lng: -84.1350, neighborhood: 'Stonecrest', description: 'Emerging city with commercial development' },
    { name: 'Clarkston OZ', census_tract: '13089023000', lat: 33.8100, lng: -84.2400, neighborhood: 'Clarkston', description: 'Diverse community with small business opportunities' }
  ];

  // ========================================
  // CALCULATION METHODS
  // ========================================
  
  /**
   * Calculate school quality score for a location
   */
  calculateSchoolScore(lat, lng) {
    // First try public schools within reasonable radius, expanding if needed
    let nearbySchools = this.findNearbySchools(lat, lng, 10, 'public'); // 10 mile radius, public only
    
    // If no public schools found, try all schools in larger radius
    if (nearbySchools.length === 0) {
      nearbySchools = this.findNearbySchools(lat, lng, 25, 'all'); // 25 mile radius, all types
    }
    
    // Still no schools? Return low score with message
    if (nearbySchools.length === 0) {
      return { 
        score: 20, 
        nearestSchool: null, 
        schoolsNearby: 0,
        message: 'No schools found within 25 miles - rural area'
      };
    }
    
    // Prioritize public schools in scoring
    const publicSchools = nearbySchools.filter(s => s.type === 'public');
    const schoolsForScoring = publicSchools.length >= 3 ? publicSchools : nearbySchools;
    
    // Weight: Closest schools matter more, public schools get bonus weight
    let weightedSum = 0;
    let weightSum = 0;
    
    schoolsForScoring.forEach((school, index) => {
      let weight = 1 / (index + 1); // Inverse weight by distance rank
      if (school.type === 'public') weight *= 1.5; // Bonus for public schools
      weightedSum += school.rating * weight;
      weightSum += weight;
    });
    
    const avgRating = weightedSum / weightSum;
    
    // Count high-rated schools (8+) nearby
    const excellentSchools = schoolsForScoring.filter(s => s.rating >= 8).length;
    
    // Bonus for having multiple good public schools
    const publicBonus = Math.min(15, publicSchools.filter(s => s.rating >= 7).length * 5);
    const excellentBonus = Math.min(10, excellentSchools * 3);
    
    // Distance penalty - if nearest school is far, reduce score
    const nearestDist = parseFloat(nearbySchools[0].distanceMiles);
    const distancePenalty = nearestDist > 5 ? Math.min(20, (nearestDist - 5) * 2) : 0;
    
    return {
      score: Math.round(Math.max(20, Math.min(100, avgRating * 10 + publicBonus + excellentBonus - distancePenalty))),
      nearestSchool: nearbySchools[0],
      nearestPublicSchool: publicSchools[0] || null,
      schoolsNearby: nearbySchools.length,
      publicSchoolsNearby: publicSchools.length,
      excellentSchools,
      nearestDistanceMiles: nearestDist,
      byType: {
        public: publicSchools.length,
        private: nearbySchools.filter(s => s.type === 'private').length,
        charter: nearbySchools.filter(s => s.type === 'charter').length,
        magnet: nearbySchools.filter(s => s.type === 'magnet').length
      },
      byLevel: {
        elementary: nearbySchools.filter(s => s.level === 'elementary').length,
        middle: nearbySchools.filter(s => s.level === 'middle').length,
        high: nearbySchools.filter(s => s.level === 'high').length
      }
    };
  }
  
  /**
   * Find schools near a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusMiles - Search radius in miles (default 10)
   * @param {string} typeFilter - 'public', 'private', 'charter', 'magnet', or 'all'
   */
  findNearbySchools(lat, lng, radiusMiles = 10, typeFilter = 'all') {
    const radiusMeters = radiusMiles * 1609.34;
    
    return this.schools
      .filter(school => typeFilter === 'all' || school.type === typeFilter)
      .map(school => ({
        ...school,
        distance: this.calculateDistance(lat, lng, school.lat, school.lng),
        distanceMiles: (this.calculateDistance(lat, lng, school.lat, school.lng) / 1609.34).toFixed(2)
      }))
      .filter(s => s.distance <= radiusMeters)
      .sort((a, b) => {
        // Sort by: public schools first, then by distance
        if (a.type === 'public' && b.type !== 'public') return -1;
        if (a.type !== 'public' && b.type === 'public') return 1;
        return a.distance - b.distance;
      });
  }
  
  /**
   * Calculate library accessibility score
   */
  calculateLibraryScore(lat, lng) {
    let nearbyLibraries = this.findNearbyLibraries(lat, lng, 5); // 5 mile radius
    
    if (nearbyLibraries.length === 0) {
      // Try larger radius
      nearbyLibraries = this.findNearbyLibraries(lat, lng, 15);
      if (nearbyLibraries.length === 0) {
        return { 
          score: 15, 
          nearestLibrary: null, 
          librariesNearby: 0,
          message: 'No libraries found within 15 miles'
        };
      }
    }
    
    const closest = nearbyLibraries[0];
    const distMiles = parseFloat(closest.distanceMiles);
    let score = 0;
    
    // Distance-based score (max 50 points) - adjusted for larger search area
    if (distMiles <= 1) score += 50;
    else if (distMiles <= 2) score += 40;
    else if (distMiles <= 3) score += 30;
    else if (distMiles <= 5) score += 20;
    else if (distMiles <= 10) score += 10;
    else score += 5;
    
    // Number of libraries bonus (max 30 points)
    score += Math.min(30, nearbyLibraries.length * 10);
    
    // Feature bonus (max 20 points)
    const featureCount = new Set(nearbyLibraries.flatMap(l => l.features || [])).size;
    score += Math.min(20, featureCount * 4);
    
    return {
      score: Math.min(100, Math.max(15, score)),
      nearestLibrary: closest,
      nearestDistanceMiles: distMiles,
      librariesNearby: nearbyLibraries.length,
      featuresAvailable: [...new Set(nearbyLibraries.flatMap(l => l.features || []))]
    };
  }
  
  /**
   * Find libraries near a location
   */
  findNearbyLibraries(lat, lng, radiusMiles = 10) {
    const radiusMeters = radiusMiles * 1609.34;
    
    return this.libraries
      .map(library => ({
        ...library,
        distance: this.calculateDistance(lat, lng, library.lat, library.lng),
        distanceMiles: (this.calculateDistance(lat, lng, library.lat, library.lng) / 1609.34).toFixed(2)
      }))
      .filter(l => l.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Calculate bikeability score based on nearby bike infrastructure
   */
  calculateBikeScore(lat, lng) {
    const nearbyBikeways = this.findNearbyBikeways(lat, lng, 5); // 5 mile radius
    
    if (nearbyBikeways.length === 0) {
      return { score: 20, nearestBikeway: null, bikewaysNearby: 0, message: 'No bikeways found nearby' };
    }
    
    let score = 0;
    
    // Closest bikeway (max 40 points)
    const closest = nearbyBikeways[0];
    if (closest.distance <= 804.67) score += 40; // Within 0.5 mile
    else if (closest.distance <= 1609.34) score += 30; // Within 1 mile
    else if (closest.distance <= 3218.69) score += 20; // Within 2 miles
    else score += 10;
    
    // Variety of bikeway types (max 30 points)
    const types = new Set(nearbyBikeways.map(b => b.type));
    score += Math.min(30, types.size * 10);
    
    // Total bikeway mileage nearby (max 30 points)
    const totalMiles = nearbyBikeways.reduce((sum, b) => sum + b.length, 0);
    score += Math.min(30, totalMiles * 2);
    
    return {
      score: Math.min(100, Math.round(score)),
      nearestBikeway: closest,
      bikewaysNearby: nearbyBikeways.length,
      totalMilesNearby: totalMiles.toFixed(1),
      types: [...types],
      hasProtectedLanes: nearbyBikeways.some(b => b.type.includes('protected'))
    };
  }
  
  /**
   * Find bikeways near a location
   */
  findNearbyBikeways(lat, lng, radiusMiles = 3) {
    const radiusMeters = radiusMiles * 1609.34;
    
    return this.bikeways
      .map(bikeway => ({
        ...bikeway,
        distance: this.calculateDistance(lat, lng, bikeway.lat, bikeway.lng),
        distanceMiles: (this.calculateDistance(lat, lng, bikeway.lat, bikeway.lng) / 1609.34).toFixed(2)
      }))
      .filter(b => b.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Check if location is in an Opportunity Zone
   */
  checkOpportunityZone(lat, lng) {
    // Find the closest OZ
    const ozWithDistance = this.opportunityZones.map(oz => ({
      ...oz,
      distance: this.calculateDistance(lat, lng, oz.lat, oz.lng)
    }));
    
    const closest = ozWithDistance.sort((a, b) => a.distance - b.distance)[0];
    
    // Consider "in zone" if within ~1 mile of center (approximation)
    // Actual implementation should use polygon containment
    const inZone = closest.distance <= 2000; // ~1.25 miles
    
    return {
      inOpportunityZone: inZone,
      nearestZone: closest,
      distanceToZone: closest.distance,
      distanceMiles: (closest.distance / 1609.34).toFixed(2),
      benefits: inZone ? [
        'Capital gains tax deferral',
        'Step-up in basis after 5 years',
        'Permanent exclusion after 10 years',
        'Potential for additional local incentives'
      ] : []
    };
  }
  
  /**
   * Generate comprehensive community score
   */
  calculateCommunityScore(lat, lng) {
    const schoolScore = this.calculateSchoolScore(lat, lng);
    const libraryScore = this.calculateLibraryScore(lat, lng);
    const bikeScore = this.calculateBikeScore(lat, lng);
    const ozStatus = this.checkOpportunityZone(lat, lng);
    
    // Weighted average
    const weights = {
      schools: 0.40,
      libraries: 0.20,
      bikeways: 0.25,
      opportunity: 0.15
    };
    
    const ozBonus = ozStatus.inOpportunityZone ? 100 : 0;
    
    const overallScore = Math.round(
      schoolScore.score * weights.schools +
      libraryScore.score * weights.libraries +
      bikeScore.score * weights.bikeways +
      ozBonus * weights.opportunity
    );
    
    return {
      overallScore,
      breakdown: {
        schools: schoolScore,
        libraries: libraryScore,
        bikeways: bikeScore,
        opportunityZone: ozStatus
      },
      summary: this.generateCommunitySummary(overallScore, schoolScore, libraryScore, bikeScore, ozStatus)
    };
  }
  
  /**
   * Generate human-readable community summary
   */
  generateCommunitySummary(overallScore, schoolScore, libraryScore, bikeScore, ozStatus) {
    const parts = [];
    
    if (overallScore >= 80) {
      parts.push("🌟 Excellent community amenities!");
    } else if (overallScore >= 60) {
      parts.push("✅ Good community resources.");
    } else if (overallScore >= 40) {
      parts.push("⚠️ Moderate community access.");
    } else {
      parts.push("📍 Limited nearby amenities.");
    }
    
    if (schoolScore.excellentSchools > 0) {
      parts.push(`${schoolScore.excellentSchools} top-rated schools nearby`);
    }
    
    if (libraryScore.nearestLibrary) {
      parts.push(`Library ${libraryScore.nearestLibrary.distanceMiles} mi away`);
    }
    
    if (bikeScore.hasProtectedLanes) {
      parts.push("Protected bike lanes available");
    }
    
    if (ozStatus.inOpportunityZone) {
      parts.push("🏛️ Federal Opportunity Zone");
    }
    
    return parts.join(" | ");
  }
  
  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommunityHelper;
}

// Create singleton instance and make available globally
const communityHelperInstance = new CommunityHelper();

// Expose static-like methods on the class for convenience
CommunityHelper.calculateSchoolScore = (lat, lng) => communityHelperInstance.calculateSchoolScore(lat, lng);
CommunityHelper.calculateLibraryScore = (lat, lng) => communityHelperInstance.calculateLibraryScore(lat, lng);
CommunityHelper.calculateBikeScore = (lat, lng) => communityHelperInstance.calculateBikeScore(lat, lng);
CommunityHelper.checkOpportunityZone = (lat, lng) => communityHelperInstance.checkOpportunityZone(lat, lng);
CommunityHelper.calculateCommunityScore = (lat, lng) => communityHelperInstance.calculateCommunityScore(lat, lng);
CommunityHelper.findNearbySchools = (lat, lng, radius) => communityHelperInstance.findNearbySchools(lat, lng, radius);
CommunityHelper.findNearbyLibraries = (lat, lng, radius) => communityHelperInstance.findNearbyLibraries(lat, lng, radius);
CommunityHelper.findNearbyBikeways = (lat, lng, radius) => communityHelperInstance.findNearbyBikeways(lat, lng, radius);
CommunityHelper.getCommunityInsights = (lat, lng) => communityHelperInstance.getCommunityInsights(lat, lng);

// Make class and instance available globally
window.CommunityHelper = CommunityHelper;
window.communityHelper = communityHelperInstance;
