/*
    Authors: Matthew DeViller A00434806
             Ryan Wright A00429924
             Dexter Adderley A00421717
    The purpose of this file is to provide the following behaviours:
    - Show/Hide the insulation option
    - Slider controlling the sizes of rectangles on canva's that show 
    as a trailer based on 1px ~ 1inch
    - Slider controlling the size of a wiondow based on 1px ~ 1inch 
*/
const SCL = 1.35;

var SERVER_URL = "http://ugdev.cs.smu.ca:3806";

/*Setup function that sets the visibility of the insulation chapter
  to hide if its shown on refresh / startup */
function setup() {
  $("#insulationChap").css("visibility", "hidden");
  //Textbox defaults
  $("#opThickOut").val(2);
  $("#winThermResOut").val(1);
  $("#doorThermResOut").val(2);
  $("#winAreaOut").val(0);
  $("#opThermResOut").val("");
  $("#annualEnergyOut").val(0);
  $("#allThermResOut").val("");
}

//Hides or shows the insulation chapter based option choosen
function pickChapter() {
  let choice = $("#chapters").find(":selected").text();
  if (choice == "Insulation") {
    $("#insulationChap").css("visibility", "visible");
  } else {
    $("#insulationChap").css("visibility", "hidden");
    let option = confirm(choice + " is under construction.");
    if (option == true) {
      //Reinitialize
      location.reload();
    }
  }
  setupInsulation();
  elevationView();
}

//Function that sets the insulation
function setupInsulation() {
  let plan = document.getElementById("planView");
  let contextP = planView.getContext("2d");

  //Set backdrop
  contextP.fillStyle = "#d1cbcd";
  contextP.fillRect(0, 0, plan.width, plan.height);

  //Fill rectangle
  contextP.fillStyle = "#3104fb";
  contextP.fillRect(0, 0, plan.width, 96 * SCL);

  //Clear rectangle with backdrop to make unfilled rectangle
  contextP.fillStyle = "#d1cbcd";
  contextP.fillRect(2 * SCL, 2 * SCL, plan.width - 4 * SCL, 96 * SCL - 4 * SCL);

  //Draw door
  contextP.lineWidth = "2";
  contextP.strokeStyle = "black";
  contextP.beginPath();
  contextP.moveTo((2 / 3) * plan.width, 96 * SCL);
  contextP.lineTo((2 / 3) * plan.width, 36 * SCL + 96 * SCL);
  contextP.stroke();

  //Draw gap where door would be
  contextP.strokeStyle = "#d1cbcd";
  contextP.lineWidth = 7;
  contextP.beginPath();
  contextP.moveTo((2 / 3) * plan.width, 94 * SCL);
  contextP.lineTo((2 / 3) * plan.width + 36 * SCL, 94 * SCL);
  contextP.stroke();

  //Draw arc to show door swing
  contextP.lineWidth = 1;
  contextP.strokeStyle = "#444445";
  contextP.setLineDash([3, 3]);
  contextP.beginPath();
  contextP.arc((2 / 3) * plan.width, 94 * SCL, 36 * SCL + 2, 0, Math.PI / 2);
  contextP.stroke();

  //Draw dotted line to show where door would be
  contextP.lineWidth = 2;
  contextP.beginPath();
  contextP.moveTo((2 / 3) * plan.width, 94 * SCL + 2);
  contextP.lineTo((2 / 3) * plan.width + 36 * SCL, 94 * SCL + 2);
  contextP.stroke();

  contextP.setLineDash([]);

  // register the wall thickness slider
  $("#opThickSld").on("change", function () {
    processInput();
  });

  // register the window thickness slider
  $("#winAreaSld").on("change", function () {
    processInput();
  });
}

