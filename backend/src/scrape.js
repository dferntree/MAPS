const fs = require('fs');
const path = require('path')

const { db } = require('./db/db')
const { courses } = require('./db/schema')

async function importCourses() {
    // Load and parse the JSON file

    const filePath = path.join(__dirname, 'qc_scraped_data/qc_math_2025_fall.json') // File path for scraped json
    const raw = fs.readFileSync(filePath, 'utf-8')
    const courseList = JSON.parse(raw)

    for (const course of courseList) {
        await db.insert(courses).values({
            courseTitle: course.courseTitle,
            courseTopic: course.courseTopic,
            section: course.section,
            daysAndTimes: course.daysAndTimes,
            room: course.room,
            instructor: course.instructor,
            instructionMode: course.instructionMode,
            meetingDates: course.meetingDates,
        })
    }

    console.log('Courses imported successfully!')
}

importCourses().catch(err => {
    console.error('Error importing courses:', err)
})
