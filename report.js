// -----------------------------------
// Report Form
// -----------------------------------

const reportForm =
    document.getElementById("reportForm");


// -----------------------------------
// Image Preview
// -----------------------------------

const issuePhoto =
    document.getElementById("issuePhoto");

const imagePreview =
    document.getElementById("imagePreview");

const imagePreviewContainer =
    document.getElementById("imagePreviewContainer");

const imageName =
    document.getElementById("imageName");


if (issuePhoto) {

    issuePhoto.addEventListener(
        "change",
        function () {

            const file =
                issuePhoto.files[0];


            if (!file) {

                return;

            }


            // Check file size

            if (file.size > 5 * 1024 * 1024) {

                alert(
                    "Image size must be less than 5 MB."
                );

                issuePhoto.value = "";

                return;

            }


            // Show file name

            if (imageName) {

                imageName.textContent =
                    file.name;

            }


            // Preview

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    if (imagePreview) {

                        imagePreview.src =
                            event.target.result;

                    }


                    if (imagePreviewContainer) {

                        imagePreviewContainer.style.display =
                            "block";

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}



// -----------------------------------
// Submit Report
// -----------------------------------

reportForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const location =
            document.getElementById(
                "location"
            ).value;


        const category =
            document.getElementById(
                "category"
            ).value;


        const descriptionElement =
            document.getElementById(
                "description"
            );


        const description =
            descriptionElement
                ? descriptionElement.value
                : "";


        const image =
            document.getElementById(
                "issuePhoto"
            ).files[0];


        // -----------------------------------
        // Validation
        // -----------------------------------

        if (
            !location ||
            !category
        ) {

            alert(
                "Please enter location and select a problem category."
            );

            return;

        }


        if (!image) {

            alert(
                "Please upload a civic issue photo."
            );

            return;

        }


        // -----------------------------------
        // Get Coordinates
        // -----------------------------------

        let latitude = null;

        let longitude = null;


        if (
            location.includes(",")
        ) {

            const parts =
                location.split(",");


            latitude =
                parseFloat(
                    parts[0].trim()
                );


            longitude =
                parseFloat(
                    parts[1].trim()
                );

        }


        // -----------------------------------
        // Severity
        // -----------------------------------

        const severity =
            "Medium";


        // -----------------------------------
        // FormData
        // -----------------------------------

        const formData =
            new FormData();


        formData.append(
            "category",
            category
        );


        formData.append(
            "description",
            description
        );


        formData.append(
            "latitude",
            latitude
        );


        formData.append(
            "longitude",
            longitude
        );


        formData.append(
            "severity",
            severity
        );


        formData.append(
            "image",
            image
        );


        // -----------------------------------
        // Disable Button
        // -----------------------------------

        const submitBtn =
            document.getElementById(
                "submitReportBtn"
            );


        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.innerText =
                "Uploading Report...";

        }


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:5000/api/reports",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const result =
                await response.json();


            console.log(
                "Server response:",
                result
            );


            // -----------------------------------
            // Success
            // -----------------------------------

            if (result.success) {

                localStorage.setItem(
                    "lastReportId",
                    result.report_id
                );


                // Save uploaded image path
                localStorage.setItem(
                    "lastImagePath",
                    result.image_path || ""
                );


                window.location.href =
                    "http://127.0.0.1:5500/analysis.html";


                return;

            }


            // -----------------------------------
            // Failure
            // -----------------------------------

            alert(
                result.message ||
                "Failed to submit report."
            );


        }

        catch (error) {

            console.error(
                "Upload error:",
                error
            );


            alert(
                "Unable to connect to CivicLens AI backend.\n\n" +
                "Please make sure the Flask server is running."
            );

        }


        // Enable button again

        if (submitBtn) {

            submitBtn.disabled = false;

            submitBtn.innerText =
                "🚀 Submit Report";

        }

    }
);



// -----------------------------------
// Use My Location
// -----------------------------------

const locationBtn =
    document.getElementById(
        "locationBtn"
    );


locationBtn.addEventListener(
    "click",
    function () {

        if (!navigator.geolocation) {

            alert(
                "Geolocation is not supported by your browser."
            );

            return;

        }


        locationBtn.innerText =
            "Getting Location...";


        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                document.getElementById(
                    "location"
                ).value =
                    latitude +
                    ", " +
                    longitude;


                locationBtn.innerText =
                    "Location Added";

            },


            function () {

                alert(
                    "Location access denied.\n" +
                    "Please enter your location manually."
                );


                locationBtn.innerText =
                    "Use My Location";

            }

        );

    }
);