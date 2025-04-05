const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Function to test the courses API
const testCoursesAPI = async () => {
  try {
    console.log('Testing Courses API...');
    
    // Get all published courses (doesn't require auth)
    const coursesResponse = await axios.get(`${API_URL}/courses/published`);
    console.log('Published courses response:', coursesResponse.data);
    
    if (coursesResponse.data.success) {
      console.log(`Found ${coursesResponse.data.count} published courses`);
      
      // Print course titles
      if (coursesResponse.data.data && coursesResponse.data.data.length > 0) {
        console.log('Course titles:');
        coursesResponse.data.data.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title} (ID: ${course._id})`);
        });
        
        // Try to get details for the first course
        if (coursesResponse.data.data[0]._id) {
          const courseId = coursesResponse.data.data[0]._id;
          console.log(`\nFetching details for course ID: ${courseId}`);
          
          try {
            const courseDetailsResponse = await axios.get(`${API_URL}/courses/${courseId}`);
            console.log('Course details response:', courseDetailsResponse.data);
          } catch (detailsError) {
            console.error('Error fetching course details:', detailsError.message);
            if (detailsError.response) {
              console.error('Response data:', detailsError.response.data);
            }
          }
        }
      }
    } else {
      console.log('Failed to fetch published courses');
    }
  } catch (error) {
    console.error('Error testing courses API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

// Main function
const main = async () => {
  try {
    await testCoursesAPI();
    console.log('\nAPI tests completed');
  } catch (error) {
    console.error('Error in main function:', error);
  }
};

// Run the tests
main(); 