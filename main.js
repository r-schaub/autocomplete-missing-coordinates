
(function run(e) {

    var consent = document.querySelector('input#consent').checked;

    var lat = document.querySelectorAll('input[id^="lat"]');
    var lon = document.querySelectorAll('input[id^="lon"]');

    // jump to next input field if value is set and length is 1 with event listener
    for (let i = 0; i < lat.length; i++) {
        lat[i].addEventListener('input', function (e) {
            if (e.target.value.length == 1 && e.target.value != '?') {
                lat[i + 1].focus();
            }
        }
        );
    }
    for (let i = 0; i < lon.length; i++) {
        lon[i].addEventListener('input', function (e) {
            if (e.target.value.length == 1 && e.target.value != '?') {
                lon[i + 1].focus();
            }
        }
        );
    }

    // create an on click listener for button.update to run()
    document.querySelector('button.update').addEventListener('click', run);
    if (!consent) {
        document.querySelector('.map-container').innerHTML = '<p>Please confirm the privacy policy to activate the interactive map.</p>';
    }

    if (typeof e === 'undefined') {
        var e = false;
    } else {
        e.preventDefault();
        // check if checkbox is checked
        if (consent) {
            // init map
            document.querySelector('.map-container').innerHTML = '<div class="map"></div>';
            window.map = L.map(document.querySelector('.map'), {
                center: L.latLng(50, 10),
                zoom: 7,
            });

            map.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
            var baseMaps = {
                "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
                "Google Maps": L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                }),
                "Google Maps Satellite": L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                }),
                "Google Maps Hybrid": L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                }),
            };
            // set as default layer
            baseMaps.OpenStreetMap.addTo(map);
            // add layer control
            L.control.layers(baseMaps).addTo(map);

            // remove each circle marker
            map.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
                if (layer instanceof L.Circle) {
                    map.removeLayer(layer);
                }
            });
        }

        var values = new Array(10);
        for (let i = 0; i < values.length; i++) {
            values[i] = i.toString();
        }

        var latitudePattern = [];
        var longitudePattern = [];
        for (let i = 0; i < lat.length; i++) {
            latitudePattern[i] = lat[i].value || '0';
        }
        for (let i = 0; i < lon.length; i++) {
            longitudePattern[i] = lon[i].value || '0';
        }

        // The latitude pattern is used to create all possible combinations of latitude.
        var latitudeCombinations = new Array();
        for (let i = 0; i < Math.pow(values.length, latitudePattern.filter(x => x == '?').length); i++) {
            var combination = i.toString(values.length).padStart(latitudePattern.filter(x => x == '?').length, '0').split('');
            var latitude = latitudePattern.map(x => x == '?' ? combination.shift() : x).join('');
            latitudeCombinations.push(latitude);
        }

        // The longitude pattern is used to create all possible combinations of longitude.
        var longitudeCombinations = new Array();
        for (let i = 0; i < Math.pow(values.length, longitudePattern.filter(x => x == '?').length); i++) {
            var combination = i.toString(values.length).padStart(longitudePattern.filter(x => x == '?').length, '0').split('');
            var longitude = longitudePattern.map(x => x == '?' ? combination.shift() : x).join('');
            if (5.5 <= parseFloat(longitude) && parseFloat(longitude) <= 15) {
                longitudeCombinations.push(longitude);
            }
        }

        // caluculate possible combinations
        if (latitudeCombinations.length * longitudeCombinations.length > 900) {
            // remove value
            if (e) {
                e.preventDefault();
                e.target.value = '';
                alert('Too many possibilities ('+ (latitudeCombinations.length * longitudeCombinations.length) + ' / 900)');
            }
            return;
        }

        // remove table if exists
        if (document.querySelector('.possibilities-container table')) {
            document.querySelector('.possibilities-container table').remove();
        }
        // add coordinates to .possibilities-container in table
        // create table and tbody if not exists
        if (!document.querySelector('.possibilities-container table')) {
            var table = document.createElement('table');
            var thead = document.createElement('thead');
            var tr = document.createElement('tr');
            var th = document.createElement('th');
            th.innerHTML = 'Latitude';
            tr.appendChild(th);
            var th = document.createElement('th');
            th.innerHTML = 'Longitude';
            tr.appendChild(th);
            thead.appendChild(tr);
            table.appendChild(thead);
            var tbody = document.createElement('tbody');
            table.appendChild(tbody);
            document.querySelector('.possibilities-container').appendChild(table);
        }

        // create and add circles markers
        for (let latitude of latitudeCombinations) {
            for (let longitude of longitudeCombinations) {
                if (consent) {
                    L.circle([latitude, longitude], 10).addTo(map);
                    L.marker([latitude, longitude]).addTo(map);

                    // add popup
                    var popup = L.popup();
                    popup.setContent('<p>B: ' + latitude + '</p><p>L: ' + longitude + '</p><a href="https://www.google.com/maps/search/?api=1&query=' + latitude + ',' + longitude + '" target="_blank">Google Maps</a>');
                    L.marker([latitude, longitude]).bindPopup(popup).addTo(map);
                }
                var tr = document.createElement('tr');
                var td = document.createElement('td');
                td.innerHTML = latitude;
                tr.appendChild(td);
                var td = document.createElement('td');
                td.innerHTML = longitude;
                tr.appendChild(td);
                document.querySelector('.possibilities-container table tbody').appendChild(tr);
            }
        }
    }

}());
