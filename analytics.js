// =====================================================
// CIVICLENS AI - LIVE ANALYTICS
// =====================================================

const API_URL = "http://127.0.0.1:5000/api/reports";

let allReports = [];


// =====================================================
// LOAD REPORTS
// =====================================================

async function loadReports() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch reports");
        }

        allReports = await response.json();

        console.log("Analytics Reports:", allReports);

        updateAnalytics();

    } catch (error) {

        console.error("Analytics loading error:", error);

    }

}


// =====================================================
// GET SELECTED PERIOD
// =====================================================

function getSelectedPeriod() {

    const periodElement =
        document.getElementById("period");

    if (!periodElement) {
        return 6;
    }

    return Number(periodElement.value) || 6;

}


// =====================================================
// FILTER REPORTS BY MONTH
// =====================================================

function getPeriodReports() {

    const months = getSelectedPeriod();

    const now = new Date();

    const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - months + 1,
        1
    );

    return allReports.filter(function (report) {

        if (!report.created_at) {
            return true;
        }

        const reportDate =
            new Date(report.created_at);

        return reportDate >= startDate;

    });

}


// =====================================================
// CATEGORY
// =====================================================

function getCategory(report) {

    return (
        report.ai_category ||
        report.category ||
        "other"
    )
        .toString()
        .toLowerCase();

}


// =====================================================
// SEVERITY
// =====================================================

function getSeverity(report) {

    return (
        report.ai_severity ||
        report.severity ||
        ""
    )
        .toString()
        .toLowerCase();

}


// =====================================================
// CATEGORY COUNTS
// =====================================================

function calculateCategories(reports) {

    const counts = {
        pothole: 0,
        garbage: 0,
        waterlogging: 0,
        streetlight: 0,
        other: 0
    };


    reports.forEach(function (report) {

        const category = getCategory(report);

        if (
            category.includes("pothole") ||
            category.includes("road")
        ) {

            counts.pothole++;

        }

        else if (
            category.includes("garbage") ||
            category.includes("waste")
        ) {

            counts.garbage++;

        }

        else if (
            category.includes("waterlogging") ||
            category.includes("water") ||
            category.includes("drainage")
        ) {

            counts.waterlogging++;

        }

        else if (
            category.includes("streetlight") ||
            category.includes("lighting") ||
            category.includes("light")
        ) {

            counts.streetlight++;

        }

        else {

            counts.other++;

        }

    });

    return counts;

}


// =====================================================
// SEVERITY COUNTS
// =====================================================

function calculateSeverity(reports) {

    const counts = {
        high: 0,
        medium: 0,
        low: 0
    };


    reports.forEach(function (report) {

        const severity = getSeverity(report);

        if (severity === "high") {

            counts.high++;

        }

        else if (severity === "medium") {

            counts.medium++;

        }

        else if (severity === "low") {

            counts.low++;

        }

    });


    return counts;

}


// =====================================================
// PRIORITY SCORE
// =====================================================

function calculateAveragePriority(reports) {

    const scores = reports
        .map(function (report) {

            return Number(
                report.priority_score
            );

        })
        .filter(function (score) {

            return !isNaN(score);

        });


    if (scores.length === 0) {
        return 0;
    }


    const total =
        scores.reduce(function (sum, score) {

            return sum + score;

        }, 0);


    return Math.round(
        total / scores.length
    );

}


// =====================================================
// ACTIVE HOTSPOTS
// =====================================================

function calculateHotspots(reports) {

    const zones = {};


    reports.forEach(function (report) {

        if (
            report.latitude === null ||
            report.longitude === null ||
            report.latitude === undefined ||
            report.longitude === undefined
        ) {
            return;
        }


        const lat =
            Number(report.latitude);

        const lon =
            Number(report.longitude);


        if (
            isNaN(lat) ||
            isNaN(lon)
        ) {
            return;
        }


        // Simple geographic grid
        const latZone =
            Math.floor(lat * 100);

        const lonZone =
            Math.floor(lon * 100);


        const zone =
            latZone + "_" + lonZone;


        if (!zones[zone]) {
            zones[zone] = 0;
        }

        zones[zone]++;

    });


    return Object.values(zones)
        .filter(function (count) {

            return count >= 2;

        }).length;

}


// =====================================================
// MONTHLY TREND
// =====================================================

