import monogoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const startServer = async(server) => {
    try {
        await monogoose.connect(process.env.MONGO_URL)
        console.log("Database connected");
        server.listen(process.env.PORT, () => {
            console.log(`App is running on http://localhost:${process.env.PORT}`);
        })
    } catch (error) {
        console.error('Error connecting to DB or starting server:', error);
        process.exit(1);
    }
}

export default startServer;