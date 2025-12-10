const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// encodeURIComponent makes sure that the query doesn't fail due to any kind of parameter


// Courses

export const fetchCourses = async (filters) => {
    let url = `${API_BASE}/api/courses`

    if(filters.title) url += `?title=${encodeURIComponent(filters.title)}`
    else if (filters.instructor) url += `?instructor=${encodeURIComponent(filters.instructor)}`
    else if (filters.term) url += `?term=${encodeURIComponent(filters.term)}`

    const response = await fetch(url)
    if(!response.ok) throw new Error('Failed to fetch courses')
    return response.json()
}

export const fetchInstructors = async () => {
    const response = await fetch(`${API_BASE}/api/courses/instructors`)
    if (!response.ok) throw new Error('Failed to fetch instructors')
    return response.json()
}

export const fetchCourseTitles = async () => {
    const response = await fetch(`${API_BASE}/api/courses/titles`)
    if (!response.ok) throw new Error('Failed to fetch course titles')
    return response.json()
}

export const fetchCoursesByTerm = async (term) => {
    const response = await fetch(`${API_BASE}/api/courses/term-titles?term=${encodeURIComponent(term)}`)
    if (!response.ok) throw new Error('Failed to fetch courses for term')
    return response.json()
}

export const fetchCourseSectionsByTerm = async (title, term) => {
    const response = await fetch(`${API_BASE}/api/courses/term-sections?title=${encodeURIComponent(title)}&term=${encodeURIComponent(term)}`)
    if (!response.ok) throw new Error('Failed to fetch course sections')
    return response.json()
}

// Reviews

export const fetchReviews = async (instructor) => {
    const response = await fetch(
        `${API_BASE}/api/reviews?instructor=${encodeURIComponent(instructor)}`
    )
    if (!response.ok) throw new Error('Failed to fetch reviews')
    return response.json()
}

export const postReview = async ({ instructor, userId, rating, comment }) => {
    const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ instructor, userId, rating, comment })
    })
    if (!response.ok) throw new Error('Failed to post review')
    return response.json()
}

// userData

export const getUserData = async (userId) => {
    const response = await fetch(`${API_BASE}/api/userData?userId=${encodeURIComponent(userId)}`)
    if(!response.ok) throw new Error('Failed to fetch user')
    return response.json()
}

export const createUser = async ({ userId, email }) => {
    const response = await fetch(`${API_BASE}/api/userData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ userId, email })
    })
    if(!response.ok) throw new Error('Failed to create user')
    return response.json()
}

// Mandatory Courses

export const getMandatoryCourse = async (userId) => {
    const response = await fetch(`${API_BASE}/api/userMandatoryCourses/${encodeURIComponent(userId)}`)
    if (!response.ok) throw new Error('Failed to fetch mandatory courses')
    return response.json()
}

export const updateMandatoryCourses = async (userId, updates) => {
    const response = await fetch(`${API_BASE}/api/userMandatoryCourses/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates) // stringify object of format (CSCI_111 : true)
    })
    if (!response.ok) throw new Error('Failed to update mandatory courses')
    return response.json()
}

// Schedules

export const fetchSchedule = async (userId, term) => {
    const response = await fetch(`${API_BASE}/api/schedules?userId=${encodeURIComponent(userId)}&term=${encodeURIComponent(term)}`)
    if (!response.ok) throw new Error('Failed to fetch schedule')
    return response.json()
}

export const saveSchedule = async (userId, term, schedule) => {
    const response = await fetch(`${API_BASE}/api/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, term, schedule })
    })
    if (!response.ok) throw new Error('Failed to save schedule')
    return response.json()
}

export const deleteSchedule = async (userId, term) => {
    const response = await fetch(`${API_BASE}/api/schedules?userId=${encodeURIComponent(userId)}&term=${encodeURIComponent(term)}`, {
        method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete schedule')
    return response.json()
}

