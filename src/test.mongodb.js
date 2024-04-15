const database = 'bkap';
const collection = 'Cinemas';

use(database);

db.Cinemas.find({
    location_coordinates: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [106.62818808336782, 10.755802258050624] // địa chỉ ví dụ
        },
        $maxDistance: 1000 
      }
    }
  })