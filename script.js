/* =========================================================
   CIVIL CONSTRUCTION ESTIMATOR
   COMPLETE SCRIPT
   Stage 1 + Stage 2 + Stage 3 + Final Estimate
   Enter Navigation + Auto Calculate + Final PDF
========================================================= */

const CONFIG = {
    STORAGE_KEY: "civil-calculator-estimates",
    THEME_KEY: "civil-calculator-theme",
    MAX_HISTORY: 50
};

let appState = {
    foundationData: null,
    plinthData: null,
    stage3Data: null,
    finalData: null,
    isDarkMode: localStorage.getItem(CONFIG.THEME_KEY) === "dark"
};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeTheme();
    setupEventListeners();
    setupKeyboardNavigation();
    loadAndDisplayHistory();

});


/* =========================================================
   THEME
========================================================= */

function initializeTheme() {

    if (appState.isDarkMode) {

        document.body.classList.add("dark-mode");

    }

    updateThemeIcon();

}


function toggleTheme() {

    appState.isDarkMode = !appState.isDarkMode;

    document.body.classList.toggle(
        "dark-mode",
        appState.isDarkMode
    );

    localStorage.setItem(
        CONFIG.THEME_KEY,
        appState.isDarkMode ? "dark" : "light"
    );

    updateThemeIcon();

}


function updateThemeIcon() {

    const icon = document.querySelector("#theme-toggle i");

    if (!icon) return;

    icon.className =
        appState.isDarkMode
            ? "fas fa-sun"
            : "fas fa-moon";

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    const theme = document.getElementById("theme-toggle");

    if (theme) {
        theme.addEventListener("click", toggleTheme);
    }


    const history = document.getElementById("history-btn");

    if (history) {
        history.addEventListener(
            "click",
            showHistoryModal
        );
    }


    const closeHistory =
        document.getElementById("close-history");

    if (closeHistory) {

        closeHistory.addEventListener(
            "click",
            closeHistoryModal
        );

    }


    const help =
        document.getElementById("help-btn");

    if (help) {

        help.addEventListener(
            "click",
            showHelpModal
        );

    }


    const closeHelp =
        document.getElementById("close-help");

    if (closeHelp) {

        closeHelp.addEventListener(
            "click",
            closeHelpModal
        );

    }


    const historyModal =
        document.getElementById("history-modal");

    if (historyModal) {

        historyModal.addEventListener(
            "click",
            function (e) {

                if (e.target === this) {
                    closeHistoryModal();
                }

            }
        );

    }


    const helpModal =
        document.getElementById("help-modal");

    if (helpModal) {

        helpModal.addEventListener(
            "click",
            function (e) {

                if (e.target === this) {
                    closeHelpModal();
                }

            }
        );

    }

}


/* =========================================================
   ENTER KEY NAVIGATION
   LAST INPUT = AUTO CALCULATE
========================================================= */

function setupKeyboardNavigation() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Enter") {
                return;
            }

            const target = event.target;

            if (
                target.tagName !== "INPUT" &&
                target.tagName !== "SELECT"
            ) {
                return;
            }

            event.preventDefault();


            /*
                Find the currently visible section.
            */

            const section =
                target.closest(".card");

            if (!section) {
                return;
            }


            /*
                Only visible inputs.
            */

            const inputs =
                Array.from(
                    section.querySelectorAll(
                        ".next-input"
                    )
                ).filter(function (input) {

                    return (
                        input.offsetParent !== null &&
                        !input.disabled
                    );

                });


            const currentIndex =
                inputs.indexOf(target);


            if (currentIndex === -1) {
                return;
            }


            /*
                If there is another input,
                move to next input.
            */

            if (
                currentIndex <
                inputs.length - 1
            ) {

                inputs[
                    currentIndex + 1
                ].focus();

                return;

            }


            /*
                Last input:
                automatically calculate.
            */

            if (
                section.id ===
                "foundation-section"
            ) {

                calculateFoundation();

            }

            else if (
                section.id ===
                "plinth-lintel-section"
            ) {

                calculatePlinthLintel();

            }

            else if (
                section.id ===
                "stage3-section"
            ) {

                calculateStage3();

            }

        }
    );

}


/* =========================================================
   MODALS
========================================================= */

function showHistoryModal() {

    document
        .getElementById("history-modal")
        .classList.add("show");

}


function closeHistoryModal() {

    document
        .getElementById("history-modal")
        .classList.remove("show");

}


function showHelpModal() {

    document
        .getElementById("help-modal")
        .classList.add("show");

}


function closeHelpModal() {

    document
        .getElementById("help-modal")
        .classList.remove("show");

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    const container =
        document.querySelector(
            ".toast-container"
        );

    if (!container) {
        alert(message);
        return;
    }


    const toast =
        document.createElement("div");


    toast.className =
        "toast " + type;


    let icon = "info-circle";

    if (type === "success") {
        icon = "check-circle";
    }

    if (type === "error") {
        icon = "exclamation-circle";
    }


    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;


    container.appendChild(toast);


    setTimeout(function () {

        toast.remove();

    }, 3000);

}


/* =========================================================
   UTILITY
========================================================= */

