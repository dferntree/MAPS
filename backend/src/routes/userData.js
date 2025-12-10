const express = require('express')
const router = express.Router()

const { db } = require('../db/db')
const { eq } = require('drizzle-orm')
const { userData, userMandatoryCourseCompleted } = require('../db/schema')

// For getting/posting user info

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query

        if(!userId){
            return res.status(400).json({
                error: 'User id param required'
            })
        }

        const [userDataRecord] = await db.select()
            .from(userData)
            .where(eq(userData.userId, userId))

        if(!userDataRecord){
            return res.status(404).json({
                error: 'User not found',
                message: 'This user has not yet been created, call POST first.'
            })
        }
        res.json(userDataRecord)
    } catch (error) {
        console.error('GET /api/userData error:', error)
        res.status(500).json({ error: error.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const { userId, email } =  req.body  

        if (!userId || !email) {
            return res.status(400).json({
                error: 'Both userId and email are required'
            })
        }

        const [existing] = await db.select()
        .from(userData)
        .where(eq(userData.userId, userId))

        if(existing) {
            return res.status(409).json({
                error: 'User already exists',
                data: existing
            })
        }
        const result = await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(userData)
            .values({ userId, email })
            .returning()

            await tx.insert(userMandatoryCourseCompleted)
                .values({ userId })
            
            return newUser
        })
        
        res.status(201).json(result)
    } catch (error) {
        console.error('POST api/user/userData error:', error)
        res.status(500).json({ error: error.message })
    }
})

module.exports = router