document.addEventListener("DOMContentLoaded", function () {
    loadDashboardData();
});

async function loadDashboardData() {

    try {

        const response = await fetch("http://127.0.0.1:5000/api/reports");

        if (!response.ok) {
            throw new Error("Failed to fetch reports");
        }

        const reports = await response.json();

        console.log("Reports from backend:", reports);


        // ==========================================
        // BASIC COUNTS
        // ==========================================

        let potholes = 0;
        let garbage = 0;
        let waterlogging = 0;
        let streetlights = 0;
        let other = 0;

        let highPriority = 0;
        let mediumPriority = 0;
        let lowPriority = 0;


        reports.forEach(function (report) {

            const category = (
                report.ai_category ||
                report.category ||
                ""
            ).toLowerCase();


            const severity = (
                report.ai_severity ||
                report.severity ||
                ""
            ).toLowerCase();


            // CATEGORY COUNT
            if (
                category.includes("pothole") ||
                category.includes("road")
            ) {

                potholes++;

            } else if (
                category.includes("garbage") ||
                category.includes("waste")
            ) {

                garbage++;

            } else if (
                category.includes("water") ||
                category.includes("drain")
            ) {

                waterlogging++;

            } else if (
                category.includes("streetlight") ||
                category.includes("lighting") ||
                category.includes("light")
            ) {

                streetlights++;

            } else {

                other++;

            }


            // SEVERITY COUNT
            if (severity === "high") {

                highPriority++;

            } else if (severity === "medium") {

                mediumPriority++;

            } else if (severity === "low") {

                lowPriority++;

            }

        });


        // ==========================================
        // TOP STATISTICS
        // ==========================================

        setText(
            "totalReports",
            reports.length
        );

        setText(
            "potholesCount",
            potholes
        );

        setText(
            "garbageCount",
            garbage
        );

        setText(
            "waterloggingCount",
            waterlogging
        );

        setText(
            "streetlightsCount",
            streetlights
        );

        setText(
            "highPriorityCount",
            highPriority
        );


        // ==========================================
        // ISSUE DISTRIBUTION
        // ==========================================

        setText(
            "potholesBarCount",
            potholes
        );

        setText(
            "garbageBarCount",
            garbage
        );

        setText(
            "streetlightsBarCount",
            streetlights
        );

        setText(
            "waterloggingBarCount",
            waterlogging
        );

        setText(
            "otherBarCount",
            other
        );


        updateBar(
            ".pothole-bar",
            potholes,
            reports.length
        );

        updateBar(
            ".garbage-bar",
            garbage,
            reports.length
        );

        updateBar(
            ".streetlight-bar",
            streetlights,
            reports.length
        );

        updateBar(
            ".water-bar",
            waterlogging,
            reports.length
        );

        updateBar(
            ".other-bar",
            other,
            reports.length
        );


        // ==========================================
        // AI ANALYSIS SUMMARY
        // ==========================================

        const aiSummaryReports = reports.filter(function (report) {

            return (
                report.ai_category !== null &&
                report.ai_category !== undefined &&
                report.ai_category !== ""
            );

        });


        console.log(
            "AI analyzed reports:",
            aiSummaryReports.length
        );


        let totalConfidence = 0;
        let totalPriority = 0;


        aiSummaryReports.forEach(function (report) {

            totalConfidence += Number(
                report.ai_confidence || 0
            );

            totalPriority += Number(
                report.priority_score || 0
            );

        });


        const aiAnalyzedCount =
            aiSummaryReports.length;


        const averageConfidence =
            aiAnalyzedCount > 0
                ? totalConfidence / aiAnalyzedCount
                : 0;


        const averagePriority =
            aiAnalyzedCount > 0
                ? totalPriority / aiAnalyzedCount
                : 0;


        setText(
            "aiAnalyzedCount",
            aiAnalyzedCount
        );


        setText(
            "averageConfidence",
            averageConfidence.toFixed(2) + "%"
        );


        setText(
            "averagePriority",
            Math.round(averagePriority) + "/100"
        );


        // ==========================================
        // AI SEVERITY DISTRIBUTION
        // ==========================================

        let highAI = 0;
        let mediumAI = 0;
        let lowAI = 0;


        aiSummaryReports.forEach(function (report) {

            const severity = (
                report.ai_severity ||
                report.severity ||
                ""
            ).toLowerCase();


            if (severity === "high") {

                highAI++;

            } else if (severity === "medium") {

                mediumAI++;

            } else if (severity === "low") {

                lowAI++;

            }

        });


        setText(
            "highPriorityAI",
            highAI
        );

        setText(
            "mediumPriorityAI",
            mediumAI
        );

        setText(
            "lowPriorityAI",
            lowAI
        );


        console.log(
            "AI Severity Distribution:",
            {
                high: highAI,
                medium: mediumAI,
                low: lowAI
            }
        );


        console.log(
            "Average AI Confidence:",
            averageConfidence.toFixed(2) + "%"
        );


        console.log(
            "Average Priority Score:",
            Math.round(averagePriority)
        );


        // ==========================================
        // MOST AFFECTED AREAS
        // ==========================================

        updateAffectedAreas(reports);


    } catch (error) {

        console.error(
            "Unable to load dashboard data:",
            error
        );

    }

}


