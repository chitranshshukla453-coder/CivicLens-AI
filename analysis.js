// ==========================================
// CivicLens AI - Analysis Page
// ==========================================


// ------------------------------------------
// Global AI Session
// ------------------------------------------

let civicLensSession = null;

let lastAIResult = {
    category: "",
    confidence: 0,
    severity: "Medium",
    priorityScore: 0
};


// ------------------------------------------
// Load AI Model
// ------------------------------------------

async function loadAIModel() {

    try {

        civicLensSession =
            await ort.InferenceSession.create(
                "civiclens_model.onnx"
            );

        console.log(
            "CivicLens AI model loaded successfully ✅"
        );

        console.log(
            "Input:",
            civicLensSession.inputNames
        );

        console.log(
            "Output:",
            civicLensSession.outputNames
        );

        console.log(
            "INPUT NAME:",
            civicLensSession.inputNames[0]
        );

        console.log(
            "OUTPUT NAME:",
            civicLensSession.outputNames[0]
        );

        console.log(
            "INPUT INFO:",
            civicLensSession.inputMetadata[0]
        );

        console.log(
            "OUTPUT INFO:",
            civicLensSession.outputMetadata[0]
        );

    } catch (error) {

        console.error(
            "AI model loading failed:",
            error
        );

    }

}


loadAIModel();


// ==========================================
// AI INFERENCE
// ==========================================