function formatCurrency(value) {

    return Number(value || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function money(value) {

    return "INR " +
        formatCurrency(value);

}


function getNumber(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return NaN;
    }

    return parseFloat(element.value);

}


function validateNumber(value) {

    return (
        Number.isFinite(value) &&
        value > 0
    );

}


function validateIds(ids) {

    for (const id of ids) {

        const value = getNumber(id);

        if (!validateNumber(value)) {

            const element =
                document.getElementById(id);

            if (element) {
                element.focus();
            }

            showToast(
                "Please enter valid values in all required fields.",
                "error"
            );

            return false;
        }

    }

    return true;

}


/* =========================================================
   MIX RATIO
========================================================= */

function getMixRatio(mix) {

    if (mix === "m15") {

        return {
            cement: 1,
            sand: 2,
            aggregate: 4
        };

    }


    if (mix === "m25") {

        return {
            cement: 1,
            sand: 1,
            aggregate: 2
        };

    }


    return {
        cement: 1,
        sand: 1.5,
        aggregate: 3
    };

}


/* =========================================================
   STAGE 1
   FOUNDATION → PLINTH
========================================================= */

function calculateFoundation() {

    try {

        const customerName =
            document
                .getElementById("customer-name")
                .value
                .trim();


        const projectName =
            document
                .getElementById("project-name")
                .value
                .trim();


        const length =
            getNumber("f-length");

        const width =
            getNumber("f-width");

        const footings =
            getNumber("f-footings");

        const footingVolume =
            getNumber("f-footing-volume");

        const pccVolume =
            getNumber("f-pcc-volume");


        const cementRate =
            getNumber("f-cement-rate");

        const sandRate =
            getNumber("f-sand-rate");

        const jalliRate =
            getNumber("f-jalli-rate");


        if (
            !validateNumber(length) ||
            !validateNumber(width) ||
            !validateNumber(footings) ||
            !validateNumber(footingVolume) ||
            !validateNumber(pccVolume) ||
            !validateNumber(cementRate) ||
            !validateNumber(sandRate) ||
            !validateNumber(jalliRate)
        ) {

            showToast(
                "Please fill all Foundation details correctly.",
                "error"
            );

            return;

        }


        const mix =
            document
                .getElementById("f-mix")
                .value;


        /*
            Concrete
        */

        const footingConcrete =
            footings *
            footingVolume;


        const pcc =
            footings *
            pccVolume;


        const totalConcrete =
            footingConcrete +
            pcc;


        /*
            Dry volume
        */

        const dryVolume =
            totalConcrete * 1.54;


        /*
            Mix
        */

        const ratio =
            getMixRatio(mix);


        const totalParts =
            ratio.cement +
            ratio.sand +
            ratio.aggregate;


        /*
            Materials
        */

        const cementVolume =
            dryVolume *
            ratio.cement /
            totalParts;


        const cementBags =
            cementVolume / 1.25;


        const sandCFT =
            dryVolume *
            ratio.sand /
            totalParts;


        const aggregateCFT =
            dryVolume *
            ratio.aggregate /
            totalParts;


        /*
            Cost
        */

        const cementCost =
            cementBags *
            cementRate;


        const sandCost =
            sandCFT *
            sandRate;


        const aggregateCost =
            aggregateCFT *
            jalliRate;


        const totalCost =
            cementCost +
            sandCost +
            aggregateCost;


        appState.foundationData = {

            type: "foundation",

            customerName:
                customerName ||
                "Not Specified",

            projectName:
                projectName ||
                "Residential Building",

            length,
            width,
            footings,

            footingConcrete,
            pcc,
            totalConcrete,

            cementBags,
            sandCFT,
            aggregateCFT,

            cementRate,
            sandRate,
            jalliRate,

            cementCost,
            sandCost,
            aggregateCost,

            totalCost

        };


        displayFoundationResult(
            appState.foundationData
        );


        showToast(
            "Foundation calculated successfully!",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Foundation calculation error.",
            "error"
        );

    }

}


/* =========================================================
   STAGE 1 RESULT
========================================================= */

function displayFoundationResult(data) {

    const result =
        document.getElementById(
            "foundation-result"
        );


    result.innerHTML = `

        <h3>
            <i class="fas fa-calculator"></i>
            Foundation Material Estimate
        </h3>

        <p>
            <strong>Customer:</strong>
            ${data.customerName}
        </p>

        <p>
            <strong>Project:</strong>
            ${data.projectName}
        </p>

        <p>
            <strong>Building:</strong>
            ${data.length} ft × ${data.width} ft
        </p>

        <p>
            <strong>Footings:</strong>
            ${data.footings}
        </p>

        <table class="result-table">

            <tr>
                <th>Material</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>

            <tr>
                <td>Cement</td>
                <td>${data.cementBags.toFixed(2)} bags</td>
                <td>INR ${data.cementRate.toFixed(2)}</td>
                <td>${money(data.cementCost)}</td>
            </tr>

            <tr>
                <td>Sand</td>
                <td>${data.sandCFT.toFixed(2)} CFT</td>
                <td>INR ${data.sandRate.toFixed(2)}</td>
                <td>${money(data.sandCost)}</td>
            </tr>

            <tr>
                <td>Coarse Aggregate</td>
                <td>${data.aggregateCFT.toFixed(2)} CFT</td>
                <td>INR ${data.jalliRate.toFixed(2)}</td>
                <td>${money(data.aggregateCost)}</td>
            </tr>

            <tr class="total-row">
                <td colspan="3">
                    STAGE 1 TOTAL
                </td>

                <td>
                    ${money(data.totalCost)}
                </td>
            </tr>

        </table>

        <h3>
            Quantity Summary
        </h3>

        <p>
            <strong>Footing Concrete:</strong>
            ${data.footingConcrete.toFixed(2)} CFT
        </p>

        <p>
            <strong>PCC:</strong>
            ${data.pcc.toFixed(2)} CFT
        </p>

        <p>
            <strong>Total Concrete:</strong>
            ${data.totalConcrete.toFixed(2)} CFT
        </p>
    `;


    result.style.display = "block";


    document
        .getElementById("foundation-pdf-btn")
        .style.display = "inline-flex";


    document
        .getElementById("foundation-save-btn")
        .style.display = "inline-flex";


    document
        .getElementById("next-stage-btn")
        .style.display = "inline-flex";

}


/* =========================================================
   STAGE 1 RESET
========================================================= */

function resetFoundationForm() {

    const ids = [
        "customer-name",
        "project-name",
        "f-length",
        "f-width",
        "f-footings",
        "f-footing-volume",
        "f-pcc-volume"
    ];


    ids.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });


    document.getElementById(
        "f-mix"
    ).value = "m20";


    document.getElementById(
        "foundation-result"
    ).style.display = "none";


    document.getElementById(
        "foundation-pdf-btn"
    ).style.display = "none";


    document.getElementById(
        "foundation-save-btn"
    ).style.display = "none";


    document.getElementById(
        "next-stage-btn"
    ).style.display = "none";


    appState.foundationData = null;


    showToast(
        "Foundation form cleared.",
        "info"
    );

}