//Function that changes the images on the canvas based on slider values
function processInput() {
  let opThick = $("#opThickSld").val() / 2; //From slider C
  let constructionType = $("#constructionR option:selected").val();
  let window = $("#winAreaSld").val() / 2;
  let degreeDays = $("#placesDegree").val(); //From Degree days select
  let insulation = $("#constructionR").val(); //From Opaque select
  let doorThermal = $("#doorThickSld").val(); //From Slider under opaque
  let windowThermal = $("#winThermResSld").val(); //From the slider F

  // draw the insulation / window plan view
  drawPlan(opThick, window / 3.857142857, constructionType);
  // draw the window elevation view
  elevationView(window / 3.857142857);
  //Calculations for textboxes
  calculations(
    degreeDays,
    insulation,
    doorThermal,
    windowThermal,
    opThick,
    window
  );
}
function calculations(degrees, insul, dTherm, wTherm, qThick, window) {
  let a = degrees;
  let b = insul;
  let c = qThick;
  let e = dTherm;
  let f = wTherm;
  let g = window;
  let opaqueThermal;
  let overallThermal;
  let annualEnergy;
  //Calculations for Opaque Thermal Resistance Text Box
  opaqueThermal = 2 + (c - 2) * b;
  //Calculations for Effective Overall Thermal Resistance
  overallThermal = 1 / (((800 - g) / opaqueThermal + g / f + 20 / e) / 820);
  //Calculations for annual energy
  annualEnergy =
    (820 * a * 1.8 * 24) / overallThermal / 3412 +
    (a * 1.8 * 24 * 65) / 3412 +
    3000;
  let windowArea = (window / 6) * (((window / 6) * 3) / 4);
  let windowAreaTrunc = Math.trunc(Number(windowArea) * 10) / 10;
  overallThermal = Math.trunc(Number(overallThermal));
  annualEnergy = Math.trunc(Number(annualEnergy));
  //Assigning values to the text boxes
  if (c == 2) {
    $("#opThickOut").val(2);
  }
  if (c >= 4) {
    $("#opThickOut").val(c); // C Completely done
    $("#opThermResOut").val(opaqueThermal); // D Completely done
    $("#allThermResOut").val(overallThermal); //H Completely done
  }
  $("#doorThermResOut").val(dTherm); // E Completely done
  $("#winThermResOut").val(wTherm); // F Completely done
  $("#annualEnergyOut").val(annualEnergy); // I Completely done
  $("#winAreaOut").val(windowAreaTrunc); // G Completely done
}

//Function that draws the plan of the trailer
function drawPlan(opThick, window, constructionType) {
  let plan = document.getElementById("planView");
  let contextP = planView.getContext("2d");

  // clear for new responsive drawing
  contextP.clearRect(0, 0, plan.width, plan.height);

  // set backdrop
  contextP.fillStyle = "#d1cbcd";
  contextP.fillRect(0, 0, plan.width, plan.height);

  //Set fillstyle for insulation based on dropdown menu
  let choice = $("#constructionR").find(":selected").text();

  if (choice === "Plus Finish and Cellulose (R3/in)") {
    contextP.fillStyle = "#e8e5e4";
  } else if (choice === "Plus Finish and Fiberglass (R3/in)") {
    contextP.fillStyle = " #fec7d4";
  } else if (choice === "Plus Finish and Spray Foam (R6/in)") {
    contextP.fillStyle = "#fdfaaa";
  } else {
    contextP.fillStyle = "#d1cbcd";
  }

  // fill area with corresponding insulation colour
  contextP.fillRect(2, 2, plan.width - 2, 96 * SCL - 2);

  // clear gap in middle of insulation
  contextP.fillStyle = "#d1cbcd";
  contextP.fillRect(
    opThick * SCL,
    opThick * SCL,
    plan.width - 2 * opThick * SCL,
    96 * SCL - 2 * opThick * SCL
  );

  // set inside and outside walls
  contextP.strokeStyle = "#3104fb";
  contextP.lineWidth = 2;
  contextP.strokeRect(
    opThick * SCL,
    opThick * SCL,
    plan.width - 2 * opThick * SCL,
    96 * SCL - 2 * opThick * SCL
  );
  contextP.stroke();
  contextP.strokeRect(1, 1, plan.width - 2, 96 * SCL - 1);
  contextP.stroke();

  //Door behaviour
  // draw door
  contextP.lineWidth = "2";
  contextP.strokeStyle = "black";
  contextP.beginPath();
  contextP.moveTo((2 / 3) * plan.width, 96 * SCL);
  contextP.lineTo((2 / 3) * plan.width, 36 * SCL + 96 * SCL);
  contextP.stroke();

  // draw gap where door would be
  contextP.strokeStyle = "#d1cbcd";
  contextP.fillRect((2 / 3) * plan.width, 60 * SCL, 36 * SCL, 37 * SCL);
  contextP.lineWidth = 2;
  contextP.beginPath();
  contextP.moveTo((2 / 3) * plan.width, 94 * SCL);
  contextP.lineTo((2 / 3) * plan.width + 36 * SCL, 94 * SCL);
  contextP.stroke();

  // draw arc to show door swing
  contextP.lineWidth = 1;
  contextP.strokeStyle = "#444445";
  contextP.setLineDash([3, 3]);
  contextP.beginPath();
  contextP.arc((2 / 3) * plan.width, 94 * SCL, 36 * SCL + 2, 0, Math.PI / 2);
  contextP.stroke();

  // draw dotted lines to show where door would be
  // first dotted line:
  contextP.lineWidth = 2;
  contextP.beginPath();
  contextP.moveTo((2 / 3) * plan.width, 94 * SCL + 2);
  contextP.lineTo((2 / 3) * plan.width + 36 * SCL, 94 * SCL + 2);
  contextP.stroke();
  // second dotted line: changes position with insulation thickness
  contextP.beginPath();
  contextP.moveTo((2 / 3) * plan.width, 96 * SCL - opThick * SCL);
  contextP.lineTo((2 / 3) * plan.width + 36 * SCL, 96 * SCL - opThick * SCL);
  contextP.stroke();

  //Window Behaviour
  // make gap for window
  if (window >= 2.203703) {
    contextP.fillStyle = "#d1cbcd";
    contextP.fillRect(
      (1 / 3) * plan.width - 6 * window + 10,
      96 * SCL - opThick * SCL - 5,
      window * 12 - 5,
      96 * SCL
    );

    // make window
    contextP.fillStyle = "#07ebf8";
    contextP.fillRect(
      (1 / 3) * plan.width - 6 * window + 10,
      96 * SCL - opThick * SCL,
      window * 12 - 5,
      opThick * SCL
    );

    // make dotted lines for window
    // top dotted line
    contextP.beginPath();
    contextP.moveTo(
      (1 / 3) * plan.width - 6 * window,
      96 * SCL - opThick * SCL
    );
    contextP.lineTo(
      (1 / 3) * plan.width + window * 7,
      96 * SCL - opThick * SCL
    );
    contextP.stroke();
    // bottom dotted line
    contextP.beginPath();
    contextP.moveTo((1 / 3) * plan.width - 6 * window, 96 * SCL);
    contextP.lineTo((1 / 3) * plan.width + window * 7, 96 * SCL);
    contextP.stroke();
  }

  // remove dashed line characteristic
  contextP.setLineDash([]);
}

