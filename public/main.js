if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
        console.log('Registration successful, scope is:', registration.scope);
    }).catch(function(error) {
        console.log('Service worker registration failed, error:', error);
    });
}

var dayFactor = 1000 * 60 * 60 * 24;
var hoursFactor = 1000 * 60 * 60;
var minutesFactor = 1000 * 60;
var secondsFactor = 1000;
var oneDegreeFactor = 1/24;

var distance;
var duration;
var countDownDate;
var start;
var timer;
var state = 'init';

var clocks = ['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'].reverse();

var noSleep = new NoSleep();
var ztr = new ZingTouch.Region(document.body);
var clockElement = document.body.firstElementChild;
var rotate = new ZingTouch.Rotate();

var startButton = document.getElementById('start-button');
var pauseButton = document.getElementById('pause-button');
var resetButton = document.getElementById('reset-button');
var hintText = document.getElementById('hint');

startButton.addEventListener('click', go, false);
pauseButton.addEventListener('click', pause, false);
resetButton.addEventListener('click', reset, false);

reset();

function reset() {
    ztr.bind(clockElement, rotate, function(e) {
        var angle = Math.max(e.detail.distanceFromOrigin + 360, 0);
        duration = oneDegreeFactor * angle * minutesFactor;

        setDisplay(getFormatedTime(duration));
    });

    if (state === 'running') {
        window.cancelAnimationFrame(timer);
        toggleVisibility(startButton, pauseButton);
        toggleVisibility(hintText, resetButton);
    }

    distance = undefined;
    countDownDate = undefined;
    start = undefined;
    timer = undefined;
    state = 'init';

    if (!duration) {
        var url = new URL(location.href);
        var d = parseInt(url.searchParams.get('d') || 0, 10) * dayFactor;
        var h = parseInt(url.searchParams.get('h') || 0, 10) * hoursFactor;
        var m = (parseInt(url.searchParams.get('m') || 0, 10) * minutesFactor);
        var s = parseInt(url.searchParams.get('s') || 0, 10) * secondsFactor;

        duration = (d + h + m + s);
    }

    if (!duration || duration === 0) {
        duration = 15 * minutesFactor;
    }

    setDisplay(getFormatedTime(duration));

    document.getElementById('progress-circle').setAttribute('stroke-dasharray', '0,300');
}

function pause() {
    state = 'paused';

    toggleVisibility(startButton, pauseButton);
    noSleep.disable();

    window.cancelAnimationFrame(timer);
}

function toggleVisibility(e1, e2) {
    if (e1.classList.contains('hidden')) {
        e1.classList.remove('hidden');
        e2.classList.add('hidden');
    } else {
        e1.classList.add('hidden');
        e2.classList.remove('hidden');
    }
}

function go() {
    if (state === 'init') {
        toggleVisibility(hintText, resetButton);
    }

    state = 'running';

    toggleVisibility(startButton, pauseButton);

    ztr.unbind(clockElement);
    noSleep.enable();
    start = performance.now();
    countDownDate = distance < duration ? start + distance : start + duration;
    timer = window.requestAnimationFrame((t) => iteration(t));
}

function setDisplay(content) {
    document.getElementById('timer').innerHTML = content;
}

function getFormatedTime(seconds) {
    var days = Math.floor(seconds / dayFactor);
    var hours = Math.floor((seconds % dayFactor) / hoursFactor);
    var minutes = Math.floor((seconds % hoursFactor) / minutesFactor);
    var seconds = Math.floor((seconds % minutesFactor) / secondsFactor);

    var daysOut = days > 0 ? days + ' days &shy;' : '';
    var hoursOut = ('00' + hours).substr(-2, 2) + ':';
    var minutesOut = ('00' + minutes).substr(-2, 2) + ':';
    var secondsOut = ('00' + seconds).substr(-2, 2);

    return daysOut + hoursOut + minutesOut + secondsOut;
}

function iteration(now) {
    distance = countDownDate - now;
    var progress = ((duration - (distance-1000)) / duration) * 100;

    setDisplay(getFormatedTime(distance));

    // TODO: proper title handling
    if (distance < 60000) {
        var seconds = Math.floor((distance % minutesFactor) / secondsFactor);
        document.title = ('00' + seconds).substr(-2, 2) + ' s';
    }

    document.getElementById('progress-circle').setAttribute('stroke-dasharray', progress * 3 + ',300');

    if (distance <= 0) {
        window.cancelAnimationFrame(timer);
        noSleep.disable();
        setDisplay('finished');
        document.title = 'finished';
    } else {
        timer = window.requestAnimationFrame(iteration);
    }
}
