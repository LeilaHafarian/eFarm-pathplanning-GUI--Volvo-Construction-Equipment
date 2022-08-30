import { useEffect, useState } from "react";
import { Snackbar } from "./components";

import "./App.css";

let map;
const steps = {
  SELECT_LOCATION: 0,
  SELECT_AREA: 1,
  SUBMIT_AREA: 2,
  START_DRAWING: 3,
  EXPORT_TEXT: 4,
};
let bounds = {};
let rectangle;
let route = [];

function App() {
  const [message, setMessage] = useState();
  const [step, setStep] = useState(steps["SELECT_LOCATION"]);

  const handleCloseMessage = () => setMessage(undefined);

  const initMap = () => {
    const uluru = { lat: 60.1282, lng: 18.6435 };
    const zoom = 5;
    map = new window.google.maps.Map(document.getElementById("map"), {
      zoom,
      center: uluru,
    });

    selectLocation();
  };

  const selectLocation = () => {
    let longPress = false;
    let start = 100;
    let end = 0;

    const locationListener = window.google.maps.event.addListener(
      map,
      "click",
      function (event) {
        if (longPress) {
          selectArea(event.latLng.lat(), event.latLng.lng());
          setStep(steps["SELECT_AREA"]);
          window.google.maps.event.removeListener(locationListener);
        } else {
          setMessage("Press 1 second to select location");
        }
      }
    );

    window.google.maps.event.addListener(map, "mousedown", function (event) {
      start = new Date().getTime();
    });

    window.google.maps.event.addListener(map, "mouseup", function (event) {
      end = new Date().getTime();
      longPress = end - start < 1000 ? false : true;
    });
  };

  const selectArea = (lat, lng) => {
    bounds = {
      north: lat + 0.01,
      south: lat - 0.01,
      east: lng + 0.03,
      west: lng - 0.03,
    };

    rectangle = new window.google.maps.Rectangle({
      bounds,
      strokeColor: "#a2cbffb8",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#a2cbffb8",
      fillOpacity: 0.35,
      editable: true,
      draggable: true,
    });

    rectangle.setMap(map);
    rectangle.addListener("bounds_changed", showNewRect);

    function showNewRect() {
      const ne = rectangle.getBounds().getNorthEast();
      const sw = rectangle.getBounds().getSouthWest();

      bounds = {
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
      };
    }
  };

  const handleCancelClick = () => {
    setStep(steps["SELECT_LOCATION"]);
    rectangle.setMap(null);
    selectLocation();
  };
  const handleSubmitClick = () => {
    setStep(steps["SUBMIT_AREA"]);
    rectangle.setEditable(false);
    rectangle.setDraggable(false);
  };

  const handleEditAreaClick = () => {
    setStep(steps["SELECT_AREA"]);
    rectangle.setEditable(true);
    rectangle.setDraggable(true);
  };

  const handleStartDrawingClick = () => {
    setStep(steps["START_DRAWING"]);
    route = [];

    
    bounds = {
      north: bounds.north - 0.001,
      south: bounds.south + 0.001,
      east: bounds.east - 0.002,
      west: bounds.west + 0.002,
    };

    const degree = 0.001;
    let temp = bounds.west;

    while (temp <= bounds.east) {
      route.push({
        lat: bounds.south,
        lng: temp,
      });
      route.push({
        lat: bounds.north,
        lng: temp,
      });
      if (temp + degree <= bounds.east) {
        route.push({
          lat: bounds.north,
          lng: temp + degree,
        });
        route.push({
          lat: bounds.south,
          lng: temp + degree,
        });
      }
      if (temp + 2 * degree <= bounds.east)
        route.push({
          lat: bounds.south,
          lng: temp + 2 * degree,
        });

      temp = temp + 2 * degree;
    }

    const flightPath = new window.google.maps.Polyline({
      path: route,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 0.6,
      strokeWeight: 2,
    });

    flightPath.setMap(map);
  };

  const handleExportClick = () => {
    alert(JSON.stringify(route));
  };

  useEffect(() => {
    initMap();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container">
      <Snackbar
        open={Boolean(message)}
        message={message}
        onClose={handleCloseMessage}
      />

      <div className="button_container">
        {step === steps["SELECT_LOCATION"] && (
          <span>Press for one second at the desired location</span>
        )}
        {step === steps["SELECT_AREA"] && (
          <>
            <button onClick={handleCancelClick}>cancel</button>
            <button onClick={handleSubmitClick}>submit</button>
          </>
        )}
        {step === steps["SUBMIT_AREA"] && (
          <>
            <button onClick={handleEditAreaClick}>Edit Area</button>
            <button onClick={handleStartDrawingClick}>Start Drawing</button>
          </>
        )}
        {step === steps["START_DRAWING"] && (
          <>
            <button onClick={handleExportClick}>Export Route</button>
          </>
        )}
      </div>

      <div className="map" id="map" />
    </div>
  );
}

export default App;