/* =========================================================
   GO TO STAGE 2
========================================================= */

function goToPlinthLintel() {

    if (!appState.foundationData) {

        showToast(
            "Please calculate Foundation first.",
            "error"
        );

        return;

    }


    const section =
        document.getElementById(
            "plinth-lintel-section"
        );


    section.style.display = "block";


    section.scrollIntoView({
        behavior: "smooth"
    });


    setTimeout(function () {

        document
            .getElementById("p-length")
            .focus();

    }, 500);

}


/* =========================================================
   STAGE 2
   PLINTH → LINTEL
========================================================= */

function calculatePlinthLintel() {

    try {

        const length =
            getNumber("p-length");

        const height =
            getNumber("p-height");

        const thickness =
            getNumber("p-thickness");

        const brickVolume =
            getNumber("p-brick-size");

        const brickRate =
            getNumber("p-brick-rate");

        const cementRate =
            getNumber("p-cement-rate");

        const sandRate =
            getNumber("p-sand-rate");


        if (
            !validateNumber(length) ||
            !validateNumber(height) ||
            !validateNumber(thickness) ||
            !validateNumber(brickVolume) ||
            !validateNumber(brickRate) ||
            !validateNumber(cementRate) ||
            !validateNumber(sandRate)
        ) {

            showToast(
                "Please fill all Plinth → Lintel details.",
                "error"
            );

            return;

        }


        /*
            Wall volume
        */

        const wallVolume =
            length *
            height *
            thickness;


        /*
            Bricks
        */

        let bricks =
            Math.ceil(
                wallVolume /
                brickVolume
            );


        /*
            5% wastage
        */

        bricks =
            Math.ceil(
                bricks * 1.05
            );


        /*
            Mortar
        */

        const mortarWet =
            wallVolume * 0.30;


        const dryMortar =
            mortarWet * 1.33;


        const cementMortar =
            dryMortar / 6;


        const sandMortar =
            dryMortar * 5 / 6;


        const cementBags =
            cementMortar / 1.25;


        /*
            Cost
        */

        const brickCost =
            bricks *
            brickRate;


        const cementCost =
            cementBags *
            cementRate;


        const sandCost =
            sandMortar *
            sandRate;


        const totalCost =
            brickCost +
            cementCost +
            sandCost;


        appState.plinthData = {

            type: "plinth",

            length,
            height,
            thickness,

            wallVolume,

            bricks,

            cementBags,
            sandCFT: sandMortar,

            brickRate,
            cementRate,
            sandRate,

            brickCost,
            cementCost,
            sandCost,

            totalCost

        };


        displayPlinthResult(
            appState.plinthData
        );


        showToast(
            "Plinth → Lintel calculated successfully!",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Plinth calculation error.",
            "error"
        );

    }

}


/* =========================================================
   STAGE 2 RESULT
========================================================= */

function displayPlinthResult(data) {

    const result =
        document.getElementById(
            "plinth-result"
        );


    result.innerHTML = `

        <h3>
            <i class="fas fa-calculator"></i>
            Plinth → Lintel Estimate
        </h3>

        <p>
            <strong>Wall Length:</strong>
            ${data.length} ft
        </p>

        <p>
            <strong>Wall Height:</strong>
            ${data.height} ft
        </p>

        <p>
            <strong>Wall Volume:</strong>
            ${data.wallVolume.toFixed(2)} CFT
        </p>

        <table class="result-table">

            <tr>
                <th>Material</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>

            <tr>
                <td>Bricks</td>
                <td>${data.bricks} Nos</td>
                <td>INR ${data.brickRate.toFixed(2)}</td>
                <td>${money(data.brickCost)}</td>
            </tr>

            <tr>
                <td>Cement</td>
                <td>${data.cementBags.toFixed(2)} bags</td>
                <td>INR ${data.cementRate.toFixed(2)}</td>
                <td>${money(data.cementCost)}</td>
            </tr>

            <tr>
                <td>Sand</td>
                <td>${data.sandCFT.toFixed(2)} CFT</td>
                <td>INR ${data.sandRate.toFixed(2)}</td>
                <td>${money(data.sandCost)}</td>
            </tr>

            <tr class="total-row">
                <td colspan="3">
                    STAGE 2 TOTAL
                </td>

                <td>
                    ${money(data.totalCost)}
                </td>
            </tr>

        </table>
    `;


    result.style.display = "block";


    document
        .getElementById("plinth-pdf-btn")
        .style.display = "inline-flex";


    document
        .getElementById("plinth-save-btn")
        .style.display = "inline-flex";


    document
        .getElementById("stage3-btn")
        .style.display = "inline-flex";

}


/* =========================================================
   STAGE 2 RESET
========================================================= */

function resetPlinthForm() {

    document.getElementById(
        "p-length"
    ).value = "";


    document.getElementById(
        "p-height"
    ).value = "";


    document.getElementById(
        "p-thickness"
    ).value = "0.375";


    document.getElementById(
        "p-brick-size"
    ).value = "0.07";


    document.getElementById(
        "plinth-result"
    ).style.display = "none";


    document.getElementById(
        "plinth-pdf-btn"
    ).style.display = "none";


    document.getElementById(
        "plinth-save-btn"
    ).style.display = "none";


    document.getElementById(
        "stage3-btn"
    ).style.display = "none";


    appState.plinthData = null;


    showToast(
        "Plinth form cleared.",
        "info"
    );

}


