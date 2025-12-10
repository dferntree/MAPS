import { pgTable, serial, text, boolean, integer, jsonb, numeric, timestamp } from 'drizzle-orm/pg-core'

const courses = pgTable('courses', {
    courseNumber: serial('courseNumber').primaryKey(),
    courseTitle: text('courseTitle').notNull(),
    courseTopic: text('courseTopic').notNull(),
    section: text('section').notNull(),
    daysAndTimes: text('daysAndTimes').notNull(),
    room: text('room').notNull(),
    instructor: text('instructor').notNull(),
    instructionMode: text('instructionMode').notNull(),
    meetingDates:text('meetingDates').notNull(),
})

const userData = pgTable('userData', {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    email: text('email').notNull(),
})

const userScheduleCourses = pgTable('userScheduleCourses', {
    scheduleId: serial('scheduleId').primaryKey(),
    userId: text('userId').notNull(),
    term: text('term').notNull(), // e.g., 'spring', 'winter', 'fall'
    schedule: jsonb('schedule').notNull(), // jsonb payload for the schedule entries
})

const professorRating = pgTable('professorRating', {
    id: serial('id').primaryKey(),
    instructor: text('instructor').notNull(),
    ratingCount: integer('ratingCount').default(0).notNull(),
    ratingSum: integer('ratingSum').default(0).notNull(),
    avgRating: numeric('avgRating', { precision: 3, scale: 2 }),
})

const reviews = pgTable('reviews', {
    id: serial('id').primaryKey(),
    instructor: text('instructor').notNull(),
    userId: text('userId').notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    createdAt: timestamp('createdAt').defaultNow(),
})


const userMandatoryCourseCompleted = pgTable('userMandatoryCourseCompleted', {
    userId: text('userId').primaryKey(),
    MATH_122: boolean('MATH_122').default(false),
    CSCI_111: boolean('CSCI_111').default(false),
    CSCI_211: boolean('CSCI_211').default(false),
    CSCI_212: boolean('CSCI_212').default(false),
    CSCI_220: boolean('CSCI_220').default(false),
    MATH_120: boolean('MATH_120').default(false),
    MATH_141: boolean('MATH_141').default(false),
    MATH_142: boolean('MATH_142').default(false),
    MATH_143: boolean('MATH_143').default(false),
    MATH_151: boolean('MATH_151').default(false),
    MATH_152: boolean('MATH_152').default(false),
    MATH_231: boolean('MATH_231').default(false),
    MATH_241: boolean('MATH_241').default(false),
    CSCI_240: boolean('CSCI_240').default(false),
    CSCI_313: boolean('CSCI_313').default(false),
    CSCI_316: boolean('CSCI_316').default(false),
    CSCI_320: boolean('CSCI_320').default(false),
    CSCI_323: boolean('CSCI_323').default(false),
    CSCI_331: boolean('CSCI_331').default(false),
    CSCI_340: boolean('CSCI_340').default(false),
    CSCI_343: boolean('CSCI_343').default(false),
    CSCI_370: boolean('CSCI_370').default(false),
})



export { courses, userData, userMandatoryCourseCompleted, professorRating, reviews, userScheduleCourses }