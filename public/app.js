document.addEventListener("DOMContentLoaded", function () {
    const csvInput = document.getElementById("csvInput");
    const convertToJSONButton = document.getElementById("convertToJSON");
    const jsonOutput = document.getElementById("jsonOutput");
    const downloadButton = document.getElementById("downloadButton");

    convertToJSONButton.addEventListener("click", async function () {
        const csvData = csvInput.value;
        try {
            const response = await fetch("/upload", {
                method: "POST",
                body: csvData,
                headers: {
                    "Content-Type": "text/csv",
                },
            });

            if (response.ok) {
                const result = await response.json();
                jsonOutput.value = JSON.stringify(result, null, 2);
                downloadButton.style.display = "block";
            } else {
                alert("Conversion failed. Please check your input.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred during conversion.");
        }
    });

    downloadButton.addEventListener("click", async function () {
        const response = await fetch("/download/mydata.json"); // Replace with your desired filename

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "mydata.json"; // Set the downloaded file name
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            alert("Download failed. The file may not exist.");
        }
    });
});