/* =========================================================
   GO TO STAGE 3
========================================================= */

function goToStage3() {

    if (!appState.plinthData) {

        showToast(
            "Please calculate Stage 2 first.",
            "error"
        );

        return;

    }


    const section =
        document.getElementById(
            "stage3-section"
        );


    section.style.display = "block";


    section.scrollIntoView({
        behavior: "smooth"
    });


    setTimeout(function () {

        document
            .getElementById(
                "s3-wall-length"
            )
            .focus();

    }, 500);

}


/* =========================================================
   STAGE 3
   LINTEL → ROOF
========================================================= */

function calculateStage3() {

    try {

        const wallLength =
            getNumber("s3-wall-length");

        const wallHeight =
            getNumber("s3-wall-height");

        const wallThickness =
            getNumber("s3-wall-thickness");

        const brickSize =
            getNumber("s3-brick-size");


        const roofLength =
            getNumber("s3-roof-length");

        const roofWidth =
            getNumber("s3-roof-width");

        const slabThickness =
            getNumber("s3-slab-thickness");


        const brickRate =
            getNumber("s3-brick-rate");

        const cementRate =
            getNumber("s3-cement-rate");

        const sandRate =
            getNumber("s3-sand-rate");

        const aggregateRate =
            getNumber("s3-aggregate-rate");


        if (
            !validateNumber(wallLength) ||
            !validateNumber(wallHeight) ||
            !validateNumber(wallThickness) ||
            !validateNumber(brickSize) ||
            !validateNumber(roofLength) ||
            !validateNumber(roofWidth) ||
            !validateNumber(slabThickness) ||
            !validateNumber(brickRate) ||
            !validateNumber(cementRate) ||
            !validateNumber(sandRate) ||
            !validateNumber(aggregateRate)
        ) {

            showToast(
                "Please fill all Stage 3 details.",
                "error"
            );

            return;

        }


        /*
            BRICK WALL
        */

        const wallVolume =
            wallLength *
            wallHeight *
            wallThickness;


        let bricks =
            Math.ceil(
                wallVolume /
                brickSize
            );


        bricks =
            Math.ceil(
                bricks * 1.05
            );


        /*
            MORTAR
        */

        const mortarWet =
            wallVolume * 0.30;


        const dryMortar =
            mortarWet * 1.33;


        const mortarCementVolume =
            dryMortar / 6;


        const mortarSand =
            dryMortar * 5 / 6;


        const mortarCementBags =
            mortarCementVolume / 1.25;


        /*
            ROOF SLAB
            inch → feet
        */

        const slabThicknessFeet =
            slabThickness / 12;


        const roofConcrete =
            roofLength *
            roofWidth *
            slabThicknessFeet;


        /*
            Dry volume
        */

        const roofDryVolume =
            roofConcrete * 1.54;


        const mix =
            document
                .getElementById("s3-mix")
                .value;


        const ratio =
            getMixRatio(mix);


        const totalParts =
            ratio.cement +
            ratio.sand +
            ratio.aggregate;


        const roofCementVolume =
            roofDryVolume *
            ratio.cement /
            totalParts;


        const roofCementBags =
            roofCementVolume / 1.25;


        const roofSand =
            roofDryVolume *
            ratio.sand /
            totalParts;


        const roofAggregate =
            roofDryVolume *
            ratio.aggregate /
            totalParts;


        /*
            TOTAL MATERIALS
        */

        const totalCementBags =
            mortarCementBags +
            roofCementBags;


        const totalSand =
            mortarSand +
            roofSand;


        /*
            COST
        */

        const brickCost =
            bricks *
            brickRate;


        const cementCost =
            totalCementBags *
            cementRate;


        const sandCost =
            totalSand *
            sandRate;


        const aggregateCost =
            roofAggregate *
            aggregateRate;


        const totalCost =
            brickCost +
            cementCost +
            sandCost +
            aggregateCost;


        appState.stage3Data = {

            type: "stage3",

            wallLength,
            wallHeight,
            wallThickness,

            wallVolume,
            bricks,

            roofLength,
            roofWidth,
            slabThickness,

            roofConcrete,

            mortarCementBags,
            mortarSand,

            roofCementBags,
            roofSand,
            roofAggregate,

            totalCementBags,
            totalSand,

            brickRate,
            cementRate,
            sandRate,
            aggregateRate,

            brickCost,
            cementCost,
            sandCost,
            aggregateCost,

            totalCost

        };


        displayStage3Result(
            appState.stage3Data
        );


        showToast(
            "Stage 3 calculated successfully!",
            "success"
        );


        /*
            FINAL ESTIMATE
        */

        calculateFinalBuildingEstimate();


    }

    catch (error) {

        console.error(error);

        showToast(
            "Stage 3 calculation error.",
            "error"
        );

    }

}


/* =========================================================
   STAGE 3 RESULT
========================================================= */

function displayStage3Result(data) {

    const result =
        document.getElementById(
            "stage3-result"
        );


    result.innerHTML = `

        <h3>
            <i class="fas fa-calculator"></i>
            Lintel → Roof Estimate
        </h3>

        <p>
            <strong>Wall Volume:</strong>
            ${data.wallVolume.toFixed(2)} CFT
        </p>

        <p>
            <strong>Roof Concrete:</strong>
            ${data.roofConcrete.toFixed(2)} CFT
        </p>

        <table class="result-table">

            <tr>
                <th>Material</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>

            <tr>
                <td>Bricks</td>
                <td>${data.bricks} Nos</td>
                <td>INR ${data.brickRate.toFixed(2)}</td>
                <td>${money(data.brickCost)}</td>
            </tr>

            <tr>
                <td>Cement</td>
                <td>${data.totalCementBags.toFixed(2)} bags</td>
                <td>INR ${data.cementRate.toFixed(2)}</td>
                <td>${money(data.cementCost)}</td>
            </tr>

            <tr>
                <td>Sand</td>
                <td>${data.totalSand.toFixed(2)} CFT</td>
                <td>INR ${data.sandRate.toFixed(2)}</td>
                <td>${money(data.sandCost)}</td>
            </tr>

            <tr>
                <td>Coarse Aggregate</td>
                <td>${data.roofAggregate.toFixed(2)} CFT</td>
                <td>INR ${data.aggregateRate.toFixed(2)}</td>
                <td>${money(data.aggregateCost)}</td>
            </tr>

            <tr class="total-row">
                <td colspan="3">
                    STAGE 3 TOTAL
                </td>

                <td>
                    ${money(data.totalCost)}
                </td>
            </tr>

        </table>
    `;


    result.style.display = "block";


    document
        .getElementById("stage3-pdf-btn")
        .style.display = "inline-flex";


    document
        .getElementById("stage3-save-btn")
        .style.display = "inline-flex";

}


