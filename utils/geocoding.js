import mongoose from 'mongoose';
import Job from '../models/Job.js'
// Funzione per calcolare la distanza tra due coordinate (puoi usare la tua implementazione)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export const updateJobsWithDistance = async (resolvedJobs, coordinates) => {
  try {
    for (const job of resolvedJobs) {
      const jobLat = parseFloat(job.latitude || 0);
      const jobLon = parseFloat(job.longitude || 0);
      const userLat = parseFloat(coordinates.latitude);
      const userLon = parseFloat(coordinates.longitude);
      const distance = calculateDistance(userLat, userLon, jobLat, jobLon);

      // Aggiorna il documento nel database
      await Job.updateOne(
        { _id: job._id }, // Assumendo che tu stia usando `_id` per identificare i documenti
        {
          $set: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            'company.location': coordinates.address,
          }
        }
      );
    }

    // return resolvedJobs sortati con distance

    console.log('Jobs updated successfully');
    return 
  } catch (error) {
    console.error('Error updating jobs:', error);
  }
};

// Supponiamo che `resolvedJobs` e `coordinates` siano definiti
// Chiamata alla funzione di aggiornamento
// Esempio:
// const resolvedJobs = [/* Array di lavori con i dati originali */];
// const coordinates = { latitude: '40.7128', longitude: '-74.0060', address: 'New York, NY' };

