d3.csv("uber_imputated.csv", d3.autoType).then(data => {
    console.log("Uber data loaded successfully:", data);

    // Initialize map
    const map = L.map("chart").setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markers = [];

    // Function to determine marker color based on passenger count
    function getMarkerColor(passengerCount) {
        if (passengerCount === 1) return "blue";
        if (passengerCount === 2) return "orange";
        if (passengerCount === 3) return "green";
        if (passengerCount === 4) return "red";
        if (passengerCount >= 5) return "purple";
        return "brown";
    }

    // Function to plot points on the map
    function plotPoints(filteredData) {

        markers.forEach(marker => map.removeLayer(marker));
        markers.length = 0;


        filteredData.forEach(d => {
            const markerColor = getMarkerColor(d.passenger_count);

            const marker = L.circleMarker([d.pickup_latitude, d.pickup_longitude], {
                radius: Math.sqrt(d.fare_amount || 10),
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.5,
            }).addTo(map).bindPopup(`
                <strong>Fare:</strong> $${d.fare_amount?.toFixed(2) || "Unknown"}<br>
                <strong>Passengers:</strong> ${d.passenger_count || "Unknown"}<br>
                <strong>Pickup Coordinates:</strong> [${d.pickup_latitude.toFixed(4)}, ${d.pickup_longitude.toFixed(4)}]<br>
                <strong>Dropoff Coordinates:</strong> [${d.dropoff_latitude?.toFixed(4) || "Unknown"}, ${d.dropoff_longitude?.toFixed(4) || "Unknown"}]<br>
            `);
            markers.push(marker);
        });
    }


    plotPoints(data);


    const passengerFilter = document.getElementById("passengerFilter");
    passengerFilter.addEventListener("change", () => {
        const selectedValue = passengerFilter.value;

        let filteredData;
        if (selectedValue === "all") {
            filteredData = data;
        } else {
            const selectedPassengers = parseInt(selectedValue, 10);
            filteredData = data.filter(d => d.passenger_count === selectedPassengers);
        }

        plotPoints(filteredData);
    });


    const infobox = document.getElementById("infobox");
    const toggleButton = document.getElementById("toggleInfo");

    toggleButton.addEventListener("click", () => {
        if (infobox.classList.contains("collapsed")) {

            infobox.classList.remove("collapsed");
            infobox.style.width = "300px";
            infobox.style.height = "auto";
            infobox.style.padding = "15px";
            infobox.innerHTML = `
                <h4>Uber Fares Visualization</h4>
                <p><strong>Project Description:</strong> This interactive map visualizes global Uber ride data, showing fare amounts and passenger counts. Markers are color-coded to represent the number of passengers for each ride. The size of each marker reflects the fare amount.</p>
                <p><strong>Developer:</strong> Joey Rudolph</p>
                <p><strong>Data Source:</strong> <a href="https://www.kaggle.com/datasets">Uber Dataset</a></p>
                <p><strong>Date:</strong> 2024-12-12</p>
                <h4>Legend: Passenger Count</h4>
                <div class="legend-item">
                    <span class="legend-color passenger-1"></span> 1 Passenger
                </div>
                <div class="legend-item">
                    <span class="legend-color passenger-2"></span> 2 Passengers
                </div>
                <div class="legend-item">
                    <span class="legend-color passenger-3"></span> 3 Passengers
                </div>
                <div class="legend-item">
                    <span class="legend-color passenger-4"></span> 4 Passengers
                </div>
                <div class="legend-item">
                    <span class="legend-color passenger-5"></span> 5+ Passengers
                </div>
                <button id="toggleInfo">Hide Info</button>
            `;
        } else {

            infobox.classList.add("collapsed");
            infobox.style.width = "auto";
            infobox.style.height = "auto";
            infobox.style.padding = "5px";
            infobox.innerHTML = `<button id="toggleInfo">Show Info</button>`;
        }


        document.getElementById("toggleInfo").addEventListener("click", () => {
            toggleButton.click();
        });
    });


    let isDragging = false;
    let offsetX, offsetY;

    infobox.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            infobox.style.top = `${e.clientY - offsetY}px`;
            infobox.style.left = `${e.clientX - offsetX}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
});
