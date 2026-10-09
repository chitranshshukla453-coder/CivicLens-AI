
# CivicLens AI
### See the Problem • Map the Impact • Prioritize the Solution

CivicLens AI is an AI- and GIS-powered civic infrastructure reporting and decision-support system designed to help identify, map, analyze, and prioritize civic issues in urban areas.

The project focuses on selected urban areas of Greater Noida, Uttar Pradesh.

## Problem Statement

Urban areas face civic infrastructure problems such as potholes, garbage accumulation, waterlogging, and faulty streetlights. Reports about these issues can be fragmented, making it difficult to identify hotspots and prioritize areas that need attention.

CivicLens AI aims to bring these reports together through AI-based image classification, geographic mapping, and data analytics.

## Key Features

- **Smart Reporting:** Submit civic issues with an image, location, and description.
- **AI Classification:** Classify images into potholes, garbage, waterlogging, and streetlights.
- **Severity Assessment:** Display an estimated issue severity.
- **GIS Issue Map:** Visualize reported issues geographically.
- **Interactive Dashboard:** View report counts, issue categories, and priority information.
- **Analytics:** Explore category distributions, severity, trends, and potential hotspots.
- **Decision Support:** Help identify issues that may need attention first.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| Database | SQLite |
| AI Model | MobileNetV3-based image classification |
| GIS Mapping | Leaflet.js, OpenStreetMap |
| Model Runtime | ONNX Runtime Web |
| Data Visualization | JavaScript charts and analytics |
| Version Control | Git, GitHub |

## System Workflow

1. A citizen submits an issue report with an image and location.
2. The application processes the report.
3. The AI model predicts the civic issue category.
4. The application displays the predicted category, confidence, and severity.
5. After confirmation, report information is saved to the database.
6. The map, dashboard, and analytics display information from submitted reports.

## Issue Categories

- Potholes
- Garbage
- Waterlogging
- Streetlights

## Project Structure

```text
CivicLens-AI/
├── index.html
├── report.html
├── analysis.html
├── map.html
├── dashboard.html
├── analytics.html
├── style.css
├── script.js
├── report.css
├── report.js
├── analysis.css
├── analysis.js
├── map.css
├── map.js
├── dashboard.css
├── dashboard.js
├── analytics.css
├── analytics.js
├── backend/
│   ├── app.py
│   └── database.py
├── uploads/
├── .gitignore
└── README.md
```

*Note: The structure above summarizes the main application files. The final repository may include additional files, such as model files, dependency lists, and sample data.*

## Running the Project Locally

### Prerequisites

- Python 3.12 recommended
- pip
- A modern web browser
- Git (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/CivicLens-AI.git
cd CivicLens-AI
```

### 2. Install Dependencies

Install the Python dependencies listed in `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 3. Start the Backend

```bash
python backend/app.py
```

Start the backend before using features that require the API. The local backend has been configured to run at:

```text
http://127.0.0.1:5000
```

### 4. Open the Frontend

Open `index.html` in your browser or use the VS Code Live Server extension.

*Note: AI inference and other features may require the appropriate model files, dependencies, and configuration.*

## Current Scope

CivicLens AI is a prototype focused on civic issue reporting, image classification, mapping, and analytics. AI predictions and priority scores are estimates and should be reviewed before being used for real-world decisions.

## Future Improvements

- Improved image classification and duplicate-report detection
- Hindi and multilingual reporting
- Better geographic hotspot analysis
- Predictive identification of infrastructure deterioration
- Integration with civic authority workflows
- Mobile-friendly reporting and accessibility improvements

## Social Impact

CivicLens AI aims to help citizens communicate local infrastructure issues and help communities and civic authorities better understand the distribution and potential priority of reported problems.

## Theme

**AI, GIS & Emerging Technologies — Technology for Social Transformation**

## License

This project is intended to be released as open-source software. The repository license will specify the permissions for reuse and distribution.
