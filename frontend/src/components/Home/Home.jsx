import { useState, useEffect } from "react";
import { fetchInstructors } from "../../api/api";
import mapAnim from "../../assets/MapAnimation.png";

function Home({ onProfessorSelect }) {
    const [instructors, setInstructors] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Fetch all instructors on mount
    useEffect(() => {
        const loadInstructors = async () => {
            try {
                const data = await fetchInstructors();
                setInstructors(data);
            } catch (error) {
                console.error("Error fetching instructors:", error);
            }
        };
        loadInstructors();
    }, []);

    // Filter instructors based on search input
    useEffect(() => {
        if (searchInput.trim() === "") {
            setFilteredInstructors([]);
            setShowDropdown(false);
        } else {
            const filtered = instructors.filter((instructor) =>
                instructor.toLowerCase().includes(searchInput.toLowerCase()) && instructor != 'TBA'
            );
            setFilteredInstructors(filtered);
            setShowDropdown(true);
        }
    }, [searchInput, instructors]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (filteredInstructors.length > 0) {
            onProfessorSelect(filteredInstructors[0]);
            setShowDropdown(false);
        }
    };

    const handleSelectProfessor = (instructor) => {
        onProfessorSelect(instructor);
        setSearchInput(instructor);
        setShowDropdown(false);
    };

    return (
        <div className="min-h-screen bg-amber-50 p-8 font-press">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-amber-900 text-center mb-12">Professor Search</h1>
                
                <div className="bg-[rgb(224,202,148)] rounded-lg border-4 border-amber-800 p-8 shadow-lg">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search for a professor..."
                                className="flex-1 px-4 py-3 border-2 border-amber-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 bg-white text-gray-800"
                            />
                            <button
                                type="submit"
                                className="px-8 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-bold"
                            >
                                Search
                            </button>
                        </div>

                        {/* Dropdown */}
                        {showDropdown && filteredInstructors.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-amber-800 rounded-lg shadow-lg max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-200 [&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-thumb]:rounded">
                                {filteredInstructors.map((instructor, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelectProfessor(instructor)}
                                        className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-amber-200 last:border-b-0 text-amber-900 font-semibold"
                                    >
                                        {instructor}
                                    </div>
                                ))}
                            </div>
                        )}

                        {showDropdown && filteredInstructors.length === 0 && searchInput && (
                            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-amber-800 rounded-lg shadow-lg px-4 py-3 text-gray-600">
                                No professors found
                            </div>
                        )}
                    </form>
                </div>

                {/* Sprite animation under the search card */}
                <div className="mt-6 flex justify-center">
                    <div
                        className="map-sprite"
                        style={{ backgroundImage: `url(${mapAnim})` }}
                        aria-hidden
                    />
                </div>
            </div>
        </div>
    );
}

export default Home;