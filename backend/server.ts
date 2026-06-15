import app from './app';
import './config/database'; // initialise la DB

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));