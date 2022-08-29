'use strict';
import 'dotenv/config';
import express  from 'express';
import cors from 'cors';

import validToken from './middleware/validToken.js';

import userRoute from './routes/users.js';
import migrateRoute from './routes/migrate.js';
import emailRoute from './routes/email.js';
import administratorRoute from './routes/administrator.js';
import preEnrollment from './routes/pre-enrollment.js';

const app = express();

app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(validToken);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/', userRoute);
app.use('/migrate', migrateRoute);
app.use('/email', emailRoute);
app.use('/api/administrator', administratorRoute);
app.use('/api/pre-enrollment', preEnrollment);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});