/* =========================================================
   STAGE 3 RESET
========================================================= */

function resetStage3Form() {

    const ids = [
        "s3-wall-length",
        "s3-wall-height",
        "s3-roof-length",
        "s3-roof-width"
    ];


    ids.forEach(function (id) {

        document.getElementById(id).value = "";

    });


    document.getElementById(
        "s3-wall-thickness"
    ).value = "0.375";


    document.getElementById(
        "s3-brick-size"
    ).value = "0.07";


    document.getElementById(
        "s3-slab-thickness"
    ).value = "5";


    document.getElementById(
        "s3-mix"
    ).value = "m20";


    document.getElementById(
        "stage3-result"
    ).style.display = "none";


    document.getElementById(
        "stage3-pdf-btn"
    ).style.display = "none";


    document.getElementById(
        "stage3-save-btn"
    ).style.display = "none";


    const finalSection =
        document.getElementById(
            "final-estimate-section"
        );

    if (finalSection) {
        finalSection.remove();
    }


    appState.stage3Data = null;
    appState.finalData = null;


    showToast(
        "Stage 3 form cleared.",
        "info"
    );

}


/* =========================================================
   FINAL BUILDING ESTIMATE
========================================================= */

function calculateFinalBuildingEstimate() {

    if (
        !appState.foundationData ||
        !appState.plinthData ||
        !appState.stage3Data
    ) {

        return;

    }


    const f =
        appState.foundationData;

    const p =
        appState.plinthData;

    const s3 =
        appState.stage3Data;


    /*
        TOTAL MATERIALS
    */

    const totalCement =
        f.cementBags +
        p.cementBags +
        s3.totalCementBags;


    const totalSand =
        f.sandCFT +
        p.sandCFT +
        s3.totalSand;


    const totalBricks =
        p.bricks +
        s3.bricks;


    const totalAggregate =
        f.aggregateCFT +
        s3.roofAggregate;


    /*
        TOTAL COST
    */

    const totalBuildingCost =
        f.totalCost +
        p.totalCost +
        s3.totalCost;


    appState.finalData = {

        customerName:
            f.customerName,

        projectName:
            f.projectName,

        stage1:
            f.totalCost,

        stage2:
            p.totalCost,

        stage3:
            s3.totalCost,

        totalCement,
        totalSand,
        totalBricks,
        totalAggregate,

        totalBuildingCost

    };


    displayFinalBuildingEstimate(
        appState.finalData
    );

}


/* =========================================================
   FINAL RESULT UI
========================================================= */

function displayFinalBuildingEstimate(data) {

    let section =
        document.getElementById(
            "final-estimate-section"
        );


    /*
        Create section if it doesn't exist.
    */

    if (!section) {

        section =
            document.createElement("section");

        section.id =
            "final-estimate-section";

        section.className =
            "card";


        const container =
            document.querySelector(
                ".main-container"
            );


        container.appendChild(section);

    }


    section.innerHTML = `

        <div class="section-title">

            <div>

                <h2>
                    <i class="fas fa-chart-pie"></i>
                    FINAL BUILDING ESTIMATION
                </h2>

                <p class="section-description">
                    Complete estimate from Foundation to Roof
                </p>

            </div>

            <span class="badge">
                FINAL
            </span>

        </div>


        <h3 class="sub-title">
            <i class="fas fa-layer-group"></i>
            Three Stage Cost Summary
        </h3>


        <table class="result-table">

            <tr>
                <th>Stage</th>
                <th>Work</th>
                <th>Cost</th>
            </tr>

            <tr>
                <td>01</td>
                <td>Foundation → Plinth</td>
                <td>
                    ${money(data.stage1)}
                </td>
            </tr>

            <tr>
                <td>02</td>
                <td>Plinth → Lintel</td>
                <td>
                    ${money(data.stage2)}
                </td>
            </tr>

            <tr>
                <td>03</td>
                <td>Lintel → Roof</td>
                <td>
                    ${money(data.stage3)}
                </td>
            </tr>

            <tr class="total-row">
                <td colspan="2">
                    TOTAL BUILDING COST
                </td>

                <td>
                    ${money(data.totalBuildingCost)}
                </td>
            </tr>

        </table>


        <h3 class="sub-title">

            <i class="fas fa-boxes-stacked"></i>

            Complete Material Summary

        </h3>


        <table class="result-table">

            <tr>
                <th>Material</th>
                <th>Total Quantity</th>
            </tr>

            <tr>
                <td>Total Cement</td>
                <td>
                    ${data.totalCement.toFixed(2)}
                    Bags
                </td>
            </tr>

            <tr>
                <td>Total Sand</td>
                <td>
                    ${data.totalSand.toFixed(2)}
                    CFT
                </td>
            </tr>

            <tr>
                <td>Total Bricks</td>
                <td>
                    ${data.totalBricks}
                    Nos
                </td>
            </tr>

            <tr>
                <td>Total Coarse Aggregate</td>
                <td>
                    ${data.totalAggregate.toFixed(2)}
                    CFT
                </td>
            </tr>

        </table>


        <div
            style="
                margin-top:20px;
                padding:20px;
                border-radius:12px;
                text-align:center;
            "
        >

            <h2>
                TOTAL ESTIMATED BUILDING COST
            </h2>

            <div
                style="
                    font-size:28px;
                    font-weight:800;
                    margin-top:8px;
                "
            >
                ${money(data.totalBuildingCost)}
            </div>

        </div>


        <div class="action-buttons">

            <button
                class="pdf-btn"
                onclick="generateFinalBuildingPDF()">

                <i class="fas fa-file-pdf"></i>

                Generate Final Estimation PDF

            </button>

        </div>

    `;


    section.style.display = "block";


    setTimeout(function () {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }, 300);

}


