import express, { Request, Response, NextFunction, Express } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './Library/Logging';

const router: Express = express();

mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        console.log('Connected to DB');
    })
    .catch((error) => {
        console.log(error);
    });

const StartServer = () => {
    /** Log the request */
    router.use((req: Request, res: Response, next: NextFunction) => {
        /** Log the req */
        Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log the res */
            Logging.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });

        next();
    });
};

router.use(express.urlencoded({ extended: true }));
router.use(express.json());


  router.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

      if (req.method == 'OPTIONS') {
          res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
          return res.status(200).json({});
      }

      next();
  });

  /** Healthcheck */
    router.get('/ping', (req: Request, res: Response, next: NextFunction) => res.status(200).json({ message: 'pong' }));

     router.use((req: Request, res: Response, next: NextFunction) => {
         const error = new Error('Not found');

         Logging.error(error);

         res.status(404).json({
             message: error.message
         });
     });

 
     
   http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));  