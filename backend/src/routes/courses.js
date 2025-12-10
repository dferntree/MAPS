const express = require('express')
const router = express.Router()

const { db } = require('../db/db')
const { courses, professorRating } = require('../db/schema')
const { eq, sql } = require('drizzle-orm')

// Get all instructors - for unique instructor dropdown on homepage
router.get('/instructors', async (req, res) => {
    try {
        const instructors = await db.select({ instructor: professorRating.instructor })
            .from(professorRating)
            .orderBy(professorRating.instructor);
        
        res.json(instructors.map(row => row.instructor));
    } catch (err) {
        console.error('GET /api/courses/instructors error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all unique course titles for a specific term - for schedule builder
router.get('/term-titles', async (req, res) => {
    try {
        const { term } = req.query;
        if (!term) {
            return res.status(400).json({ error: 'term query parameter is required' });
        }

        let q = db.selectDistinct({ courseTitle: courses.courseTitle })
            .from(courses);

        // Filter by term based on meetingDates
        if (term.toLowerCase() === 'spring') {
            q = q.where(
                sql`substring(${courses.meetingDates} from 2 for 1) = '1' AND substring(${courses.meetingDates} from 4 for 1) != '0'`
            );
        } else if (term.toLowerCase() === 'winter') {
            q = q.where(
                sql`substring(${courses.meetingDates} from 2 for 1) = '1' AND substring(${courses.meetingDates} from 4 for 1) = '0'`
            );
        } else if (term.toLowerCase() === 'fall') {
            q = q.where(
                sql`substring(${courses.meetingDates} from 2 for 1) = '8'`
            );
        }

        const titles = await q.orderBy(courses.courseTitle);
        res.json(titles.map(row => row.courseTitle));
    } catch (err) {
        console.error('GET /api/courses/term-titles error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all sections of a course in a specific term - for schedule builder to show available versions
router.get('/term-sections', async (req, res) => {
    try {
        const { title, term } = req.query;
        if (!title || !term) {
            return res.status(400).json({ error: 'title and term query parameters are required' });
        }

        let whereCondition = eq(courses.courseTitle, title);

        // Add term filter
        if (term.toLowerCase() === 'spring') {
            whereCondition = sql`${whereCondition} AND substring(${courses.meetingDates} from 2 for 1) = '1' AND substring(${courses.meetingDates} from 4 for 1) != '0'`;
        } else if (term.toLowerCase() === 'winter') {
            whereCondition = sql`${whereCondition} AND substring(${courses.meetingDates} from 2 for 1) = '1' AND substring(${courses.meetingDates} from 4 for 1) = '0'`;
        } else if (term.toLowerCase() === 'fall') {
            whereCondition = sql`${whereCondition} AND substring(${courses.meetingDates} from 2 for 1) = '8'`;
        }

        const sections = await db.select({
            courseNumber: courses.courseNumber,
            courseTitle: courses.courseTitle,
            courseTopic: courses.courseTopic,
            section: courses.section,
            daysAndTimes: courses.daysAndTimes,
            room: courses.room,
            instructor: courses.instructor,
            instructionMode: courses.instructionMode,
            meetingDates: courses.meetingDates,
        })
        .from(courses)
        .where(whereCondition)
        .orderBy(courses.section);

        res.json(sections);
    } catch (err) {
        console.error('GET /api/courses/term-sections error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all unique course titles, first part of course picker
router.get('/titles', async (req, res) => {
    try {
        const titles = await db.selectDistinct({ courseTitle: courses.courseTitle })
            .from(courses)
            .orderBy(courses.courseTitle);
        
        res.json(titles.map(row => row.courseTitle));
    } catch (err) {
        console.error('GET /api/courses/titles error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get courses for more specific use cases, term for schedule builder, instructor for search, title for course picker
router.get('/', async (req, res) => {
    try {
        const { title, instructor, term } = req.query;

        let q

        if (title) {
            q = db.select({
                ...courses,
                avgRating: professorRating.avgRating,
                ratingCount: professorRating.ratingCount,
            })
            .from(courses) // start from courses
            .leftJoin(professorRating, eq(courses.instructor, professorRating.instructor)) // join professor rating on matching instructor
            .where(eq(courses.courseTitle, title))
            .orderBy(sql`${professorRating.avgRating} DESC NULLS LAST`)

        } else if (instructor) {
            q = db.select({
                ...courses,
                avgRating: professorRating.avgRating,
                ratingCount: professorRating.ratingCount
            })
            .from(courses)
            .leftJoin(professorRating, eq(courses.instructor, professorRating.instructor))
            .where(eq(courses.instructor, instructor))

        } else if (term) {
            q = db.select().from(courses)

            if (term.toLowerCase() === 'spring'){
                q = q.where(
                    sql`substring(${courses.meetingDates} from 2 for 1) = '1' AND substring(${courses.meetingDates} from 4 for 1) != '0'` // if course starts in January, but after first 9 days
                ) 
            } else if (term.toLowerCase() === 'winter') {
                q = q.where(
                    sql`substring(${courses.meetingDates} from 2 for 1) = '1' AND substring(${courses.meetingDates} from 4 for 1) = '0'` // if course starts in January, but during the first 9 days  
                )
            } else if (term.toLowerCase() === 'fall') {
                q = q.where(
                    sql`substring(${courses.meetingDates} from 2 for 1) = '8'` // if course starts in august
                )
            }
        }
        
        const rows = await q // await specific query

        res.json(rows)
    } catch (err) {
        console.error('GET /api/courses error:', err)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
