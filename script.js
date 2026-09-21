const canvasImagine = document.getElementById("canvasImagine");
const canvasContextImagine = canvasImagine.getContext('2d');

// canvas-ul unde apare partea selectata din poza 
const canvasCrop = document.getElementById("canvasCrop");
const canvasContextCrop = canvasCrop.getContext('2d');


document.addEventListener('dragover', function (e) {
    e.preventDefault();
});

let img = new Image();
document.addEventListener('drop', function (e) {
    e.preventDefault();

    const selectare = false;
    const fisiere = e.dataTransfer.files; // indica ce imagine a fost pusa cu drag and drop
    if (fisiere.length > 0) {
        const fisier = fisiere[0]; // fisierul adaugat
        const reader = new FileReader(); // citirea fisierului de pe disk
        reader.addEventListener('load', function (e) {
            img.src = reader.result;
            img.addEventListener('load', function (e) {
                canvasImagine.width = img.naturalWidth;
                canvasImagine.height = img.naturalHeight;
                canvasContextImagine.drawImage(img, 0, 0); // desenarea imaginii

            });
            img.src = reader.result; // incarcarea imaginii
        });
        reader.addEventListener('error', function () {
            alert('imaginea nu a putut fi incarcata');
        });
        reader.readAsDataURL(fisier); // apelul metodei ce poate declansa evenimentul load
    }
});

let startX = 0;
let startY = 0;

// eveniment declansat atunci cand se incepe selectia 
canvasImagine.addEventListener('mousedown', function (e) {
    selectare = true;
    startX = e.clientX;
    startY = e.clientY;
});


let imgCrop;
let scaledCoordX, scaledCoordY, scaledEndX, scaledEndY;

/* functie care delimiteaza partea selectata din poza de restul pozei
    si care implementeaza crop-ul interactiv
*/
function drawSelection() {
    canvasContextImagine.clearRect(0, 0, canvasImagine.width, canvasImagine.height); // pentru a avea vedea doar ultima selectie
    canvasContextImagine.drawImage(img, 0, 0); // redesenare imagine pentru a realiza selectia
    let ratio = 1;
    // setare ratio in functie de latimea pozei; latime mai mare => ratio mai mare
    if(img.width > 2000)
        ratio = img.width / img.height * 3;
    canvasContextImagine.setLineDash([8, 8]); // liniute de lungime 8 si distanta dintre ele 8
    canvasContextImagine.strokeStyle = "cyan";
    canvasContextImagine.lineWidth = ratio; // latime liniute setata in functie de ratio
    canvasContextImagine.strokeRect(scaledCoordX, scaledCoordY, scaledEndX - scaledCoordX, scaledEndY - scaledCoordY); // desenare dreptunghi ce contine zona selectata

    imgCrop = canvasContextImagine.getImageData(scaledCoordX, scaledCoordY, scaledEndX - scaledCoordX, scaledEndY - scaledCoordY);

    // setarea dimensiunilor canvas-ului Crop conform dimensiunii imaginii selectate
    canvasCrop.width = imgCrop.width;
    canvasCrop.height = imgCrop.height;
    canvasContextCrop.putImageData(imgCrop, 0, 0); // punere imagine pe canvasul Crop la coordonatele (0,0)

}

// eveniment declansat atunci cand se incheie selectia 
canvasImagine.addEventListener('mouseup', function (e) {
    if (selectare) {
        selectare = false;
        endX = e.clientX;
        endY = e.clientY;

        // calcul factor de scalare - dimensiunea imaginii vs dimensiunea imaginii dupa ce este pusa pe canvas
        const scalareX = canvasImagine.width / canvasImagine.clientWidth;
        const scalareY = canvasImagine.height / canvasImagine.clientHeight;

        scaledCoordX = startX * scalareX;
        scaledCoordY = startY * scalareY;
        scaledEndX = endX * scalareX;
        scaledEndY = endY * scalareY;

        drawSelection();
        drawHistogram();
    }

});

// eveniment delcansat atunci cand apasam butonul de stergere a selectiei
const btnStergere = document.getElementById("btnStergere");
btnStergere.addEventListener('click', function () {
    canvasContextImagine.clearRect(scaledCoordX, scaledCoordY, imgCrop.width, imgCrop.height);
    canvasContextCrop.clearRect(0, 0, canvasCrop.width, canvasCrop.height);
});

