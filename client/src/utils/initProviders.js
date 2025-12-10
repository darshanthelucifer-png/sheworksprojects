// src/utils/initProviders.js
export const initProviders = async () => {
  try {
    console.log('🔄 Initializing providers data...');
    
    // Try to load from JSON file first
    const response = await fetch(process.env.PUBLIC_URL + '/data/providers.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const jsonData = await response.json();
    console.log('✅ Loaded providers from JSON file:', jsonData);
    
    let providersData = {};
    
    // Handle different possible JSON structures
    if (jsonData.providers && Array.isArray(jsonData.providers)) {
      // Structure: { providers: [...] }
      jsonData.providers.forEach(provider => {
        providersData[provider.id] = provider;
      });
    } else if (Array.isArray(jsonData)) {
      // Structure: [...]
      jsonData.forEach(provider => {
        providersData[provider.id] = provider;
      });
    } else if (typeof jsonData === 'object') {
      // Structure: { providerId: providerData, ... }
      providersData = jsonData;
    }
    
    // Get existing data to merge
    const existingData = JSON.parse(localStorage.getItem('allProvidersData') || '{}');
    
    // Merge with existing data (JSON data takes precedence)
    const mergedData = { ...existingData, ...providersData };
    
    // Save to localStorage
    localStorage.setItem('allProvidersData', JSON.stringify(mergedData));
    
    console.log(`🎉 Providers initialization complete. Total providers: ${Object.keys(mergedData).length}`);
    return mergedData;
    
  } catch (error) {
    console.warn('⚠️ Could not load providers.json, using manual providers as fallback:', error);
    
    // Fallback to manual providers
    const manualProviders = {
      'hand_0': {
        id: 'hand_0',
        name: 'Priya Sharma',
        description: 'Passionate Hand Embroidery expert with excellent customer satisfaction.',
        image: '/assets/ServiceProviderImages/hand_embroidery.jpg',
        rating: '4.5',
        reviews: 45,
        location: 'Mumbai',
        experience: '3+ years',
        priceRange: '₹2000 - ₹10000',
        services: ['Hand Embroidery'],
        providerType: 'verified',
        products: [
          {
            id: 'prod_hand_0_0',
            name: 'Custom Embroidery Design',
            price: 1500,
            description: 'Beautiful Design crafted with care and attention to detail.',
            image: '/assets/ServiceProviderImages/Serviceproviderproductimages/product_1.jpg',
            rating: '4.5',
            reviews: 12,
            inStock: true,
            type: 'product'
          }
        ],
        phone: '+91 9876543210',
        email: 'priya.sharma@sheworks.com',
        bio: 'I am a passionate and dedicated Hand Embroidery specialist with 3+ years of experience.',
        responseRate: '95%',
        completionRate: '98%',
        onTimeDelivery: '96%'
      },
      'food_0': {
        id: 'food_0',
        name: 'Ananya Patel',
        description: 'Expert in traditional South Indian meals with authentic flavors.',
        image: '/assets/ServiceProviderImages/south_indian_meals.jpg',
        rating: '4.8',
        reviews: 67,
        location: 'Chennai',
        experience: '5+ years',
        priceRange: '₹300 - ₹1500',
        services: ['South Indian Meals'],
        providerType: 'verified',
        products: [
          {
            id: 'prod_food_0_0',
            name: 'Traditional Meal Package',
            price: 350,
            description: 'Complete South Indian meal with 5 items',
            image: '/assets/ServiceProviderImages/Serviceproviderproductimages/product_2.jpg',
            rating: '4.7',
            reviews: 23,
            inStock: true,
            type: 'product'
          }
        ],
        phone: '+91 9876543211',
        email: 'ananya.patel@sheworks.com',
        bio: 'Specialized in authentic South Indian cuisine with 5+ years of experience.',
        responseRate: '98%',
        completionRate: '99%',
        onTimeDelivery: '97%'
      }
    };
    
    // Merge with existing data
    const existingData = JSON.parse(localStorage.getItem('allProvidersData') || '{}');
    const mergedData = { ...existingData, ...manualProviders };
    
    localStorage.setItem('allProvidersData', JSON.stringify(mergedData));
    console.log(`📊 Using ${Object.keys(manualProviders).length} manual providers as fallback`);
    
    return mergedData;
  }
};

export default initProviders;