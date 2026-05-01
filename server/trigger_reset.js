import axios from 'axios';

async function resetDemo() {
  try {
    const response = await axios.post('http://localhost:5000/api/admin/reset-demo', {
      apiKey: 'syncup-reset-key-2024'
    });
    console.log("Success:", response.data);
  } catch (error) {
    console.error("Failed:", error.response ? error.response.data : error.message);
  }
}

resetDemo();
