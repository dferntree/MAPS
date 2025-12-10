const express = require('express')
const router = express.Router()

const { db } = require('../db/db')
const { reviews, professorRating } = require('../db/schema')
const { eq, sql } = require('drizzle-orm')

router.get('/', async (req, res) => {
    try{
        const { instructor } = req.query

        if(!instructor){
            res.status(400).json({ error: "Missing instructor, instructor required" })
        }

        const allReviews = await db.select()
        .from(reviews)
        .where(eq(reviews.instructor, instructor))

        res.json(allReviews)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// post new review, simultaneously update professors rating on post
router.post('/', async (req, res) => {
    try{
        const { instructor, userId, rating, comment } = req.body;
        if (!instructor || !userId || !rating) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'rating must be 1-5' })
        }

        await db.transaction(async (tx) => {

            await tx.insert(reviews).values({
                instructor: instructor,
                userId: userId,
                rating,
                comment,
                createdAt: new Date(),
            });

            await tx.update(professorRating)
                .set({
                    ratingSum: sql`${professorRating.ratingSum} + ${rating}`,
                    ratingCount: sql`${professorRating.ratingCount} + 1`,
                    avgRating: sql`round(((${professorRating.ratingSum} + ${rating})::numeric) / (${professorRating.ratingCount} + 1), 2)`
                })
                .where(eq(professorRating.instructor, instructor))
            })

            res.status(201).json({ success: true })
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Failed to post review' })
        }
    })

    module.exports = router