// ==================================================
// MOST AFFECTED AREAS
// ==================================================

function updateAffectedAreas(reports) {

    // Only reports having valid GPS coordinates
    const geoReports = reports.filter(function (report) {

        const latitude = Number(report.latitude);
        const longitude = Number(report.longitude);

        return (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        );

    });


    console.log(
        "Reports with GPS:",
        geoReports.length
    );


    // If there are no GPS reports
    if (geoReports.length === 0) {

        setText(
            "areaName1",
            "No GPS Data"
        );

        setText(
            "areaCount1",
            "0 reports"
        );


        setText(
            "areaName2",
            "No GPS Data"
        );

        setText(
            "areaCount2",
            "0 reports"
        );


        setText(
            "areaName3",
            "No GPS Data"
        );

        setText(
            "areaCount3",
            "0 reports"
        );


        setText(
            "areaName4",
            "No GPS Data"
        );

        setText(
            "areaCount4",
            "0 reports"
        );

        return;
    }


    // ==========================================
    // FIND GPS BOUNDARY
    // ==========================================

    let minLat = Infinity;
    let maxLat = -Infinity;

    let minLon = Infinity;
    let maxLon = -Infinity;


    geoReports.forEach(function (report) {

        const lat = Number(report.latitude);
        const lon = Number(report.longitude);


        if (lat < minLat) {
            minLat = lat;
        }

        if (lat > maxLat) {
            maxLat = lat;
        }

        if (lon < minLon) {
            minLon = lon;
        }

        if (lon > maxLon) {
            maxLon = lon;
        }

    });


    // ==========================================
    // CREATE 4 LOCAL ZONES
    // ==========================================

    const middleLat =
        (minLat + maxLat) / 2;

    const middleLon =
        (minLon + maxLon) / 2;


    const zones = [

        {
            name: "North-West Zone",
            count: 0
        },

        {
            name: "North-East Zone",
            count: 0
        },

        {
            name: "South-West Zone",
            count: 0
        },

        {
            name: "South-East Zone",
            count: 0
        }

    ];


    // ==========================================
    // PUT REPORTS INTO ZONES
    // ==========================================

    geoReports.forEach(function (report) {

        const lat = Number(report.latitude);
        const lon = Number(report.longitude);


        const isNorth =
            lat >= middleLat;

        const isEast =
            lon >= middleLon;


        if (isNorth && !isEast) {

            zones[0].count++;

        } else if (isNorth && isEast) {

            zones[1].count++;

        } else if (!isNorth && !isEast) {

            zones[2].count++;

        } else {

            zones[3].count++;

        }

    });


    // ==========================================
    // SORT BY MOST REPORTS
    // ==========================================

    zones.sort(function (a, b) {

        return b.count - a.count;

    });


    console.log(
        "Affected Areas:",
        zones
    );


    // ==========================================
    // UPDATE DASHBOARD
    // ==========================================

    for (let i = 0; i < 4; i++) {

        const position = i + 1;

        setText(
            "areaName" + position,
            zones[i].name
        );


        setText(
            "areaCount" + position,
            zones[i].count + " reports"
        );

    }

}


// ==================================================
// SET TEXT HELPER
// ==================================================

function setText(elementId, value) {

    const element =
        document.getElementById(elementId);


    if (element) {

        element.textContent = value;

    }

}


// ==================================================
// UPDATE PROGRESS BAR
// ==================================================

function updateBar(
    selector,
    value,
    total
) {

    const bar =
        document.querySelector(selector);


    if (!bar || total === 0) {

        return;

    }


    const percentage =
        (value / total) * 100;


    bar.style.width =
        percentage + "%";

}