const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


//load env vars
dotenv.config({ path: './config/config.env' });
const app = express();

//connect to db
connectDB();

//Route file
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//Body parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//File Uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent XSS attack
app.use(xss());

//rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 minutes
    max: 10
});
app.use(limiter);

//prevent http param pollution
app.use(hpp());

//enable cors
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount router
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

//Handle unhandle promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //close server and  exit process
    server.close(() => process.exit(1));
});