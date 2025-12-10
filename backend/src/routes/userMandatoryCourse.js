const  express = require('express')
const router = express.Router()

const { db } = require('../db/db')
const { userMandatoryCourseCompleted } = require('../db/schema')
const { eq } = require('drizzle-orm')

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.select().from(userMandatoryCourseCompleted).where(eq(userMandatoryCourseCompleted.userId, userId));
        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result[0]);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch mandatory courses' });
    }
})

router.patch('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body; // e.g. { CSCI_111: true, MATH_122: true }
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }
        console.log('PATCH userMandatoryCourse', { userId, updates });
        await db.update(userMandatoryCourseCompleted)
            .set(updates)
            .where(eq(userMandatoryCourseCompleted.userId, userId));
        res.json({ success: true });
    }catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update mandatory courses' });
    }
})

module.exports = router