/* =========================================================
   FOUNDATION PDF
========================================================= */

function generateFoundationPDF() {

    if (!appState.foundationData) {

        showToast(
            "Please calculate Foundation first.",
            "error"
        );

        return;

    }


    const data =
        appState.foundationData;


    const doc =
        createPDF(
            "FOUNDATION → PLINTH"
        );


    let y = 48;


    doc.setTextColor(
        30,
        41,
        59
    );


    doc.setFontSize(12);

    doc.setFont(
        "times",
        "bold"
    );

    doc.text(
        "CUSTOMER DETAILS",
        15,
        y
    );


    doc.setFont(
        "times",
        "normal"
    );

    doc.setFontSize(11);


    y += 9;

    doc.text(
        "Customer: " +
        data.customerName,
        15,
        y
    );

    y += 7;

    doc.text(
        "Project: " +
        data.projectName,
        15,
        y
    );

    y += 7;

    doc.text(
        `Building: ${data.length} ft × ${data.width} ft`,
        15,
        y
    );


    y += 12;


    doc.setFont(
        "times",
        "bold"
    );

    doc.text(
        "MATERIAL COST ESTIMATION",
        15,
        y
    );


    doc.autoTable({

        startY: y + 5,

        theme: "striped",

        head: [
            [
                "Material",
                "Quantity",
                "Rate",
                "Amount"
            ]
        ],

        body: [

            [
                "Cement",
                `${data.cementBags.toFixed(2)} bags`,
                money(data.cementRate),
                money(data.cementCost)
            ],

            [
                "Sand",
                `${data.sandCFT.toFixed(2)} CFT`,
                money(data.sandRate),
                money(data.sandCost)
            ],

            [
                "Coarse Aggregate",
                `${data.aggregateCFT.toFixed(2)} CFT`,
                money(data.jalliRate),
                money(data.aggregateCost)
            ]

        ],

        headStyles: {
            fillColor: [30, 58, 95],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
            fontSize: 12,
            font: "times"
        },

        bodyStyles: {
            fontStyle: "normal",
            halign: "left",
            fontSize: 11,
            font: "times"
        },

        columnStyles: {
            1: { halign: "right", fontSize: 11 },
            2: { halign: "right", fontSize: 11 },
            3: { halign: "right", fontSize: 11 }
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252]
        }

    });


    y =
        doc.lastAutoTable.finalY + 15;


    doc.setFontSize(14);

    doc.setTextColor(
        194,
        65,
        12
    );

    doc.setFont(
        "times",
        "bold"
    );

    doc.text(
        "STAGE 1 TOTAL: " +
        money(data.totalCost),
        15,
        y
    );


    addFooter(doc);


    doc.save(
        "Foundation-to-Plinth-Estimation.pdf"
    );


    showToast(
        "Foundation PDF generated!",
        "success"
    );

}


/* =========================================================
   PLINTH PDF
========================================================= */

function generatePlinthPDF() {

    if (!appState.plinthData) {

        showToast(
            "Please calculate Stage 2 first.",
            "error"
        );

        return;

    }


    const data =
        appState.plinthData;


    const doc =
        createPDF(
            "PLINTH → LINTEL"
        );


    doc.autoTable({

        startY: 50,

        theme: "striped",

        head: [
            [
                "Material",
                "Quantity",
                "Rate",
                "Amount"
            ]
        ],

        body: [

            [
                "Bricks",
                `${data.bricks} Nos`,
                money(data.brickRate),
                money(data.brickCost)
            ],

            [
                "Cement",
                `${data.cementBags.toFixed(2)} bags`,
                money(data.cementRate),
                money(data.cementCost)
            ],

            [
                "Sand",
                `${data.sandCFT.toFixed(2)} CFT`,
                money(data.sandRate),
                money(data.sandCost)
            ]

        ],

        headStyles: {
            fillColor: [30, 58, 95],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
            fontSize: 12,
            font: "times"
        },

        bodyStyles: {
            fontStyle: "normal",
            halign: "left",
            fontSize: 11,
            font: "times"
        },

        columnStyles: {
            1: { halign: "right", fontSize: 11 },
            2: { halign: "right", fontSize: 11 },
            3: { halign: "right", fontSize: 11 }
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252]
        }

    });


    const y =
        doc.lastAutoTable.finalY + 15;


    doc.setFontSize(14);

    doc.setTextColor(
        194,
        65,
        12
    );

    doc.setFont(
        "times",
        "bold"
    );

    doc.text(
        "STAGE 2 TOTAL: " +
        money(data.totalCost),
        15,
        y
    );


    addFooter(doc);


    doc.save(
        "Plinth-to-Lintel-Estimation.pdf"
    );


    showToast(
        "Stage 2 PDF generated!",
        "success"
    );

}


/* =========================================================
   STAGE 3 PDF
========================================================= */

