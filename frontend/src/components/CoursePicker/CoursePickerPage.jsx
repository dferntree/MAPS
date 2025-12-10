import { useState, useEffect } from "react"
import { fetchCourses, fetchCourseTitles } from "../../api/api"

function CoursePickerPage () {
    const [uniqueCourses, setUniqueCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [selectedCourseTopic, setSelectedCourseTopic] = useState(null)
    const [professorSections, setProfessorSections] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch all unique course titles on mount
    useEffect(() => {
        const loadCourses = async () => {
            try {
                setIsLoading(true)
                const titles = await fetchCourseTitles()
                setUniqueCourses(titles)
            } catch (error) {
                console.error('Failed to load courses:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadCourses()
    }, [])

    // Fetch sections for selected course
    const handleCourseClick = async (courseTitle) => {
        setSelectedCourse(courseTitle)
        
        try {
            const sections = await fetchCourses({ title: courseTitle })
            setProfessorSections(sections)
            // Get the course topic from the first section (all sections have same topic)
            if (sections.length > 0) {
                setSelectedCourseTopic(sections[0].courseTopic)
            }
        } catch (error) {
            console.error('Failed to load course sections:', error)
            setProfessorSections([])
            setSelectedCourseTopic(null)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen bg-amber-50 p-8 font-press flex items-center justify-center">
            <div className="text-2xl text-amber-900">Loading courses...</div>
        </div>
    }

    return (
        <div className="min-h-screen bg-amber-50 p-8 font-press">
            <h1 className="text-4xl font-bold text-amber-900 text-center mb-8">Course Picker</h1>           
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side - Course List */}
                <div className="bg-[rgb(224,202,148)] rounded-lg border-4 border-amber-800 p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-amber-900 mb-4">Courses:</h2>
                    <div className="bg-white rounded-lg p-4 h-[600px] overflow-y-auto border-2 border-amber-800 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-200 [&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-thumb]:rounded">
                        <div className="space-y-3">
                            {uniqueCourses.map((course, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleCourseClick(course)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedCourse === course
                                            ? 'bg-amber-100 border-amber-600 shadow-md'
                                            : 'bg-amber-50 border-amber-400 hover:bg-amber-100'
                                    }`}
                                >
                                    <div className="font-bold text-amber-900 text-center">
                                        {course}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side - Professor Sections */}
                <div className="bg-[rgb(224,202,148)] rounded-lg border-4 border-amber-800 p-6 shadow-lg">
                    {selectedCourse ? (
                        <>
                            <h2 className="text-2xl font-bold text-amber-900 mb-4">
                                {selectedCourse}
                            </h2>
                            {selectedCourseTopic && (
                                <p className="text-lg text-amber-800 mb-4 italic">
                                    {selectedCourseTopic}
                                </p>
                            )}
                            <div className="bg-white rounded-lg p-4 h-[600px] overflow-y-auto border-2 border-amber-800 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-200 [&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-thumb]:rounded">
                                <div className="space-y-4">
                                    {professorSections.map((section, index) => (
                                        <div key={index} className="bg-amber-50 rounded-lg p-4 border-2 border-amber-600">
                                            {/* Rating and Professor */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="text-yellow-500 text-lg">
                                                    {"⭐".repeat(Math.floor(section.avgRating || 0))}
                                                    {"☆".repeat(5 - Math.floor(section.avgRating || 0))}
                                                    {section.ratingCount ? ` (${section.ratingCount})` : ''}
                                                </div>
                                            </div>
                                            
                                            {/* Professor Name Banner */}
                                            <div className="bg-red-400 text-white text-center font-bold py-2 px-4 rounded mb-3">
                                                {section.instructor}
                                            </div>

                                            {/* Meeting Times */}
                                            <div className="space-y-2">
                                                <div className="font-semibold text-amber-900">Meeting Time:</div>
                                                <div className="bg-white p-3 rounded border border-amber-400">
                                                    {section.daysAndTimes}
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-2 text-sm text-amber-800">
                                                    <div><span className="font-semibold">Section:</span> {section.section}</div>
                                                    <div><span className="font-semibold">Room:</span> {section.room}</div>
                                                    <div><span className="font-semibold">Mode:</span> {section.instructionMode}</div>
                                                    <div><span className="font-semibold">Dates:</span> {section.meetingDates}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-[600px] flex items-center justify-center text-amber-700 text-lg">
                            Select a course to view available sections
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CoursePickerPage   