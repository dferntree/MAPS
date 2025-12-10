import { useState, useEffect } from "react";
import Calendar from "./Calendar";
import { fetchCoursesByTerm, fetchCourseSectionsByTerm, fetchSchedule, saveSchedule, deleteSchedule } from "../../api/api";

const ScheduleBuilder = ({ user }) => {
    const [selectedTerm, setSelectedTerm] = useState('fall');
    const [searchInput, setSearchInput] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseSections, setCourseSections] = useState([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [addError, setAddError] = useState('');

    // Load available courses when term changes
    useEffect(() => {
        const loadCourses = async () => {
            try {
                setLoading(true);
                const courses = await fetchCoursesByTerm(selectedTerm);
                setAvailableCourses(courses);
                setFilteredCourses([]);
                setSearchInput('');
                setSelectedCourse(null);
                setCourseSections([]);
                setCurrentSectionIndex(0);
                setAddError('');
            } catch (err) {
                console.error('Failed to load courses:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [selectedTerm]);

    // Load user's existing schedule for this term
    useEffect(() => {
        if (!user) return;

        const loadSchedule = async () => {
            try {
                setEvents([])
                const schedule = await fetchSchedule(user.uid, selectedTerm);
                if (schedule && schedule.schedule) {
                    setEvents(schedule.schedule);
                }
            } catch (err) {
                console.error('Failed to load schedule:', err);
            }
        };

        loadSchedule();
    }, [user, selectedTerm]);

    // Handle course search
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        setAddError('');

        if (value.trim()) {
            const filtered = availableCourses.filter(course =>
                course.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses([]);
        }
    };

    // Handle course selection
    const handleCourseSelect = async (course) => {
        try {
            setLoading(true);
            setSelectedCourse(course);
            setSearchInput(course);
            setFilteredCourses([]);
            
            const sections = await fetchCourseSectionsByTerm(course, selectedTerm);
            setCourseSections(sections);
            setCurrentSectionIndex(0);
        } catch (err) {
            console.error('Failed to load course sections:', err);
        } finally {
            setLoading(false);
        }
    };

    // Navigate through sections with arrows
    const nextSection = () => {
        if (courseSections.length > 0) {
            setCurrentSectionIndex((prev) => (prev + 1) % courseSections.length);
        }
    };

    const prevSection = () => {
        if (courseSections.length > 0) {
            setCurrentSectionIndex((prev) => (prev - 1 + courseSections.length) % courseSections.length);
        }
    };

    // Check for time conflicts
    const hasTimeConflict = (newStartTime, newEndTime, newDay, existingEvents) => {
        const newStart = toMinutes(newStartTime);
        const newEnd = toMinutes(newEndTime);

        return existingEvents.some(evt => {
            if (evt.day !== newDay) return false;
            const existingStart = toMinutes(evt.startTime || evt.time || '00:00');
            const existingEnd = toMinutes(evt.endTime || evt.time || '23:59');
            // Check if intervals overlap
            return (newStart < existingEnd && newEnd > existingStart);
        });
    };

    const toMinutes = (timeStr = '00:00') => {
        const [hh = '0', mm = '0'] = (timeStr || '').split(':');
        const h = parseInt(hh, 10);
        const m = parseInt(mm, 10);
        return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    };

    // Add selected section to schedule (fan out per day + parse times)
    const addToSchedule = () => {
        if (!selectedCourse || courseSections.length === 0) return;

        const currentSection = courseSections[currentSectionIndex];
        const daysAndTimes = currentSection.daysAndTimes || '';

        // Check course limits per term
        const courseLimit = selectedTerm === 'winter' ? 1 : 6;
        const currentCourseCount = Object.keys(
            events.reduce((acc, evt) => {
                const key = evt.class || evt.courseTitle || evt.courseNumber || `course-${evt.daysAndTimes}`;
                acc[key] = true;
                return acc;
            }, {})
        ).length;

        if (currentCourseCount >= courseLimit) {
            setAddError(`You've reached the maximum of ${courseLimit} course${courseLimit > 1 ? 's' : ''} for ${selectedTerm} term.`);
            return;
        }

        // Extract day codes (Mo, Tu, We, Th, Fr, Sa, Su)
        const dayMatches = (daysAndTimes.split(' ')[0] || '').match(/Mo|Tu|We|Th|Fr|Sa|Su/g) || ['Mon'];
        const dayMap = { Mo: 'Mon', Tu: 'Tue', We: 'Wed', Th: 'Thu', Fr: 'Fri', Sa: 'Sat', Su: 'Sun' };
        const days = dayMatches.map((d) => dayMap[d] || d);

        // Extract start/end times from the pattern "<days> <start> - <end>"
        const parts = daysAndTimes.split(' ');
        const startToken = parts[1] || '09:00AM';
        const endToken = parts[3] || parts[2] || '10:00AM';

        const to24Hour = (token) => {
            const match = token.match(/(\d{1,2}):(\d{2})(AM|PM)/i);
            if (!match) return '09:00';
            let [_, hh, mm, mer] = match;
            let h = parseInt(hh, 10);
            const m = parseInt(mm, 10);
            const merUpper = mer.toUpperCase();
            if (merUpper === 'PM' && h < 12) h += 12;
            if (merUpper === 'AM' && h === 12) h = 0;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        const startTime = to24Hour(startToken);
        const endTime = to24Hour(endToken);

        // Check for time conflicts on any of the new days
        for (const day of days) {
            if (hasTimeConflict(startTime, endTime, day, events)) {
                setAddError(`Time conflict detected on ${day} from ${startToken} to ${endToken}. Please choose a different section.`);
                return;
            }
        }

        setAddError('');
        const palette = ['#a64d5d', '#d96b76', '#4d6fa6', '#5da68f', '#7e4da6', '#f0a6b5', '#c7a987'];
        const color = palette[Math.floor(Math.random() * palette.length)];

        const newEvents = days.map((day) => ({
            startTime,
            endTime,
            day,
            time: startTime, // backward compatibility with Calendar
            class: `${currentSection.courseTitle}:${currentSection.section}`,
            color,
            courseNumber: currentSection.courseNumber,
            instructor: currentSection.instructor,
            room: currentSection.room,
            daysAndTimes,
        }));

        setEvents([...events, ...newEvents]);
        // Reset selections
        setSelectedCourse(null);
        setCourseSections([]);
        setSearchInput('');
        setCurrentSectionIndex(0);
    };

    // Remove a course from schedule (removes all day instances)
    const removeCourse = (courseKey) => {
        setEvents(events.filter(evt => {
            const key = evt.class || evt.courseTitle || evt.courseNumber || `course-${evt.daysAndTimes}`;
            return key !== courseKey;
        }));
    };

    // Save schedule to backend
    const handleSaveSchedule = async () => {
        if (!user) {
            alert('Please log in to save your schedule');
            return;
        }

        try {
            setSaving(true);
            await saveSchedule(user.uid, selectedTerm, events);
            alert('Schedule saved successfully!');
        } catch (err) {
            console.error('Failed to save schedule:', err);
            alert('Failed to save schedule');
        } finally {
            setSaving(false);
        }
    };

    // Clear schedule for current term
    const handleClearSchedule = async () => {
        if (!user) {
            alert('Please log in to clear your schedule');
            return;
        }

        if (!window.confirm(`Clear all courses from ${selectedTerm} term? This cannot be undone.`)) {
            return;
        }

        try {
            setSaving(true);
            await deleteSchedule(user.uid, selectedTerm);
            setEvents([]);
            alert('Schedule cleared successfully!');
        } catch (err) {
            console.error('Failed to clear schedule:', err);
            alert('Failed to clear schedule');
        } finally {
            setSaving(false);
        }
    };

    const currentSection = courseSections[currentSectionIndex];

    // Deduplicate course list display so multi-day courses show once
    const courseCards = Object.values(
        events.reduce((acc, evt) => {
            const key = evt.class || evt.courseTitle || evt.courseNumber || `course-${evt.daysAndTimes}`;
            if (!acc[key]) acc[key] = evt;
            return acc;
        }, {})
    );

    return (
        <div className="min-h-screen bg-amber-50 p-8">
            {/* Header with Term Selector */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-5xl font-press text-amber-900 mb-6">Schedule Builder</h1>
                
                {/* Term Selector */}
                <div className="flex gap-4 items-center mb-6">
                    <label className="text-xl font-press text-amber-900">Term:</label>
                    <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        className="bg-[rgb(224,202,148)] border-4 border-amber-800 rounded-lg px-4 py-2 font-press text-amber-900"
                    >
                        <option value="fall">Fall</option>
                        <option value="winter">Winter</option>
                        <option value="spring">Spring</option>
                    </select>
                </div>

                {/* Course Search */}
                <div className="bg-[rgb(224,202,148)] border-4 border-amber-800 rounded-lg p-6 mb-6">
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <label className="block font-press text-amber-900 mb-2">Search Course:</label>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={handleSearchChange}
                                placeholder="Search courses..."
                                className="w-full bg-white border-2 border-amber-800 rounded px-4 py-2"
                            />
                            
                            {/* Error Message */}
                            {addError && (
                                <div className="mt-2 text-red-700 text-sm font-press">
                                    {addError}
                                </div>
                            )}
                            
                            {/* Course Dropdown */}
                            {filteredCourses.length > 0 && (
                                <div className="mt-2 bg-white border-2 border-amber-800 rounded max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-200 [&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-thumb]:rounded">
                                    {filteredCourses.map((course, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleCourseSelect(course)}
                                            className="w-full text-left px-4 py-2 hover:bg-amber-100 border-b border-amber-200 last:border-b-0 font-press text-amber-900"
                                        >
                                            {course}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section Selector with Arrows */}
                        {selectedCourse && courseSections.length > 0 && (
                            <div className="flex-1">
                                <label className="block font-press text-amber-900 mb-2">Sections:</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={prevSection}
                                        className="bg-amber-700 text-white px-3 py-2 rounded font-press hover:bg-amber-800"
                                    >
                                        ←
                                    </button>
                                    <div className="flex-1 bg-white border-2 border-amber-800 rounded p-3">
                                        <p className="font-press text-sm text-amber-900">
                                            Section {currentSectionIndex + 1} of {courseSections.length}
                                        </p>
                                        {currentSection && (
                                            <div className="text-xs text-amber-800 mt-2">
                                                <p><strong>Instructor:</strong> {currentSection.instructor}</p>
                                                <p><strong>Time:</strong> {currentSection.daysAndTimes}</p>
                                                <p><strong>Room:</strong> {currentSection.room}</p>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={nextSection}
                                        className="bg-amber-700 text-white px-3 py-2 rounded font-press hover:bg-amber-800"
                                    >
                                        →
                                    </button>
                                </div>
                                <button
                                    onClick={addToSchedule}
                                    className="w-full mt-2 bg-amber-700 text-white px-4 py-2 rounded font-press hover:bg-amber-800"
                                >
                                    Add to Schedule
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Calendar and Sidebar */}
            <div className="flex gap-8 justify-center items-start max-w-7xl mx-auto mb-8">
                <div className="bg-[rgb(224,202,148)] border-4 border-amber-800 w-[330px] h-[578px] rounded-[18px] px-4 py-4 shadow-md flex flex-col">
                    <h2 className="text-amber-900 text-2xl font-press mb-3">Courses</h2>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-200 [&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-thumb]:rounded">
                        {courseCards.length === 0 ? (
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-[18px] shadow-inner flex items-center justify-center px-3 text-sm h-20 text-amber-400 font-press">
                                No courses added yet
                            </div>
                        ) : (
                            courseCards.map((evt, idx) => {
                                const title = evt.class || evt.courseTitle || evt.courseNumber || `Course ${idx + 1}`;
                                const timeLabel = (evt.daysAndTimes || `${evt.day || ""} ${evt.time || ""}`).trim() || "Time TBD";
                                const instructor = evt.instructor || "Instructor TBD";
                                const room = evt.room || "Room TBD";
                                const courseKey = evt.class || evt.courseTitle || evt.courseNumber || `course-${evt.daysAndTimes}`;

                                return (
                                    <div
                                        key={`event-${idx}`}
                                        className="bg-white border-2 border-amber-200 rounded-[18px] shadow-sm px-3 py-2 text-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-3 h-12 rounded-full mt-1 shadow-sm"
                                                style={{ backgroundColor: evt.color || "#A67A4D" }}
                                                aria-hidden
                                            ></div>
                                            <div className="text-amber-900 leading-tight flex-1">
                                                <div className="font-bold text-base font-press">{title}</div>
                                                <div className="text-xs text-amber-700">{timeLabel}</div>
                                                <div className="text-xs text-amber-700">{instructor}</div>
                                                <div className="text-xs text-amber-700">{room}</div>
                                            </div>
                                            <button
                                                onClick={() => removeCourse(courseKey)}
                                                className="text-red-600 hover:text-red-800 font-bold text-xl"
                                                title="Remove course"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <Calendar events={events} />
            </div>

            {/* Save Button */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={handleSaveSchedule}
                    disabled={saving || events.length === 0}
                    className="bg-amber-700 text-white px-8 py-3 rounded-lg font-press text-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : 'Save Schedule'}
                </button>
                <button
                    onClick={handleClearSchedule}
                    disabled={saving || events.length === 0}
                    className="bg-red-700 text-white px-8 py-3 rounded-lg font-press text-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Clear Schedule
                </button>
            </div>
        </div>
    );
};

export default ScheduleBuilder;