function generateStage3PDF() {

    if (!appState.stage3Data) {

        showToast(
            "Please calculate Stage 3 first.",
            "error"
        );

        return;

    }


    const data =
        appState.stage3Data;


    const doc =
        createPDF(
            "LINTEL → ROOF"
        );


    doc.autoTable({

        startY: 50,

        theme: "striped",

        head: [
            [
                "Material",
                "Quantity",
                "Rate",
                "Amount"
            ]
        ],

        body: [

            [
                "Bricks",
                `${data.bricks} Nos`,
                money(data.brickRate),
                money(data.brickCost)
            ],

            [
                "Cement",
                `${data.totalCementBags.toFixed(2)} bags`,
                money(data.cementRate),
                money(data.cementCost)
            ],

            [
                "Sand",
                `${data.totalSand.toFixed(2)} CFT`,
                money(data.sandRate),
                money(data.sandCost)
            ],

            [
                "Coarse Aggregate",
                `${data.roofAggregate.toFixed(2)} CFT`,
                money(data.aggregateRate),
                money(data.aggregateCost)
            ]

        ],

        headStyles: {
            fillColor: [30, 58, 95],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
            fontSize: 12,
            font: "times"
        },

        bodyStyles: {
            fontStyle: "normal",
            halign: "left",
            fontSize: 11,
            font: "times"
        },

        columnStyles: {
            1: { halign: "right", fontSize: 11 },
            2: { halign: "right", fontSize: 11 },
            3: { halign: "right", fontSize: 11 }
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252]
        }

    });


    const y =
        doc.lastAutoTable.finalY + 15;


    doc.setFontSize(14);

    doc.setTextColor(
        194,
        65,
        12
    );

    doc.setFont(
        "times",
        "bold"
    );

    doc.text(
        "STAGE 3 TOTAL: " +
        money(data.totalCost),
        15,
        y
    );


    addFooter(doc);


    doc.save(
        "Lintel-to-Roof-Estimation.pdf"
    );


    showToast(
        "Stage 3 PDF generated!",
        "success"
    );

}


/* =========================================================
   FINAL PDF
========================================================= */

function generateFinalBuildingPDF() {

    if (!appState.finalData) {

        calculateFinalBuildingEstimate();

    }


    if (!appState.finalData) {

        showToast(
            "Please complete all three stages first.",
            "error"
        );

        return;

    }


    const final =
        appState.finalData;


    const f =
        appState.foundationData;

    const p =
        appState.plinthData;

    const s =
        appState.stage3Data;


    const doc =
        createPDF(
            "FINAL BUILDING ESTIMATION"
        );


    let y = 48;

    // Add cover section
    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.setTextColor(30, 58, 95);
    doc.text("PROJECT SUMMARY", 15, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.setTextColor(30, 41, 59);
    
    doc.text("Customer: " + final.customerName, 15, y);
    y += 7;
    doc.text("Project: " + final.projectName, 15, y);
    y += 7;
    doc.text("Prepared on: " + new Date().toLocaleDateString("en-IN"), 15, y);
    y += 15;

    doc.setTextColor(
        30,
        41,
        59
    );


    doc.setFontSize(12);


    doc.setFont(
        "times",
        "bold"
    );


    doc.text(
        "PROJECT DETAILS",
        15,
        y
    );


    doc.setFont(
        "times",
        "normal"
    );


    y += 9;


    doc.text(
        "Customer: " +
        final.customerName,
        15,
        y
    );


    y += 7;


    doc.text(
        "Project: " +
        final.projectName,
        15,
        y
    );


    y += 12;


    doc.setFont(
        "times",
        "bold"
    );


    doc.text(
        "THREE STAGE COST SUMMARY",
        15,
        y
    );


    doc.autoTable({

        startY: y + 5,

        theme: "grid",

        head: [
            [
                "Stage",
                "Work",
                "Amount"
            ]
        ],

        body: [

            [
                "01",
                "Foundation → Plinth",
                money(f.totalCost)
            ],

            [
                "02",
                "Plinth → Lintel",
                money(p.totalCost)
            ],

            [
                "03",
                "Lintel → Roof",
                money(s.totalCost)
            ],

            [
                "",
                "TOTAL BUILDING COST",
                money(final.totalBuildingCost)
            ]

        ],

        headStyles: {
            fillColor: [30, 58, 95],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 12,
            font: "times"
        },

        bodyStyles: {
            fontStyle: "normal",
            fontSize: 11,
            font: "times"
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252]
        }

    });


    y =
        doc.lastAutoTable.finalY + 15;


    doc.setFont(
        "times",
        "bold"
    );


    doc.setTextColor(
        30,
        58,
        95
    );


    doc.setFontSize(12);


    doc.text(
        "COMPLETE MATERIAL SUMMARY",
        15,
        y
    );


    doc.autoTable({

        startY: y + 5,

        theme: "grid",

        head: [
            [
                "Material",
                "Total Quantity"
            ]
        ],

        body: [

            [
                "Cement",
                `${final.totalCement.toFixed(2)} Bags`
            ],

            [
                "Sand",
                `${final.totalSand.toFixed(2)} CFT`
            ],

            [
                "Bricks",
                `${final.totalBricks} Nos`
            ],

            [
                "Coarse Aggregate",
                `${final.totalAggregate.toFixed(2)} CFT`
            ]

        ],

        headStyles: {
            fillColor: [30, 58, 95],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 12,
            font: "times"
        },

        bodyStyles: {
            fontStyle: "normal",
            fontSize: 11,
            font: "times"
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252]
        }

    });


    y =
        doc.lastAutoTable.finalY + 20;


    doc.setFillColor(
        255,
        247,
        237
    );


    doc.roundedRect(
        15,
        y - 8,
        180,
        25,
        3,
        3,
        "F"
    );


    doc.setTextColor(
        194,
        65,
        12
    );


    doc.setFontSize(15);


    doc.setFont(
        "times",
        "bold"
    );


    doc.text(
        "TOTAL ESTIMATED BUILDING COST",
        20,
        y
    );


    doc.text(
        money(final.totalBuildingCost),
        190,
        y + 10,
        {
            align: "right"
        }
    );


    y += 35;


    doc.setFontSize(9);


    doc.setTextColor(
        71,
        85,
        105
    );


    doc.setFont(
        "times",
        "normal"
    );


    doc.text(
        "This is a preliminary material and cost estimate.",
        15,
        y
    );


    doc.text(
        "Final quantities should be verified with structural drawings,",
        15,
        y + 6
    );


    doc.text(
        "site measurements and structural design.",
        15,
        y + 12
    );


    addFooter(doc);


    doc.save(
        "Final-Building-Estimation.pdf"
    );


    showToast(
        "Final Building PDF generated successfully!",
        "success"
    );

}