//Function to draw the elevation view including the door and window
function elevationView(window) {
  let elev = document.getElementById("elevView");
  let contextE = elev.getContext("2d");

  //Set backdrop
  contextE.fillStyle = "#a3bcfd";
  contextE.fillRect(0, 0, elev.width, elev.height);

  //door
  contextE.strokeStyle = "#black";
  contextE.strokeRect(220, 40, 3 * 12 * SCL, (6 * 12 + 8) * SCL - 9 * SCL);

  //door frame gap(might need to fix)
  contextE.strokeRect(
    215,
    35,
    3 * 12 * SCL + 10,
    (6 * 12 + 8) * SCL + 10 - 9 * SCL
  );

  //door knob
  contextE.beginPath();
  contextE.fillStyle = "#F2F2F2";
  contextE.arc(260, 90, 3, 0, 2 * Math.PI);
  contextE.stroke();
  contextE.closePath();

  //create window-- max to the floor
  var maxWindowW = 3 * 12 * SCL + 100;
  var maxWindowH = (6 * 12 + 8) * SCL + 10;

  var width = 6 * window * SCL;
  var height = window * SCL;

  if (window >= 2.203703) {
    //inner frame height from ground
    contextE.strokeRect(
      (3 / 8) * 321 - 10 - 3 * window * SCL,
      26 * SCL,
      8 * window * SCL,
      Number(5.6 * window * SCL)
    );

    //main window frame
    contextE.strokeRect(
      (3 / 8) * 321 - 10 - 3 * window * SCL + 7,
      26 * SCL + 7,
      8 * window * SCL - 14,
      Number(5.6 * window * SCL) - 14
    );
  }
}

//This function displays that data related to the concepts dropdown menu
function processInputConcepts() {
  let choice = $("#concepts").find(":selected").text();

  // conditional that uses get methods from the server that concatenates the
  // file path and execute function that displays specified data on webpage
  // produces error message if any
  if (choice == "Local Conditions") {
    $.get(SERVER_URL + "/group13", function (data) {
      document.getElementById("conceptsP").innerHTML = data.localConditions;
    }).fail(function (error) {
      alert(error.responseText);
    });
  } else if (choice == "Annual Energy Budget") {
    $.get(SERVER_URL + "/group13", function (data) {
      document.getElementById("conceptsP").innerHTML = data.annualEnergyBudget;
    }).fail(function (error) {
      alert(error.responseText);
    });
  } else if (choice == "Drafts and Ventilation") {
    $.get(SERVER_URL + "/group13", function (data) {
      document.getElementById("conceptsP").innerHTML =
        data.draftsAndVentilation;
    }).fail(function (error) {
      alert(error.responseText);
    });
  } else if (choice == "Insulation and Heat Loss") {
    $.get(SERVER_URL + "/group13", function (data) {
      document.getElementById("conceptsP").innerHTML =
        data.insulationAndHeatLoss;
    }).fail(function (error) {
      alert(error.responseText);
    });
  } else if (choice == "Materials and Insulation") {
    $.get(SERVER_URL + "/group13", function (data) {
      document.getElementById("conceptsP").innerHTML =
        data.materialsAndInsulation;
    }).fail(function (error) {
      alert(error.responseText);
    });
  } else if (choice == "Environmental Impact") {
    $.get(SERVER_URL + "/group13", function (data) {
      document.getElementById("conceptsP").innerHTML = data.environmentalImpact;
    }).fail(function (error) {
      alert(error.responseText);
    });
  } else {
    document.getElementById("conceptsP").innerHTML = "";
  }
}