// functie ce se apeleaza atunci cand utilizatorul vrea sa adauge text 
const btnText = document.getElementById("btnText");
function addText() {
    const text = document.getElementById("text").value;
    const dimensiune = parseInt(document.getElementById("dimensiune").value);
    const color = document.getElementById("color").value;
    const coordinateX = parseInt(document.getElementById("coordinateX").value);
    const coordinateY = parseInt(document.getElementById("coordinateY").value);


    const font = dimensiune + "px Calibri";
    canvasContextImagine.font = font;
    canvasContextImagine.fillStyle = color;

    // pentru a ne asigura ca textul se pune dupa ce imaginea s-a incarcat deja; o redesenam
    canvasContextImagine.drawImage(img, 0, 0);
    // desenarea textului pe canvasul cu imaginea
    canvasContextImagine.fillText(text, coordinateX, coordinateY);
}

// atunci cand dam click pe butonul btnText, se apeleaza functia addText
btnText.addEventListener('click', addText);


/* butoanele corespunzatoare efectelor sunt puse intr-un div
    atunci cand apasam pe unul, se apeleaza functia care verifica ce efect se va utiliza
*/
const effectsDiv = document.getElementById("Effects");
effectsDiv.addEventListener('click', function (e) {
    const target = e.target;
    if (target.tagName === 'BUTTON') {
        const effect = target.dataset.effect;
        applyEffect(effect);
    }
});

function applyEffect(effect) {
    drawSelection();
    switch (effect) {
        case 'grayscale':
            grayscaleEffect();
            break;
        case 'sepia':
            sepiaEffect();
            break;
        case 'treshold':
            tresholdEffect();
            break;

    }
    // adauga imaginea cu filtru in zona selectata, deseneaza histograma si o adauga si in canvas-ul pentru crop
    canvasContextImagine.putImageData(imgCrop, scaledCoordX, scaledCoordY);
    drawHistogram();
    canvasContextCrop.putImageData(imgCrop, 0, 0);
}


function grayscaleEffect() {
    const data = imgCrop.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const average = (r + g + b) / 3;
        data[i] = data[i + 1] = data[i + 2] = average;
    }   
}

function sepiaEffect() {
    const data = imgCrop.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const rSepia = (r * 0.393) + (g * 0.769) + (b * 0.189);
        const gSepia = (r * 0.349) + (g * 0.686) + (b * 0.168);
        const bSepia = (r * 0.272) + (g * 0.534) + (b * 0.131);
        data[i] = rSepia;
        data[i + 1] = gSepia;
        data[i + 2] = bSepia;
    }
}

function tresholdEffect() {
    const level = 130;
    const data = imgCrop.data;
    for (let i = 0; i < data.length; i += 4) {
        if ((data[i] + data[i + 1] + data[i + 2]) / 3 < level) {
            data[i] = data[i + 1] = data[i + 2] = 0;
        }
        else {
            data[i] = data[i + 1] = data[i + 2] = 255;
        }
    }
}

const canvasHistogram = document.getElementById("canvasHistogram");

function drawBarChart(canvas, values, options) {
    const context = canvas.getContext('2d');
    context.save();
    context.fillStyle = '#DEDEDE';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'green';
    context.strokeStyle = 'black';
    context.lineWidth = 2;

    const maxValue = Math.max(...values);
    const f = canvas.height / maxValue;
    const barWidth = canvas.width / values.length;

    for (let i = 0; i < values.length; i++) {
        const barHeight = values[i] * f * 0.9;
        const barX = i * barWidth + barWidth / 4;
        const barY = canvas.height - barHeight;

        context.fillRect(barX, barY, barWidth / 2, barHeight);

        if (options.stroke)
            context.strokeRect(barX, barY, barWidth / 2, barHeight);
    }

    context.restore();
}

function drawHistogram() {
    const v = [];
    for (let i = 0; i < 256; i++) {
        v.push(0);
    }

    const data = imgCrop.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];

        const average = Math.round((r + g + b) / 3);
        v[average]++;
    }

    drawBarChart(canvasHistogram, v, { stroke: false });
}

const btnScalare = document.getElementById("btnScale");
btnScalare.addEventListener('click', function () {
    let newWidth = parseInt(document.getElementById("width").value);
    let newHeight = parseInt(document.getElementById("height").value);

    // daca sunt introduse valori atat pentru width, cat si pt height, va scala in functie de width
    if (!isNaN(newWidth)) {
        const ratio = img.width / img.height;
        newHeight = Math.round(newWidth / ratio);
    }
    else {
        const ratio = img.width / img.height;
        newWidth = Math.round(newHeight * ratio);
    }

    //stergem imaginea precedenta de pe canvas
    canvasContextImagine.clearRect(0, 0, canvasImagine.width, canvasImagine.height);

    canvasContextImagine.drawImage(img, 0, 0, newWidth, newHeight);

    //stergem imaginea si de pe canvasul Crop
    canvasContextCrop.clearRect(0, 0, canvasCrop.width, canvasCrop.height);

});



