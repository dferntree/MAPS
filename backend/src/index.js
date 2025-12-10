const express = require('express')

const cors = require('cors')

// import cors middleware

const coursesRouter = require('./routes/courses')

const reviewsRouter = require('./routes/reviews')

const userDataRouter = require('./routes/userData')

const userMandatoryCoursesRouter = require('./routes/userMandatoryCourse')
const schedulesRouter = require('./routes/schedules')

const app = express()

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Parse JSON requests back to objects
app.use(express.json())

// construct routes
app.use('/api/courses', coursesRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/userData', userDataRouter)
app.use('/api/userMandatoryCourses', userMandatoryCoursesRouter)
app.use('/api/schedules', schedulesRouter)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})