/* =========================================================
   PDF COMMON HEADER
========================================================= */

function createPDF(title) {

    const jsPDF =
        window.jspdf.jsPDF;


    const doc =
        new jsPDF();


    const pageWidth =
        doc.internal.pageSize.getWidth();


    doc.setFillColor(
        30,
        58,
        95
    );


    doc.rect(
        0,
        0,
        pageWidth,
        35,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFont(
        "times",
        "bold"
    );


    doc.setFontSize(24);


    doc.text(
        "CIVIL CONSTRUCTION ESTIMATION",
        pageWidth / 2,
        15,
        {
            align: "center"
        }
    );


    doc.setFontSize(14);


    doc.setFont(
        "times",
        "normal"
    );


    doc.text(
        title,
        pageWidth / 2,
        25,
        {
            align: "center"
        }
    );


    return doc;

}


/* =========================================================
   PDF FOOTER
========================================================= */

function addFooter(doc) {

    const pageWidth =
        doc.internal.pageSize.getWidth();


    const pageHeight =
        doc.internal.pageSize.getHeight();


    doc.setDrawColor(
        203,
        213,
        225
    );


    doc.line(
        15,
        pageHeight - 20,
        pageWidth - 15,
        pageHeight - 20
    );


    doc.setFontSize(8);


    doc.setTextColor(
        100,
        116,
        139
    );


    doc.text(
        "Civil Construction Estimator",
        pageWidth / 2,
        pageHeight - 12,
        {
            align: "center"
        }
    );

}


/* =========================================================
   HISTORY
========================================================= */

function getEstimates() {

    try {

        const data =
            localStorage.getItem(
                CONFIG.STORAGE_KEY
            );

        return data
            ? JSON.parse(data)
            : [];

    }

    catch (error) {

        return [];

    }

}


function saveEstimatesToStorage(
    estimates
) {

    localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify(estimates)
    );

}


function loadAndDisplayHistory() {

    const historyList =
        document.getElementById(
            "history-list"
        );


    if (!historyList) return;


    const estimates =
        getEstimates();


    if (!estimates.length) {

        historyList.innerHTML =
            `<p class="empty-state">
                No saved estimates yet.
            </p>`;

        return;

    }


    historyList.innerHTML =
        estimates
            .map(function (estimate, index) {

                return `

                    <div class="history-item">

                        <div class="history-item-title">
                            ${estimate.projectName || "Project"}
                            -
                            ${(estimate.type || "estimate").toUpperCase()}
                        </div>

                        <div class="history-item-date">
                            ${new Date(
                                estimate.date
                            ).toLocaleDateString("en-IN")}
                        </div>

                        <div class="history-item-date">
                            ${money(
                                estimate.totalCost ||
                                estimate.totalBuildingCost ||
                                0
                            )}
                        </div>

                        <div class="history-actions">

                            <button
                                class="history-btn"
                                onclick="viewEstimate(${index})">
                                View
                            </button>

                            <button
                                class="history-btn"
                                onclick="deleteEstimate(${index})">
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");

}


/* =========================================================
   SAVE ESTIMATE
========================================================= */

function saveEstimate(type) {

    let data = null;


    if (type === "foundation") {

        data =
            appState.foundationData;

    }

    else if (type === "plinth") {

        data =
            appState.plinthData;

    }

    else if (type === "stage3") {

        data =
            appState.stage3Data;

    }


    if (!data) {

        showToast(
            "Please calculate this stage first.",
            "error"
        );

        return;

    }


    const estimates =
        getEstimates();


    if (
        estimates.length >=
        CONFIG.MAX_HISTORY
    ) {

        estimates.shift();

    }


    estimates.push({

        ...data,

        type,

        date:
            new Date().toISOString()

    });


    saveEstimatesToStorage(
        estimates
    );


    loadAndDisplayHistory();


    showToast(
        "Estimate saved successfully!",
        "success"
    );

}


/* =========================================================
   VIEW HISTORY
========================================================= */

function viewEstimate(index) {

    const estimates =
        getEstimates();


    const estimate =
        estimates[index];


    if (!estimate) return;


    if (
        estimate.type ===
        "foundation"
    ) {

        appState.foundationData =
            estimate;

        displayFoundationResult(
            estimate
        );

        closeHistoryModal();


        document
            .getElementById(
                "foundation-result"
            )
            .scrollIntoView({
                behavior: "smooth"
            });

    }


    else if (
        estimate.type ===
        "plinth"
    ) {

        appState.plinthData =
            estimate;

        document
            .getElementById(
                "plinth-lintel-section"
            )
            .style.display = "block";


        displayPlinthResult(
            estimate
        );

        closeHistoryModal();

    }


    else if (
        estimate.type ===
        "stage3"
    ) {

        appState.stage3Data =
            estimate;

        document
            .getElementById(
                "stage3-section"
            )
            .style.display = "block";


        displayStage3Result(
            estimate
        );

        closeHistoryModal();

    }

}


/* =========================================================
   DELETE
========================================================= */

function deleteEstimate(index) {

    if (
        !confirm(
            "Are you sure you want to delete this estimate?"
        )
    ) {

        return;

    }


    const estimates =
        getEstimates();


    estimates.splice(
        index,
        1
    );


    saveEstimatesToStorage(
        estimates
    );


    loadAndDisplayHistory();


    showToast(
        "Estimate deleted.",
        "success"
    );

}