function calculateMonthlyTrend(reports) {

    const months = getSelectedPeriod();

    const result = [];

    const now = new Date();


    for (
        let i = months - 1;
        i >= 0;
        i--
    ) {

        const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );


        const year =
            date.getFullYear();

        const month =
            date.getMonth();


        let count = 0;


        reports.forEach(function (report) {

            if (!report.created_at) {
                return;
            }


            const reportDate =
                new Date(report.created_at);


            if (
                reportDate.getFullYear() === year &&
                reportDate.getMonth() === month
            ) {

                count++;

            }

        });


        result.push({

            label: date.toLocaleString(
                "en-US",
                { month: "short" }
            ),

            count: count

        });

    }


    return result;

}


// =====================================================
// UPDATE OVERVIEW CARDS
// =====================================================

function updateOverview(
    reports,
    severityCounts,
    averagePriority,
    hotspots
) {

    const cards =
        document.querySelectorAll(
            ".overview-card"
        );


    cards.forEach(function (card) {

        const label =
            card.querySelector("p");


        const value =
            card.querySelector("h2");


        const trend =
            card.querySelector(".trend");


        if (!label || !value) {
            return;
        }


        const text =
            label.textContent
                .trim()
                .toLowerCase();


        if (
            text === "monthly reports"
        ) {

            value.textContent =
                reports.length;

            if (trend) {

                trend.textContent =
                    "Live database reports";

            }

        }


        else if (
            text === "active hotspots"
        ) {

            value.textContent =
                hotspots;

            if (trend) {

                trend.textContent =
                    "Based on report concentration";

            }

        }


        else if (
            text === "high severity"
        ) {

            value.textContent =
                severityCounts.high;

            if (trend) {

                const percentage =
                    reports.length > 0
                        ? (
                            severityCounts.high /
                            reports.length
                        ) * 100
                        : 0;

                trend.textContent =
                    percentage.toFixed(1) +
                    "% of reports";

            }

        }


        else if (
            text === "priority score"
        ) {

            value.textContent =
                averagePriority;

            if (trend) {

                trend.textContent =
                    averagePriority >= 70
                        ? "Requires attention"
                        : "Moderate priority";

            }

        }

    });

}


// =====================================================
// UPDATE CATEGORY DISTRIBUTION
// =====================================================

function updateCategoryDistribution(
    categoryCounts
) {

    const legend =
        document.querySelector(
            ".category-legend"
        );


    if (!legend) {
        return;
    }


    const items =
        legend.querySelectorAll(":scope > div");


    const values = [

        categoryCounts.pothole,

        categoryCounts.garbage,

        categoryCounts.waterlogging,

        categoryCounts.streetlight,

        categoryCounts.other

    ];


    items.forEach(function (item, index) {

        const strong =
            item.querySelector("strong");


        if (strong) {

            strong.textContent =
                values[index] || 0;

        }

    });


    const center =
        document.querySelector(
            ".circle-center strong"
        );


    if (center) {

        center.textContent =
            Object.values(
                categoryCounts
            ).reduce(
                (sum, value) =>
                    sum + value,
                0
            );

    }


    // Update donut chart
    const circle =
        document.querySelector(
            ".category-circle"
        );


    const total =
        Object.values(categoryCounts)
            .reduce(
                (sum, value) =>
                    sum + value,
                0
            );


    if (
        circle &&
        total > 0
    ) {

        const p =
            categoryCounts.pothole / total * 100;

        const g =
            categoryCounts.garbage / total * 100;

        const w =
            categoryCounts.waterlogging / total * 100;

        const s =
            categoryCounts.streetlight / total * 100;


        const pEnd = p;

        const gEnd = pEnd + g;

        const wEnd = gEnd + w;

        const sEnd = wEnd + s;


        circle.style.background =
            `conic-gradient(
                #2563eb 0% ${pEnd}%,
                #16a34a ${pEnd}% ${gEnd}%,
                #9333ea ${gEnd}% ${wEnd}%,
                #eab308 ${wEnd}% ${sEnd}%,
                #64748b ${sEnd}% 100%
            )`;

    }

}


// =====================================================
// UPDATE SEVERITY
// =====================================================

function updateSeverity(
    severityCounts
) {

    const rows =
        document.querySelectorAll(
            ".severity-row"
        );


    const values = [

        severityCounts.high,

        severityCounts.medium,

        severityCounts.low

    ];


    const total =
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    rows.forEach(function (row, index) {

        const strong =
            row.querySelector(
                ".severity-label strong"
            );


        const bar =
            row.querySelector(
                ".severity-bar > div"
            );


        const value =
            values[index] || 0;


        if (strong) {

            strong.textContent =
                value;

        }


        if (bar) {

            const percentage =
                total > 0
                    ? (value / total) * 100
                    : 0;

            bar.style.width =
                percentage + "%";

        }

    });

}


