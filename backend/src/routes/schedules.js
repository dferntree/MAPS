const express = require('express')
const router = express.Router()

const { db } = require('../db/db')
const { userScheduleCourses } = require('../db/schema')
const { and, eq } = require('drizzle-orm')

// Get user's schedule for a specific term
router.get('/', async (req, res) => {
    try {
        const { userId, term } = req.query
        if (!userId || !term) {
            return res.status(400).json({ error: 'userId and term are required' })
        }

        const row = await db.select().from(userScheduleCourses).where(and(
            eq(userScheduleCourses.userId, userId),
            eq(userScheduleCourses.term, term)
        ))

        if (!row.length) return res.json(null)
        return res.json(row[0])
    } catch (err) {
        console.error('GET /api/schedules error:', err)
        res.status(500).json({ error: err.message })
    }
})

// Save/upsert a user's schedule for a term
router.post('/', async (req, res) => {
    try {
        const { userId, term, schedule } = req.body
        if (!userId || !term || !schedule) {
            return res.status(400).json({ error: 'userId, term, and schedule are required' })
        }

        // Delete existing schedule for this user+term
        await db.delete(userScheduleCourses).where(and(
            eq(userScheduleCourses.userId, userId),
            eq(userScheduleCourses.term, term)
        ))

        // Insert new schedule
        const inserted = await db.insert(userScheduleCourses).values({
            userId,
            term,
            schedule,
        }).returning()

        res.status(201).json(inserted[0])
    } catch (err) {
        console.error('POST /api/schedules error:', err)
        res.status(500).json({ error: err.message })
    }
})

// Delete a user's schedule for a term
router.delete('/', async (req, res) => {
    try {
        const { userId, term } = req.query
        if (!userId || !term) {
            return res.status(400).json({ error: 'userId and term are required' })
        }

        await db.delete(userScheduleCourses).where(and(
            eq(userScheduleCourses.userId, userId),
            eq(userScheduleCourses.term, term)
        ))

        res.json({ deleted: true })
    } catch (err) {
        console.error('DELETE /api/schedules error:', err)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
