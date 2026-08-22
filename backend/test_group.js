import axios from 'axios';

const testGroupTrip = async () => {
  try {
    console.log('Testing creation of trip with Adults & Children composition...');
    const response = await axios.post('http://localhost:5000/api/trips', {
      name: 'Family Summer Vacation',
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      totalDays: 10,
      targetBudget: 120000,
      adultsCount: 2,
      childrenCount: 2,
      travelersCount: 4,
      stops: [],
    });

    console.log('✅ Trip created successfully! Response from MySQL:', response.data);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing trip creation:', error.response?.data || error.message);
    process.exit(1);
  }
};

testGroupTrip();
