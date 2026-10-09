let map;
let allReports = [];
let markerClusterGroup;

// ========================================
// INITIALIZE MAP
// ========================================

function initializeMap() {

    map = L.map("realMap").setView(
        [28.4744, 77.5040],
        13
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    // Marker Cluster Group
    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });

    map.addLayer(markerClusterGroup);
}


// ========================================
// LOAD REPORTS
// ========================================

async function loadReports() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/reports"
        );

        if (!response.ok) {
            throw new Error(
                "Unable to fetch reports"
            );
        }

        allReports = await response.json();

        displayReports(allReports);

        document.getElementById(
            "issueCount"
        ).textContent =
            allReports.length +
            " reported civic issues";

    } catch (error) {

        console.error(
            "Map error:",
            error
        );

        document.getElementById(
            "issueCount"
        ).textContent =
            "Unable to load reports";
    }
}


// ========================================
// DISPLAY REPORTS
// ========================================

function displayReports(reports) {

    // Remove old markers
    markerClusterGroup.clearLayers();


    reports.forEach(function (report) {

        // Ignore reports without coordinates
        if (
            report.latitude === null ||
            report.longitude === null
        ) {
            return;
        }


        const latitude =
            parseFloat(report.latitude);

        const longitude =
            parseFloat(report.longitude);


        if (
            isNaN(latitude) ||
            isNaN(longitude)
        ) {
            return;
        }


        // ========================================
        // AI DATA
        // ========================================

        const aiCategory =
            report.ai_category ||
            report.category ||
            "Unknown Issue";


        const aiConfidence =
            report.ai_confidence !== null &&
            report.ai_confidence !== undefined
                ? Number(
                    report.ai_confidence
                ).toFixed(2) + "%"
                : "Not available";


        const aiSeverity =
            report.ai_severity ||
            report.severity ||
            "Unknown";


        const priorityScore =
            report.priority_score !== null &&
            report.priority_score !== undefined
                ? report.priority_score +
                  "/100"
                : "Not available";


        // ========================================
        // CREATE MARKER
        // ========================================

        const marker =
            L.marker([
                latitude,
                longitude
            ]);


        // ========================================
        // POPUP
        // ========================================

        marker.bindPopup(`

            <div
                style="
                    min-width:220px;
                    font-family:Arial,sans-serif;
                "
            >

                <h3
                    style="
                        margin-top:0;
                        margin-bottom:12px;
                    "
                >
                    🤖 ${aiCategory}
                </h3>


                <p>
                    <strong>
                        AI Confidence:
                    </strong>
                    ${aiConfidence}
                </p>


                <p>
                    <strong>
                        Severity:
                    </strong>
                    ${aiSeverity}
                </p>


                <p>
                    <strong>
                        Priority Score:
                    </strong>
                    ${priorityScore}
                </p>


                <p>
                    <strong>
                        Description:
                    </strong>
                    ${report.description ||
                    "No description"}
                </p>


                <p>
                    <strong>
                        Report ID:
                    </strong>
                    ${report.id}
                </p>

            </div>

        `);


        // Add marker to cluster
        markerClusterGroup.addLayer(
            marker
        );

    });
}


// ========================================
// FILTER SETUP
// ========================================

function setupFilters() {

    const filters =
        document.querySelectorAll(
            ".issue-filter"
        );


    filters.forEach(function (filter) {

        filter.addEventListener(
            "change",
            function () {

                applyFilters();

            }
        );

    });
}


// ========================================
// APPLY FILTERS
// ========================================

function applyFilters() {

    const filters =
        document.querySelectorAll(
            ".issue-filter:checked"
        );


    const selectedTypes =
        Array.from(filters).map(
            function (filter) {

                return filter.value.toLowerCase();

            }
        );


    const filteredReports =
        allReports.filter(
            function (report) {

                const category =
                    (
                        report.ai_category ||
                        report.category ||
                        ""
                    ).toLowerCase();


                if (
                    category.includes(
                        "pothole"
                    ) ||
                    category.includes(
                        "road"
                    )
                ) {

                    return selectedTypes.includes(
                        "pothole"
                    );

                }


                if (
                    category.includes(
                        "garbage"
                    ) ||
                    category.includes(
                        "waste"
                    )
                ) {

                    return selectedTypes.includes(
                        "garbage"
                    );

                }


                if (
                    category.includes(
                        "water"
                    ) ||
                    category.includes(
                        "drain"
                    )
                ) {

                    return selectedTypes.includes(
                        "waterlogging"
                    );

                }


                if (
                    category.includes(
                        "streetlight"
                    ) ||
                    category.includes(
                        "lighting"
                    ) ||
                    category.includes(
                        "light"
                    )
                ) {

                    return selectedTypes.includes(
                        "streetlight"
                    );

                }


                if (
                    category.includes(
                        "footpath"
                    )
                ) {

                    return selectedTypes.includes(
                        "footpath"
                    );

                }


                return true;

            }
        );


    displayReports(
        filteredReports
    );
}


// ========================================
// START MAP
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeMap();

        loadReports();

        setupFilters();

    }
);