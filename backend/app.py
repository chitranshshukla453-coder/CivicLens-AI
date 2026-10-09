from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import time
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app)


# ==========================================
# PROJECT PATHS
# ==========================================

# backend folder ka path
BACKEND_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

# Main CivicLens project folder
BASE_DIR = os.path.dirname(
    BACKEND_DIR
)


# Database project root mein rahega
DB_NAME = os.path.join(
    BASE_DIR,
    "civiclens.db"
)


# Uploaded images project root/uploads mein
UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)


# Upload folder automatically create karo
os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==========================================
# FLASK SETTINGS
# ==========================================

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Maximum image size = 5 MB
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024


ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png"
}


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_db_connection():

    conn = sqlite3.connect(
        DB_NAME
    )

    conn.row_factory = sqlite3.Row

    return conn


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return "CivicLens AI Backend is Running 🚀"


# ==========================================
# CHECK IMAGE EXTENSION
# ==========================================

def allowed_file(filename):

    return (
        "." in filename
        and
        filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


# ==========================================
# CREATE REPORT
# ==========================================

@app.route(
    "/api/reports",
    methods=["POST"]
)
def create_report():

    try:

        # --------------------------------------
        # Get form data
        # --------------------------------------

        category = request.form.get(
            "category"
        )

        description = request.form.get(
            "description"
        )

        latitude = request.form.get(
            "latitude"
        )

        longitude = request.form.get(
            "longitude"
        )

        severity = request.form.get(
            "severity",
            "Medium"
        )
        ai_category = request.form.get("ai_category")
        ai_confidence = request.form.get("ai_confidence")
        ai_severity = request.form.get("ai_severity")
        priority_score = request.form.get("priority_score")

        # --------------------------------------
        # Validate category
        # --------------------------------------

        if not category:

            return jsonify({
                "success": False,
                "message": "Category is required."
            }), 400


        # --------------------------------------
        # Image
        # --------------------------------------

        image = request.files.get(
            "image"
        )

        image_path = None


        if image:

            if image.filename == "":

                return jsonify({
                    "success": False,
                    "message": "No image selected."
                }), 400


            if not allowed_file(
                image.filename
            ):

                return jsonify({
                    "success": False,
                    "message":
                        "Only JPG, JPEG and PNG images are allowed."
                }), 400


            # Clean filename
            original_name = secure_filename(
                image.filename
            )


            # Unique filename
            filename = (
                str(int(time.time()))
                + "_"
                + original_name
            )


            # Full path
            save_path = os.path.join(
                UPLOAD_FOLDER,
                filename
            )


            # Save image
            image.save(
                save_path
            )


            # Check whether file actually exists
            if not os.path.exists(
                save_path
            ):

                return jsonify({
                    "success": False,
                    "message":
                        "Image could not be saved."
                }), 500


            image_path = filename


            print(
                "IMAGE SAVED:",
                save_path
            )


        # --------------------------------------
        # Save report in database
        # --------------------------------------

        conn = get_db_connection()

        cursor = conn.cursor()


        cursor.execute(
            """
            INSERT INTO reports
            (
                category,
                description,
                latitude,
                longitude,
                severity,
                image_path,
                ai_category,
                ai_confidence,
                ai_severity,
                priority_score
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                category,
                description,
                latitude,
                longitude,
                severity,
                image_path,
                ai_category,
                ai_confidence,
                ai_severity,
                priority_score
            )
        )

        conn.commit()


        report_id = cursor.lastrowid


        conn.close()


        print(
            "REPORT SAVED:",
            report_id
        )


        return jsonify({

            "success": True,

            "message":
                "Report saved successfully!",

            "report_id":
                report_id,

            "image_path":
                image_path

        })


    except Exception as error:

        print(
            "ERROR:",
            error
        )


        return jsonify({

            "success": False,

            "message":
                str(error)

        }), 500

@app.route("/api/reports/<int:report_id>/ai", methods=["PUT"])
def update_ai_result(report_id):

    try:
        data = request.get_json()

        ai_category = data.get("ai_category")
        ai_confidence = data.get("ai_confidence")
        ai_severity = data.get("ai_severity")
        priority_score = data.get("priority_score")

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE reports
            SET
                ai_category = ?,
                ai_confidence = ?,
                ai_severity = ?,
                priority_score = ?
            WHERE id = ?
            """,
            (
                ai_category,
                ai_confidence,
                ai_severity,
                priority_score,
                report_id
            )
        )

        conn.commit()

        if cursor.rowcount == 0:
            conn.close()

            return jsonify({
                "success": False,
                "message": "Report not found."
            }), 404

        conn.close()

        print(
            "AI RESULT UPDATED:",
            report_id,
            ai_category,
            ai_confidence,
            ai_severity,
            priority_score
        )

        return jsonify({
            "success": True,
            "message": "AI result saved successfully!"
        })

    except Exception as error:

        print("AI UPDATE ERROR:", error)

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500
# ==========================================
# GET REPORTS
# ==========================================

@app.route(
    "/api/reports",
    methods=["GET"]
)
def get_reports():

    conn = get_db_connection()


    reports = conn.execute(
        """
        SELECT *
        FROM reports
        ORDER BY id DESC
        """
    ).fetchall()


    conn.close()


    return jsonify([
        dict(report)
        for report in reports
    ])


# ==========================================
# SERVE UPLOADED IMAGES
# ==========================================

@app.route(
    "/uploads/<path:filename>"
)
def uploaded_file(filename):

    print(
        "REQUESTED IMAGE:",
        filename
    )


    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    print(
        "Database:",
        DB_NAME
    )

    print(
        "Upload folder:",
        UPLOAD_FOLDER
    )

    app.run(
        debug=True
    )