async function runAIInference(
    imageElement,
    currentReport,
    allReports
) {

    try {

        // ----------------------------------
        // Wait for model
        // ----------------------------------

        while (!civicLensSession) {

            await new Promise(
                resolve => setTimeout(resolve, 200)
            );

        }


        // ----------------------------------
        // Canvas
        // ----------------------------------

        const canvas =
            document.createElement("canvas");

        canvas.width = 224;
        canvas.height = 224;


        const ctx =
            canvas.getContext("2d");


        // Resize image

        ctx.drawImage(
            imageElement,
            0,
            0,
            224,
            224
        );


        const imageData =
            ctx.getImageData(
                0,
                0,
                224,
                224
            );


        const pixels =
            imageData.data;


        // ----------------------------------
        // ImageNet normalization
        // ----------------------------------

        const mean = [
            0.485,
            0.456,
            0.406
        ];

        const std = [
            0.229,
            0.224,
            0.225
        ];


        const input =
            new Float32Array(
                1 * 3 * 224 * 224
            );


        for (let y = 0; y < 224; y++) {

            for (let x = 0; x < 224; x++) {

                const pixelIndex =
                    (y * 224 + x) * 4;


                const r =
                    pixels[pixelIndex] / 255;

                const g =
                    pixels[pixelIndex + 1] / 255;

                const b =
                    pixels[pixelIndex + 2] / 255;


                const index =
                    y * 224 + x;


                input[index] =
                    (r - mean[0]) / std[0];


                input[
                    224 * 224 + index
                ] =
                    (g - mean[1]) / std[1];


                input[
                    2 * 224 * 224 + index
                ] =
                    (b - mean[2]) / std[2];

            }

        }


        // ----------------------------------
        // ONNX Tensor
        // ----------------------------------

        const tensor =
            new ort.Tensor(
                "float32",
                input,
                [1, 3, 224, 224]
            );


        // ----------------------------------
        // Model inference
        // ----------------------------------

        const results =
            await civicLensSession.run({
                x: tensor
            });


        const output =
            results.linear_1.data;


        // ----------------------------------
        // Softmax
        // ----------------------------------

        const maxLogit =
            Math.max(...output);


        const expValues =
            Array.from(output).map(
                function (value) {

                    return Math.exp(
                        value - maxLogit
                    );

                }
            );


        const sumExp =
            expValues.reduce(
                function (sum, value) {

                    return sum + value;

                },
                0
            );


        const probabilities =
            expValues.map(
                function (value) {

                    return value / sumExp;

                }
            );
            console.log("ACTUAL PROBABILITIES:", probabilities);


        // ----------------------------------
        // Classes
        // ----------------------------------

       const classes = [
    "pothole",
    "garbage",
    "waterlogging",
    "streetlight"
];

      let predictedIndex = 0;

for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[predictedIndex]) {
        predictedIndex = i;
    }
}


        const predictedClass =
            classes[predictedIndex];


        const confidence =
            probabilities[predictedIndex] * 100;


        // ----------------------------------
        // AI-Assisted Severity
        // ----------------------------------

        let severity = "Low";


        if (confidence >= 80) {

            severity = "High";

        } else if (confidence >= 60) {

            severity = "Medium";

        } else {

            severity = "Low";

        }


        console.log(
            "AI PREDICTION:",
            predictedClass
        );

        console.log(
            "AI CONFIDENCE:",
            confidence.toFixed(2) + "%"
        );

        console.log(
            "AI SEVERITY:",
            severity
        );


        // ----------------------------------
        // Civic Priority Score
        // ----------------------------------

        const priorityScore =
            calculatePriorityScore(
                predictedClass,
                confidence,
                severity,
                currentReport,
                allReports
            );


        console.log(
            "CIVIC PRIORITY SCORE:",
            priorityScore
        );


        // ----------------------------------
        // Save latest AI result
        // ----------------------------------

        lastAIResult = {

            category:
                predictedClass,

            confidence:
                confidence,

            severity:
                severity,

            priorityScore:
                priorityScore

        };


        // ----------------------------------
        // Update detected issue
        // ----------------------------------

        const detectedIssue =
            document.getElementById(
                "detectedIssue"
            );


        if (detectedIssue) {

            detectedIssue.textContent =
                predictedClass;

        }


        // ----------------------------------
        // Update confidence
        // ----------------------------------

        const confidenceValue =
            document.getElementById(
                "confidenceValue"
            );


        if (confidenceValue) {

            confidenceValue.textContent =
                confidence.toFixed(2) + "%";

        }


        // ----------------------------------
        // Confidence progress
        // ----------------------------------

        const confidenceProgress =
            document.getElementById(
                "confidenceProgress"
            );


        if (confidenceProgress) {

            confidenceProgress.style.width =
                confidence + "%";

        }


        // ----------------------------------
        // Severity
        // ----------------------------------

        const aiSeverityValue =
            document.getElementById(
                "severityValue"
            );


        if (aiSeverityValue) {

            aiSeverityValue.textContent =
                severity.toUpperCase();

        }


        // ----------------------------------
        // Priority score
        // ----------------------------------

        const priorityValue =
            document.getElementById(
                "priorityValue"
            );


        if (priorityValue) {

            priorityValue.textContent =
                priorityScore + "/100";

        }


        // ----------------------------------
        // Optional priority label
        // ----------------------------------

        const priorityLabel =
            document.getElementById(
                "priorityLabel"
            );


        if (priorityLabel) {

            priorityLabel.textContent =
                severity.toUpperCase() +
                " PRIORITY";

        }


        // ----------------------------------
        // Priority description
        // ----------------------------------

        const priorityDescription =
            document.getElementById(
                "priorityDescription"
            );


        if (priorityDescription) {

            if (severity === "High") {

                priorityDescription.textContent =
                    "High-impact issue detected. Immediate attention may be required.";

            } else if (severity === "Medium") {

                priorityDescription.textContent =
                    "This issue should be addressed soon based on AI analysis.";

            } else {

                priorityDescription.textContent =
                    "This issue can be scheduled for routine maintenance.";

            }

        }


    } catch (error) {

        console.error(
            "AI inference error:",
            error
        );

    }

}


// ==========================================
// PRIORITY SCORE CALCULATION
// ==========================================