// =====================================================
// UPDATE TREND GRAPH
// =====================================================

function updateTrend(trendData) {

    const polyline =
        document.querySelector(
            ".trend-line polyline"
        );


    const circles =
        document.querySelectorAll(
            ".trend-line circle"
        );


    const xAxis =
        document.querySelector(
            ".x-axis"
        );


    if (!polyline) {
        return;
    }


    const width = 550;

    const height = 190;


    const maxValue =
        Math.max(
            ...trendData.map(
                item => item.count
            ),
            1
        );


    const points =
        trendData.map(
            function (item, index) {

                const x =
                    trendData.length === 1
                        ? 20
                        : 20 +
                        (
                            index /
                            (trendData.length - 1)
                        ) * width;


                const y =
                    210 -
                    (
                        item.count /
                        maxValue
                    ) * height;


                return (
                    x.toFixed(1) +
                    "," +
                    y.toFixed(1)
                );

            }
        ).join(" ");


    polyline.setAttribute(
        "points",
        points
    );


    circles.forEach(function (
        circle,
        index
    ) {

        if (!trendData[index]) {
            circle.style.display =
                "none";
            return;
        }


        const x =
            trendData.length === 1
                ? 20
                : 20 +
                (
                    index /
                    (trendData.length - 1)
                ) * width;


        const y =
            210 -
            (
                trendData[index].count /
                maxValue
            ) * height;


        circle.setAttribute(
            "cx",
            x
        );

        circle.setAttribute(
            "cy",
            y
        );

        circle.style.display =
            "block";

    });


    if (xAxis) {

        xAxis.innerHTML = "";


        trendData.forEach(
            function (item) {

                const span =
                    document.createElement(
                        "span"
                    );

                span.textContent =
                    item.label;

                xAxis.appendChild(span);

            }
        );

    }


    const description =
        document.querySelector(
            ".large-card .chart-header p"
        );


    if (description) {

        description.textContent =
            `Number of reports over the last ${getSelectedPeriod()} months`;

    }

}


// =====================================================
// UPDATE INSIGHTS
// =====================================================

function updateInsights(
    categoryCounts,
    reports
) {

    const insightItems =
        document.querySelectorAll(
            ".insight"
        );


    if (!insightItems.length) {
        return;
    }


    let topCategory =
        "civic issues";

    let topCount = 0;


    const names = {

        pothole: "Potholes / Roads",

        garbage: "Garbage / Waste",

        waterlogging: "Waterlogging",

        streetlight: "Streetlights",

        other: "Other Issues"

    };


    Object.keys(categoryCounts)
        .forEach(function (key) {

            if (
                categoryCounts[key] >
                topCount
            ) {

                topCount =
                    categoryCounts[key];

                topCategory =
                    names[key];

            }

        });


    if (insightItems[0]) {

        const strong =
            insightItems[0]
                .querySelector("strong");

        const p =
            insightItems[0]
                .querySelector("p");


        if (strong) {

            strong.textContent =
                topCategory +
                " require attention";

        }


        if (p) {

            p.textContent =
                `${topCategory} represent the largest category with ${topCount} reported issues.`;

        }

    }


    if (insightItems[1]) {

        const p =
            insightItems[1]
                .querySelector("p");


        if (p) {

            p.textContent =
                `${reports.length} civic reports are currently available for geographic analysis.`;

        }

    }


    if (insightItems[2]) {

        const p =
            insightItems[2]
                .querySelector("p");


        if (p) {

            p.textContent =
                "Analytics are calculated directly from the CivicLens database.";

        }

    }

}


// =====================================================
// MAIN UPDATE
// =====================================================

function updateAnalytics() {

    const reports =
        getPeriodReports();


    console.log(
        "Reports for selected period:",
        reports
    );


    const categories =
        calculateCategories(
            reports
        );


    const severity =
        calculateSeverity(
            reports
        );


    const priority =
        calculateAveragePriority(
            reports
        );


    const hotspots =
        calculateHotspots(
            reports
        );


    const trend =
        calculateMonthlyTrend(
            reports
        );


    updateOverview(
        reports,
        severity,
        priority,
        hotspots
    );


    updateCategoryDistribution(
        categories
    );


    updateSeverity(
        severity
    );


    updateTrend(
        trend
    );


    updateInsights(
        categories,
        reports
    );

}


// =====================================================
// PERIOD SELECTOR
// =====================================================

const periodElement =
    document.getElementById(
        "period"
    );


if (periodElement) {

    periodElement.addEventListener(
        "change",
        updateAnalytics
    );

}


// =====================================================
// START
// =====================================================

loadReports();