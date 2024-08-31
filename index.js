import express from 'express';
import cors from 'cors';  // Importa il pacchetto cors
import connectDB from './config/db.js';
import jobRoutes from './routes/jobRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Connessione a MongoDB
connectDB();

// Configurazione di CORS
const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use('/api', jobRoutes);

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