function calculatePriorityScore(
    category,
    confidence,
    severity,
    currentReport,
    allReports
) {

    // --------------------------------------
    // 1. Severity contribution
    // --------------------------------------

    let severityScore = 10;


    if (severity === "Medium") {

        severityScore = 30;

    } else if (severity === "High") {

        severityScore = 45;

    }


    // --------------------------------------
    // 2. AI confidence contribution
    // Maximum = 30
    // --------------------------------------

    const confidenceScore =
        Math.round(
            confidence * 0.30
        );


    // --------------------------------------
    // 3. Recurrence
    // Same issue category
    // --------------------------------------

    const sameCategoryReports =
        allReports.filter(
            function (report) {

                const reportCategory = (
                    report.ai_category ||
                    report.category ||
                    ""
                ).toLowerCase();


                return (
                    reportCategory ===
                    category.toLowerCase()
                );

            }
        );


    const recurrenceCount =
        Math.max(
            0,
            sameCategoryReports.length - 1
        );


    const recurrenceBonus =
        Math.min(
            15,
            recurrenceCount * 3
        );


    // --------------------------------------
    // 4. Nearby reports
    // --------------------------------------

    let nearbyCount = 0;


    const currentLat =
        Number(
            currentReport?.latitude
        );


    const currentLon =
        Number(
            currentReport?.longitude
        );


    if (
        Number.isFinite(currentLat) &&
        Number.isFinite(currentLon)
    ) {

        allReports.forEach(
            function (report) {

                const lat =
                    Number(report.latitude);

                const lon =
                    Number(report.longitude);


                if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lon)
                ) {

                    return;

                }


                // Don't compare report with itself

                if (
                    currentReport &&
                    report.id == currentReport.id
                ) {

                    return;

                }


                const distance =
                    calculateDistanceKm(
                        currentLat,
                        currentLon,
                        lat,
                        lon
                    );


                // Within 500 metres

                if (distance <= 0.5) {

                    nearbyCount++;

                }

            }
        );

    }


    const nearbyBonus =
        Math.min(
            10,
            nearbyCount * 2
        );


    // --------------------------------------
    // Final Score
    // --------------------------------------

    const finalScore =
        severityScore +
        confidenceScore +
        recurrenceBonus +
        nearbyBonus;


    return Math.min(
        100,
        Math.round(finalScore)
    );

}


// ==========================================
// DISTANCE CALCULATION
// Haversine Formula
// ==========================================

function calculateDistanceKm(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius = 6371;


    const dLat =
        toRadians(lat2 - lat1);


    const dLon =
        toRadians(lon2 - lon1);


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            toRadians(lat1)
        ) *

        Math.cos(
            toRadians(lat2)
        ) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}


function toRadians(degrees) {

    return degrees *
        (Math.PI / 180);

}


// ==========================================
// PAGE LOADED
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupButtons();

        loadAnalysis();

    }
);


// ==========================================
// BUTTONS
// ==========================================

function setupButtons() {


    // --------------------------------------
    // View on Map
    // --------------------------------------

    const mapBtn =
        document.getElementById(
            "mapBtn"
        );


    if (mapBtn) {

        mapBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "map.html";

            }
        );

    }


    // --------------------------------------
    // Confirm Report
    // --------------------------------------

    const confirmBtn =
        document.getElementById(
            "confirmBtn"
        );


    if (confirmBtn) {

        confirmBtn.addEventListener(
            "click",
            async function () {

                const reportId =
                    localStorage.getItem(
                        "lastReportId"
                    );


                if (!reportId) {

                    alert(
                        "Report ID not found."
                    );

                    return;

                }


                // ----------------------------------
                // Get current AI result
                // ----------------------------------

                let detectedIssue =
                    lastAIResult.category;


                let confidence =
                    Number(
                        lastAIResult.confidence
                    );


                let severity =
                    lastAIResult.severity;


                let priorityScore =
                    Number(
                        lastAIResult.priorityScore
                    );


                // ----------------------------------
                // Fallback from page
                // ----------------------------------

                if (!detectedIssue) {

                    const element =
                        document.getElementById(
                            "detectedIssue"
                        );

                    if (element) {

                        detectedIssue =
                            element.textContent.trim();

                    }

                }


                if (
                    !confidence ||
                    confidence <= 0
                ) {

                    const element =
                        document.getElementById(
                            "confidenceValue"
                        );


                    if (element) {

                        confidence =
                            parseFloat(
                                element.textContent
                                    .replace("%", "")
                            );

                    }

                }


                if (!severity) {

                    const element =
                        document.getElementById(
                            "severityValue"
                        );


                    if (element) {

                        severity =
                            element.textContent
                                .trim()
                                .toUpperCase()
                                .replace(
                                    " PRIORITY",
                                    ""
                                );

                    }

                }


                // ----------------------------------
                // If score not available
                // ----------------------------------

                if (
                    !priorityScore ||
                    priorityScore <= 0
                ) {

                    priorityScore =
                        calculatePriorityScore(
                            detectedIssue,
                            confidence,
                            severity,
                            {},
                            []
                        );

                }


                console.log(
                    "Saving AI result:",
                    {
                        reportId,
                        detectedIssue,
                        confidence,
                        severity,
                        priorityScore
                    }
                );


                try {

                    const response =
                        await fetch(
                            `http://127.0.0.1:5000/api/reports/${reportId}/ai`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        ai_category:
                                            detectedIssue,

                                        ai_confidence:
                                            confidence,

                                        ai_severity:
                                            severity,

                                        priority_score:
                                            priorityScore

                                    })

                            }
                        );


                    const result =
                        await response.json();


                    console.log(
                        "Database response:",
                        result
                    );


                    if (result.success) {

                        alert(
                            "Report confirmed successfully! ✅\n\n" +
                            "AI analysis has been saved to CivicLens database."
                        );

                    } else {

                        alert(
                            "Unable to save AI result.\n\n" +
                            result.message
                        );

                    }


                } catch (error) {

                    console.error(
                        "AI save error:",
                        error
                    );


                    alert(
                        "Unable to connect to CivicLens backend.\n\n" +
                        "Please make sure Flask is running."
                    );

                }

            }
        );

    }

}


