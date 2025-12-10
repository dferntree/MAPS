const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const { db } = require('./db/db')
const { courses, professorRating } = require('./db/schema')

async function main(){
    const rows = await db.select({ instructor: courses.instructor }).from(courses)
    const unique = [...new Set(rows.map(r => r.instructor).filter(Boolean))]

    for (const instructor of unique) {
        await db.insert(professorRating)
        .values({ 
            instructor, 
            ratingCount: 0, 
            ratingSum: 0, 
            avgRating: null 
        })
    }

    console.log(`Seeded ${unique.length} instructors`)
    process.exit(0)
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})