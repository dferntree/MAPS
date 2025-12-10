const Calendar = ({ events = [] }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const toMinutes = (timeStr = '07:00') => {
        const [hh = '7', mm = '0'] = (timeStr || '').split(":");
        const h = parseInt(hh, 10);
        const m = parseInt(mm, 10);
        return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    };

    return(
        <div className="w-[750px]">
            <div className="bg-[rgb(224,202,148)] border-4 border-amber-800 w-full rounded-[18px] h-[578px] flex items-center justify-center p-4 shadow-md">
            <div className="w-full max-w-[700px] grid grid-cols-8 gap-3 text-center items-center rounded-[18px]">
                <div className="bg-amber-800 rounded-[18px] w-[76px] h-[35px] flex items-center justify-center text-amber-50 font-press text-sm shadow-sm">
                    <p className="m-0">Time</p>
                </div>
                {/* header badges: placed in their own cell next to Time so you can align them separately */}
                <div className="col-span-7">
                    <div className="w-full mx-auto flex items-center justify-between px-2">
                        {days.map((day) => (
                            <div key={day} className="w-[76px] bg-amber-100 border-2 border-amber-800 rounded-[18px] h-[35px] flex items-center justify-center font-press text-sm text-amber-900 shadow-sm">
                                <p className="m-0">{day}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* second row: left column is the time column (stacked boxes); columns 2–8 are tall day blocks */}
                <div className="flex flex-col items-center gap-1 h-[445px] py-2 no-scrollbar">
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">7-8 AM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">8-9 AM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">9-10 AM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">10-11 AM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">11-12 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">1-2 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">2-3 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">3-4 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">4-5 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">5-6 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">6-7 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">7-8 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">8-9 PM</div>
                    <div className="w-[75px] h-[33px] bg-amber-700 rounded-[18px] flex items-center justify-center text-amber-50 text-[10px] font-press shadow-sm">9-10 PM</div>
                </div>
                <div className="col-span-7 h-[445px] bg-amber-50 border-2 border-amber-800 rounded-[15px] justify-self-center relative overflow-hidden w-[620px] mx-auto grid grid-cols-7 gap-1 p-2 shadow-inner">
                    {/* Day columns with time-positioned class markers */}
                    {days.map((day) => {
                        const dayEvents = events.filter((evt) => evt && evt.day === day);
                        return (
                            <div key={day} className="relative h-full bg-white border border-amber-200 rounded-md">
                                {/* Guide lines for each time slot (7 AM - 10 PM = 15 hours) */}
                                {Array.from({ length: 15 }).map((_, idx) => {
                                    const slotCount = 15;
                                    const topPercent = ((idx + 0.5) / slotCount) * 100;
                                    return (
                                        <div
                                            key={`line-${day}-${idx}`}
                                            className="absolute left-0 right-0 h-px bg-amber-300 opacity-30"
                                            style={{ top: `${topPercent}%`, transform: 'translateY(-50%)' }}
                                        />
                                    );
                                })}
                                {/* Class markers for this day */}
                                {dayEvents.map((evt, i) => {
                                    const startMinutes = 7 * 60; // 7:00 AM
                                    const endMinutes = 22 * 60; // 10:00 PM
                                    const rangeMinutes = endMinutes - startMinutes; // 900 minutes = 15 hours

                                    const start = toMinutes(evt.startTime || evt.time || '07:00');
                                    const end = toMinutes(evt.endTime || evt.time || '08:00');
                                    const clampedStart = Math.max(startMinutes, Math.min(endMinutes, start));
                                    const clampedEnd = Math.max(startMinutes, Math.min(endMinutes, Math.max(end, clampedStart + 30)));
                                    const topPercent = ((clampedStart - startMinutes) / rangeMinutes) * 100;
                                    const heightPercent = ((clampedEnd - clampedStart) / rangeMinutes) * 100;
                                    const bg = evt.color || '#a64d5d';
                                    const className = evt.class ? evt.class.split(':')[1] : 'Class';
                                    return (
                                        <div
                                            key={`marker-${day}-${i}`}
                                            className="absolute left-1 right-1 rounded-md flex items-center justify-center text-[9px] font-bold text-white overflow-hidden shadow-md border border-white/30"
                                            style={{ top: `${topPercent}%`, height: `${Math.max(4, heightPercent)}%`, background: bg }}
                                            title={`${evt.startTime || evt.time} - ${evt.endTime || ''} ${className}`}
                                        >
                                            {className}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

            </div>
            </div>
        </div>
    )
}

export default Calendar;