// ==========================================
// LOAD ANALYSIS
// ==========================================

async function loadAnalysis() {

    const reportId =
        localStorage.getItem(
            "lastReportId"
        );


    if (!reportId) {

        console.log(
            "No report ID found."
        );

        return;

    }


    try {

        // ----------------------------------
        // Get all reports
        // ----------------------------------

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/reports"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to fetch reports"
            );

        }


        const reports =
            await response.json();


        console.log(
            "Reports:",
            reports
        );


        // ----------------------------------
        // Find current report
        // ----------------------------------

        const report =
            reports.find(
                function (item) {

                    return item.id == reportId;

                }
            );


        if (!report) {

            console.log(
                "Report not found."
            );

            return;

        }


        console.log(
            "Current Report:",
            report
        );


        // ==================================
        // SHOW IMAGE
        // ==================================

        const uploadedImage =
            document.getElementById(
                "uploadedReportImage"
            );


        const imagePlaceholder =
            document.getElementById(
                "imagePlaceholder"
            );


        if (
            uploadedImage &&
            report.image_path
        ) {

            const imageURL =
                "http://127.0.0.1:5000/uploads/" +
                encodeURIComponent(
                    report.image_path
                );


            uploadedImage.crossOrigin =
                "anonymous";


            uploadedImage.onload =
                async function () {

                    console.log(
                        "Uploaded image loaded ✅"
                    );


                    await runAIInference(
                        uploadedImage,
                        report,
                        reports
                    );

                };


            uploadedImage.src =
                imageURL;


            uploadedImage.style.display =
                "block";


            if (imagePlaceholder) {

                imagePlaceholder.style.display =
                    "none";

            }


            console.log(
                "Uploaded image:",
                imageURL
            );

        }


        // ==================================
        // LOCATION
        // ==================================

        const reportLocation =
            document.getElementById(
                "reportLocation"
            );


        if (reportLocation) {

            if (
                report.latitude !== null &&
                report.longitude !== null &&
                report.latitude !== undefined &&
                report.longitude !== undefined
            ) {

                reportLocation.textContent =
                    report.latitude +
                    ", " +
                    report.longitude;

            } else {

                reportLocation.textContent =
                    "Location not available";

            }

        }


        // ==================================
        // Initial report category
        // ==================================

        const detectedIssue =
            document.getElementById(
                "detectedIssue"
            );


        if (
            detectedIssue &&
            !report.image_path
        ) {

            detectedIssue.textContent =
                report.ai_category ||
                report.category ||
                "Unknown Issue";

        }


        // ==================================
        // Existing saved AI data
        // ==================================

        if (
            report.ai_category &&
            report.ai_confidence !== null &&
            report.ai_confidence !== undefined
        ) {

            lastAIResult = {

                category:
                    report.ai_category,

                confidence:
                    Number(
                        report.ai_confidence
                    ),

                severity:
                    report.ai_severity ||
                    report.severity ||
                    "Medium",

                priorityScore:
                    Number(
                        report.priority_score ||
                        0
                    )

            };

        }


    } catch (error) {

        console.error(
            "Analysis error:",
            error
        );

    }

}