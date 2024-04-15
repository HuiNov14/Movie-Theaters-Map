const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/bkap', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Cinema = mongoose.model('Cinema', {
  location_coordinates: {
    type: { type: String },
    coordinates: [Number],
  },
  // Thêm các trường dữ liệu khác nếu cần
});

// Khởi tạo một route mới để lấy một biến bất kỳ từ một cinema bất kỳ trong db
app.get('/api/getRandomCinemaVariable', async (req, res) => {
  try {
    // Lấy một cinema bất kỳ từ cơ sở dữ liệu
    const randomCinema = await Cinema.findOne();
    // Lấy một biến bất kỳ từ cinema này (ví dụ: có thể là location_coordinates)
    const randomVariable = randomCinema.location_coordinates;
    // Trả về biến này dưới dạng JSON
    res.json({ randomVariable });
  } catch (error) {
    console.error('Error getting random cinema variable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
