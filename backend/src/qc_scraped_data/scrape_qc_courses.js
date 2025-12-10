const puppeteer = require('puppeteer');
const fs = require('fs/promises');

async function scrapeQueensCSCI() {
    // Launch headless
    // If headless, browser is invisible (for production)
    // Otherwise you see the browser (for debugging)

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Open a new page/tab
    const page = await browser.newPage();

    try {
        const GLOBAL_SEARCH_URL = "https://globalsearch.cuny.edu/CFGlobalSearchTool/CFSearchToolController";

        // waitUntil: "networkidle2" means:
        // "consider navigation complete when there are no more than 2 network connections for at least 500ms"

        await page.goto(GLOBAL_SEARCH_URL, { waitUntil: "networkidle0" });

        //await page.waitForSelector('input[type="checkbox"][name="inst_selection"][value="QNS01"]', { visible: false });
        const id = 'QNS01';
        await page.waitForSelector(`label[for="${id}"]`, { visible: false });
        await page.click(`label[for="${id}"]`);

        // wait until the underlying input is checked
        await page.waitForFunction(
            sel => !!document.querySelector(sel) && document.querySelector(sel).checked === true,
        {},
  `         #${id}` // or `input[name="inst_selection"][value="${id}"]`
        );

        await page.select('select[name="term_value"]', "1259"); // select spring term (dev tools)

        //Must wait for navigatgion to finish because we're loading a new page

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }), // Waits until no more than 0 network connections for at least 500 ms
            page.click('input[name="next_btn"]') // Or '#submit-button', '.submit-class', etc.
        ]);

        await page.select('select[name="subject_name"]', "MATH"); // select Computer Science as the subject (CMSC for Comp Sci, MATH for math)

        await page.select('select[name="courseCareer"]', "UGRD") // select undergrad

        await page.click('label.switch .slider.round'); //click slider for closed classes as well


        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }), // Waits until no more than 0 network connections for at least 500 ms
            page.click('input[name="search_btn_search"]') // Or '#submit-button', '.submit-class', etc.
        ]);

        const sections = await page.$$eval("div[id^='contentDivImg']", (divs) => {
            const rows = [];
             document.querySelectorAll("div.testing_msg").forEach((headerDiv) => {
                const span = headerDiv.querySelector("span");
                if (!span) return;

                // Full text inside the span, including the CSCI 111 part
                let raw = span.textContent || "";
                raw = raw.replace(/\u00a0/g, " ");      // &nbsp; → normal spaces
                raw = raw.replace(/\s+/g, " ").trim();  // collapse whitespace

                // Expect something like: "Class Section Sub CSCI 111 - Intro Algorithmic Problem Solv"
                const match = raw.match(/([A-Za-z]{3,4})\s+(\d{2,4})/);
                if (!match) return;

                const courseCode = match[1].trim(); // "CSCI"
                const courseNum  = match[2].trim(); // "111"
                const courseTitle = `${courseCode}-${courseNum}`; // "CSCI-111"

                // Get the <a> that controls the content div; parse its href
                const link = span.querySelector("a[id^='imageDivLink']");
                if (!link) return;

                const href = link.getAttribute("href") || "";
                // href looks like: javascript:subjectToggle('contentDivImg0','imageDivLink0');
                const idMatch = href.match(/'([^']*contentDivImg[^']*)'/);
                if (!idMatch) return;

                const contentId = idMatch[1]; // e.g. "contentDivImg0"
                const contentDiv = document.getElementById(contentId);
                if (!contentDiv) return;


                const table = contentDiv.querySelector("table.classinfo");
                if (!table) return;

                const trs = Array.from(table.querySelectorAll("tbody tr"));
                trs.forEach((row) => {
                    const get = (label) => {
                        const cell = row.querySelector(`td[data-label="${label}"]`);
                        return cell ? cell.innerText.trim() : "";
                    };
                    rows.push({
                        courseTitle,
                        classNumber: get("Class"),
                        section: get("Section"),
                        daysAndTimes: get("DaysAndTimes"),
                        room: get("Room"),
                        instructor: get("Instructor"),
                        instructionMode: get("Instruction Mode"),
                        meetingDates: get("Meeting Dates"),
                        courseTopic: get("Course Topic"),
                    });
                });
            });
            return rows
        });

        // Deduplicate by classNumber+section (keep first occurrence)
        const MathSet = new Set(["MATH-122", "MATH-141", "MATH-142", "MATH-143", "MATH-151", "MATH-152", "MATH-120", "MATH-220", "MATH-231", "MATH-241"])

        const deduped = Array.from(new Map(
            sections.map(s => [ `${(s.classNumber||'').trim()}::${(s.section||'').trim()}`, s ])
        ).values());

        const mathFiltered = deduped.filter(s => MathSet.has((s.courseTitle || "").toUpperCase()));
        await fs.writeFile('qc_math_2025_fall.json', JSON.stringify(mathFiltered, null, 2)); // Stringify deduped if CS, otherwise mathFiltered

        //console.log(JSON.stringify(deduped, null, 2));
        console.log(mathFiltered.length) // check for deduped if CS, otherwise mathFiltered

        console.log('\nDone scraping.');
        console.log('Final deduped count (class+section):', deduped.length);
        return mathFiltered; // either mathFiltered for math, or deduped for cs

    } catch (err) {
        console.error("\n ERROR DURING SCRAPING: \n");
        console.error(err.stack || err);
    } finally {
        if (browser) {
            console.log("Closing browser...");
            await browser.close();
        }
    }
}

scrapeQueensCSCI();