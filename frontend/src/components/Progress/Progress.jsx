import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import * as d3 from 'd3';
import TreasureMap from '../../assets/TreasureMap.png';
import { getMandatoryCourse, updateMandatoryCourses } from '../../api/api';

const courses = [
  { id: 'CS_111', name: 'CS 111- Intro To Algorithmic Problem Solving', type: 'cs' },
  { id: 'CS_211', name: 'CS 211- Object-Oriented-Programming (C++)',  type: 'cs' },
  { id: 'CS_220', name: 'CS 220- Discrete', type: 'cs' },
  {id :'CS_320',name:'CS 320-Theory of Comp',type:'cs'},
  { id: 'CS_212', name: 'CS 212- Object-Oriented-Programming (JAVA)', type: 'cs' },
  { id: 'CS_313', name: 'CS 313- Data Structures',  type: 'cs' },
  { id: 'CS_323', name: 'CS 323- Theory of Computation',  type: 'cs' },
  { id: 'CS_343', name: 'CS 343- Computer Networks',  type: 'cs' },
  { id: 'CS_370', name: 'CS 370- Operating Systems',  type: 'cs' },
  { id: 'CS_316', name: 'CS 316- Database Systems',  type: 'cs' },
  { id: 'CS_340', name: 'CS 340- Software Engineering',  type: 'cs' },
  {id:'CS_240',name:'CS 240-Comp org and assembly language',type:'cs'},
  {id: 'CS_331', name:'CS 331- DataBase Systems', type:'cs'},
  

  { id: 'MATH_122', name: 'MATH 122- Precalculus',  type: 'math' },
  { id: 'MATH_141', name: 'MATH 141- Calculus 1', type: 'math' },
  {id: 'MATH_151', name: 'MATH 151- Calculus 1',  type: 'math' },
  {id: 'MATH_152', name: 'MATH 152- Calculus 2',  type: 'math' },
  {id:'MATH_142', name:'MATH 142- Calculus 2', type:'math'},
  {id:'MATH_143', name:'MATH 143- Calculus 3', type:'math'},
  {id:'MATH_241', name:'MATH 241- Prob & Stat', type:'math'},
  { id: 'MATH_120', name: 'MATH 120- Discrete Math',  type: 'math' },
  {id:'MATH_231', name:'MATH 231- Linear Algebra', type:'math'},

];
const links= [
  { source: 'CS_111', target: 'CS_211' },
  { source: 'CS_111', target: 'CS_212' },
  { source: 'CS_111', target: 'CS_240' },
  { source: 'CS_111', target: 'CS_220'},
  
  { source: 'CS_211', target: 'CS_313' },
  { source: 'CS_212', target: 'CS_313' },
  { source: 'CS_220', target: 'CS_320' },
  { source: 'CS_313', target: 'CS_323' },
  { source: 'CS_313', target: 'CS_331' },
  { source: 'CS_313', target: 'CS_370' },
  
  { source: 'CS_313', target: 'CS_316' },
  { source: 'CS_320', target: 'CS_316' },
  { source: 'CS_240', target: 'CS_316' },
  
  { source: 'CS_313', target: 'CS_340' },
  { source: 'CS_240', target: 'CS_340' },
  
  { source: 'CS_240', target: 'CS_343' },
  { source: 'CS_320', target: 'CS_343' },
  
  { source: 'MATH_122', target: 'MATH_141' },
  { source: 'MATH_120', target: 'CS_220'},
  { source: 'MATH_122', target: 'MATH_151' },
  { source: 'MATH_122', target: 'MATH_120' },
  { source: 'MATH_141', target: 'MATH_142' },
  { source: 'MATH_141', target: 'CS_220'},
  { source: 'MATH_142', target: 'MATH_143' },
  { source: 'MATH_143', target: 'MATH_241' },
  { source: 'MATH_151', target: 'CS_220'},
  { source: 'MATH_151', target: 'MATH_152' },
  { source: 'MATH_152', target: 'MATH_241' },
  { source: 'MATH_120', target: 'CS_211' },
  { source: 'MATH_120', target: 'CS_212' },
  { source: 'MATH_141', target: 'MATH_231' },
  { source: 'MATH_151', target: 'MATH_231' },
];

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, once: false });
  
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({
  items = [],
  onItemSelect,
  completedIds = new Set(),
  unlockedIds = new Set(),
  showGradients = true,
  displayScrollbar = true,
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  return (
    <div className="relative w-full">
      <div
        ref={listRef}
        className={`max-h-[400px] overflow-y-auto p-4 ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-200 [&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-thumb]:rounded'
            : 'scrollbar-hide'
        }`}
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            delay={0.05 * index}
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              if (onItemSelect) {
                onItemSelect(item, index);
              }
            }}
          >
            <div className={`p-4 rounded-lg border-2 transition-all ${
              completedIds.has(item.id)
                ? 'bg-green-100 border-green-600'
                : unlockedIds.has(item.id)
                ? 'bg-amber-50 border-amber-600'
                : 'bg-amber-100 border-amber-800'
            } ${selectedIndex === index ? 'ring-2 ring-amber-500' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  completedIds.has(item.id)
                    ? 'bg-green-600 border-green-700'
                    : 'bg-white border-amber-400'
                }`}>
                  {completedIds.has(item.id) && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                </div>
                <p className="text-amber-900 m-0 flex-1">{item.name}</p>
              </div>
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-50 to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-50 to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
};

function Progress({ user }) {
  const [completedCourses, setCompletedCourses] = useState(new Set([]));
  const[unlockedCourses,setUnlockedCourses]=useState(new Set(['MATH_122','CS_111']))
  const [coursePositions, setCoursePositions] = useState({});

  // Map between frontend IDs (CS_111) and DB columns (CSCI_111)
  const toDbId = (id) => (id.startsWith('CS_') ? `CSCI_${id.split('_')[1]}` : id);
  const toFrontId = (id) => (id.startsWith('CSCI_') ? `CS_${id.split('_')[1]}` : id);

  // Helper to normalize link refs (they may be strings or objects after D3)
  const getId = (ref) => (typeof ref === 'string' ? ref : ref.id);

  // Helper to check if all prerequisites for a course are met
  const arePrerequisitesMet = (targetId, completed) => {
    const prerequisites = links.filter(l => getId(l.target) === targetId).map(l => getId(l.source));
    if (targetId === 'CS_211') return completed.has('CS_111')
    if (targetId === 'CS_212') return completed.has('CS_111')
    if (targetId === 'CS_220') return completed.has('CS_111') && (completed.has('MATH_141') || completed.has('MATH_151'))
    if (targetId === 'MATH_231') return completed.has('MATH_141') || completed.has('MATH_151')
    if (targetId === 'CS_313') return completed.has('CS_211') && completed.has('CS_212');
    if (targetId === 'CS_316') return completed.has('CS_313') && completed.has('CS_320') && completed.has('CS_240');
    if (targetId === 'CS_340') return completed.has('CS_313') && completed.has('CS_240');
    if (targetId === 'CS_343') return completed.has('CS_240') && completed.has('CS_320');
    if (targetId === 'CS_320') return completed.has('CS_220');
    return prerequisites.length === 0 || prerequisites.some(prereq => completed.has(prereq));
  };

  // Recompute unlocked courses from current completions (used on load)
  const deriveUnlocked = (completed) => {
    const unlocked = new Set(['MATH_122', 'CS_111']);
    links.forEach(link => {
      const targetId = getId(link.target);
      if (arePrerequisitesMet(targetId, completed)) unlocked.add(targetId);
    });
    if (check_220(completed)) unlocked.add('CS_220');
    return unlocked;
  };
  
  // Load user's completed courses on mount
  useEffect(() => {
    if (!user) return;
    
    const loadUserCourses = async () => {
      try {
        const userCourses = await getMandatoryCourse(user.uid);
        // Convert DB row to Set of completed courses
        const completed = new Set(
          Object.entries(userCourses)
            .filter(([key, value]) => value === true && key !== 'userId')
            .map(([key]) => toFrontId(key))
        );
        setCompletedCourses(completed);
        setUnlockedCourses(deriveUnlocked(completed));
      } catch (error) {
        console.error('Failed to load user courses:', error);
      }
    };
    
    loadUserCourses();
  }, [user]);
  
  // Run D3 simulation once on mount
  useEffect(() => {
    // Create a copy of courses so D3 doesn't mutate the original
    const coursesCopy = courses.map(c => ({ ...c }));
    
    const simulation = d3.forceSimulation(coursesCopy)
      .force("link", d3.forceLink(links).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("collision", d3.forceCollide(50))
      .force("y", d3.forceY(d => {
        // CS Tree (left side)
        if(d.id === 'CS_111') return 100;  // Root
        if(d.id === 'CS_211' || d.id === 'CS_212' || d.id === 'CS_220' || d.id === 'CS_240') return 200;  // Level 2
        if(d.id === 'CS_313') return 300;  // Level 3
        if(d.id === 'CS_320' || d.id === 'CS_323' || d.id === 'CS_331' || d.id === 'CS_370') return 400;  // Level 4
        if(d.id === 'CS_343' || d.id === 'CS_316' || d.id === 'CS_340') return 500;  // Level 5
        // Math Tree (right side)
        if(d.id === 'MATH_122') return 100;  // Root
        if(d.id === 'MATH_141' || d.id === 'MATH_151' || d.id === 'MATH_120') return 200;  // Level 2
        if(d.id === 'MATH_142' || d.id === 'MATH_152') return 320;  // Level 3
        if(d.id === 'MATH_143') return 420;  // Level 4
        if(d.id === 'MATH_241') return 520;  // Level 5 (bottom)
        
        return 300;
      }).strength(1.0))
      .force("x", d3.forceX(d => {
        // CS Tree - Left side (centered around x=200)
        if(d.id === 'CS_111') return 200;
        if(d.id === 'CS_211') return 150;
        if(d.id === 'CS_212') return 200;
        if(d.id === 'CS_220') return 280;
        if(d.id === 'CS_313') return 200;
        if(d.id === 'CS_320') return 200;
        if(d.id === 'CS_316') return 120;
        if(d.id === 'CS_340') return 180;
        if(d.id === 'CS_323') return 220;
        if(d.id === 'CS_343') return 280;
        if(d.id === 'CS_240') return 100;
        if(d.id === 'CS_331') return 260;
        if(d.id === 'CS_370') return 140;
        // Math Tree - Right side (centered around x=450)
        if(d.id === 'MATH_122') return 450;
        if(d.id === 'MATH_120') return 380;
        if(d.id === 'MATH_141') return 480;
        if(d.id === 'MATH_151') return 420;
        if(d.id === 'MATH_142') return 500;
        if(d.id === 'MATH_152') return 420;
        if(d.id === 'MATH_143') return 500;
        if(d.id === 'MATH_241') return 460;
        
        return 300;
      }).strength(0.8))
      .stop();

    for (let i = 0; i < 400; ++i) {
      simulation.tick();
    }
    
    // Calculate bounds and scale positions to fit the 600x600px container
    const positions = {};
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    coursesCopy.forEach(course => {
      positions[course.id] = { x: course.x, y: course.y };
      minX = Math.min(minX, course.x);
      maxX = Math.max(maxX, course.x);
      minY = Math.min(minY, course.y);
      maxY = Math.max(maxY, course.y);
    });
    
    // Scale to fit within the image bounds
    const width = 600;
    const height = 600;
    const padding = 50;
    const scaleX = width / (maxX - minX + padding * 2);
    const scaleY = height / (maxY - minY + padding * 2);
    
    const scaledPositions = {};
    Object.entries(positions).forEach(([id, pos]) => {
      scaledPositions[id] = {
        x: (pos.x - minX + padding) * scaleX,
        y: (pos.y - minY + padding) * scaleY
      };
    });
    
    console.log('D3 simulation complete. Positions:', Object.keys(scaledPositions).length, 'courses');
    setCoursePositions(scaledPositions);
  }, []);
  
  const check_220=(completed)=>{
  const hasCS111=completed.has('CS_111');
  const hasMATH120=completed.has('MATH_120');
  const hasCalculus=completed.has('MATH_141')||completed.has('MATH_151');
  return hasCS111&&hasMATH120&&hasCalculus;
  }

  const toggleCourse = async (courseId) => {
    if (!unlockedCourses.has(courseId)) {
      return;
    }

    const updates = {}; // batch DB changes
    const newCompleted = new Set(completedCourses); // work from current state
    const isUnchecking = newCompleted.has(courseId);

    if (isUnchecking) {
      // Un-complete the course and remove downstream completions & unlocks
      newCompleted.delete(courseId);
      updates[toDbId(courseId)] = false;

      const removeDownstream = (id) => {
        links.forEach(link => {
          const sourceId = getId(link.source);
          const targetId = getId(link.target);
          if (sourceId === id) {
            // remove completed downstream course and recurse
            if (newCompleted.has(targetId)) {
              newCompleted.delete(targetId);
              updates[toDbId(targetId)] = false;
              removeDownstream(targetId);
            }
          }
        });
      };

      removeDownstream(courseId);

      // Update state with all removals
      setCompletedCourses(newCompleted);

      // Re-evaluate ALL unlocked courses to see if they still have prerequisites met
      const newUnlocked = new Set(unlockedCourses);
      newUnlocked.forEach(unlockedId => {
        // Special handling: Keep both MATH_141 and MATH_151 unlocked if MATH_122 is completed
        if ((unlockedId === 'MATH_141' || unlockedId === 'MATH_151') && newCompleted.has('MATH_122')) {
          return; // Don't remove these
        }
        if (!arePrerequisitesMet(unlockedId, newCompleted)) {
          newUnlocked.delete(unlockedId);
        }
      });
      
      // Special handling: When unchecking MATH_141 or MATH_151, re-unlock the alternative
      if (courseId === 'MATH_141' && newCompleted.has('MATH_122')) {
        newUnlocked.add('MATH_151');
      } else if (courseId === 'MATH_151' && newCompleted.has('MATH_122')) {
        newUnlocked.add('MATH_141');
      }
      
      setUnlockedCourses(newUnlocked);

      // Re-evaluate special unlock conditions
      if (!check_220(newCompleted)) {
        newUnlocked.delete('CS_220');
        setUnlockedCourses(newUnlocked);
      }

    } else {
      // Complete the course and unlock downstream courses
      newCompleted.add(courseId);
      updates[toDbId(courseId)] = true;
      
      setCompletedCourses(newCompleted);

      // Check all potential downstream courses to see if they should be unlocked
      const newUnlocked = new Set(unlockedCourses);
      links.forEach(link => {
        const sourceId = getId(link.source);
        const targetId = getId(link.target);
        if (sourceId === courseId) {
          // Only unlock if ALL prerequisites are now met
          if (arePrerequisitesMet(targetId, newCompleted)) {
            newUnlocked.add(targetId);
          }
        }
      });

      // Special handling: unlock CS_220 if prerequisites are satisfied
      if (check_220(newCompleted)) {
        newUnlocked.add('CS_220');
      }

      // Special handling for mutual math alternatives: ensure the alternative is locked when one is chosen
      if (courseId === 'MATH_141') {
        newUnlocked.delete('MATH_151');
      } else if (courseId === 'MATH_151') {
        newUnlocked.delete('MATH_141');
      }

      setUnlockedCourses(newUnlocked);
    }

    // Persist all changes in one batch
    if (user && Object.keys(updates).length > 0) {
      try {
        console.log('Saving mandatory courses', updates);
        await updateMandatoryCourses(user.uid, updates);
      } catch (err) {
        console.error('Failed to update course:', err);
      }
    }
  };
     
           
      

  const csCourses = courses.filter(c => c.type === 'cs');
  const mathCourses = courses.filter(c => c.type === 'math');
  
  // Format courses for AnimatedList with IDs
  const csItems = csCourses.map(c => ({ id: c.id, name: c.name }));
  const mathItems = mathCourses.map(c => ({ id: c.id, name: c.name }));

  return (
   <div className="min-h-screen bg-amber-50 p-8 font-press">
      <h1 className="text-4xl font-bold text-amber-900 mb-12 text-center">Course Progress Tracker</h1>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Map Section */}
        <div>
          <div className="relative border-4 border-amber-800 rounded-lg shadow-2xl">
            <img src={TreasureMap} alt="Treasure Map" className="w-full" style={{ imageRendering: 'pixelated'}}/>
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {Object.keys(coursePositions).length > 0 && links.map((link, index) => {
                // Handle case where D3 might convert link.source/target to objects
                const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
                const targetId = typeof link.target === 'string' ? link.target : link.target.id;
                
                const sourcePos = coursePositions[sourceId];
                const targetPos = coursePositions[targetId];
                
                if (!sourcePos || !targetPos) {
                  console.warn(`Missing position for ${sourceId} or ${targetId}`);
                  return null;
                }
                
                return (
                  <line
                    key={index}
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke="rgba(20, 18, 2, 0.7)"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
       {courses.map(course => {
         const pos = coursePositions[course.id];
         if (!pos) return null;
         
         return (
           <div
             key={course.id}
             onClick={() => unlockedCourses.has(course.id) && toggleCourse(course.id)}
             className={`absolute transform -translate-x-1/2 -translate-y-1/2 
               ${unlockedCourses.has(course.id) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
             style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
             title={course.name}
           >
             {/* Visible course box */}
             <div className={`px-0.5 py-0 rounded border-1 font-bold text-xs whitespace-nowrap transition-all
               ${!unlockedCourses.has(course.id) 
                 ? 'bg-gray-300 border-gray-500 text-gray-700 opacity-50'
                 : completedCourses.has(course.id)
                 ? 'bg-green-400 border-green-700 text-white shadow-lg'
                 : 'bg-amber-300 border-amber-700 text-amber-900 shadow-md hover:shadow-lg'
               }`}>
               {course.id.replace('_', ' ')}
             </div>
           </div>
         );
       })}
          </div>
        </div>

        {/* Course Lists with AnimatedList */}
        {/* Course Lists with AnimatedList */}
<div className="space-y-6">
<div>
  <div className="flex items-center justify-center mb-4">
    
    <h2 className="text-2xl font-bold text-amber-900 text-center">
      COMPUTER SCIENCE COURSES
    </h2>
  </div>

  <AnimatedList
            items={csItems}
            onItemSelect={(item, index) => toggleCourse(item.id)}
            completedIds={completedCourses}
            unlockedIds={unlockedCourses}
            showGradients={true}
            displayScrollbar={true}
          />
</div>

        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-4 text-center">
            MATH COURSES
          </h2>
          <AnimatedList
            items={mathItems}
            onItemSelect={(item, index) => toggleCourse(item.id)}
            completedIds={completedCourses}
            unlockedIds={unlockedCourses}
            showGradients={true}
            displayScrollbar={true}
          />
        </div>

        <div className="bg-amber-800 text-white p-4 rounded-lg text-center">
          <p className="text-xl font-bold">
          </p>
        </div>
      </div>
    </div>
  </div>
  );
}

export default Progress;