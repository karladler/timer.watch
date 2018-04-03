if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
.then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
})
.catch(function(error) {
    console.log('Service worker registration failed, error:', error);
});
}

var dayFactor = 1000 * 60 * 60 * 24;
var hoursFactor = 1000 * 60 * 60;
var minutesFactor = 1000 * 60;
var secondsFactor = 1000;

var left;
var duration;
var countDownDate;
var start;

var clocks = ['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'].reverse();

var noSleep = new NoSleep();

document.addEventListener('click', go, false);

reset();

function reset() {
    // TODO: proper reset + UI
    var url = new URL(location.href);
    var d = parseInt(url.searchParams.get('d') || 0, 10) * dayFactor;
    var h = parseInt(url.searchParams.get('h') || 0, 10) * hoursFactor;
    var m = (parseInt(url.searchParams.get('m') || 0, 10) * minutesFactor);
    var s = parseInt(url.searchParams.get('s') || 0, 10) * secondsFactor;

    duration = (d + h + m + s);
    if (duration === 0) {
        duration = 15 * minutesFactor;
    }
    left = duration;

    setDisplay('▶');
}

function toggle() {
    if (!timer) {
        countDownDate = new Date().getTime() + left;
        timer = window.requestAnimationFrame(iteration);
    } else {
        var now = new Date().getTime();
        left = countDownDate - now; // set new duration by distance

        window.cancelAnimationFrame(timer);
        timer = false;
        noSleep.disable();
    }
}

function go() {
    document.removeEventListener('click', go, false);

    noSleep.enable();
    start = performance.now();
    countDownDate = start + duration;
    timer = window.requestAnimationFrame((t) => iteration(t));
}

function setDisplay(content) {
    window.requestAnimationFrame(() => {
        document.getElementById('timer').innerHTML = content;
    });
}

var counter = 0;
function iteration(now) {
    var distance = countDownDate - now;
    var progress = ((duration - (distance-1000)) / duration) * 100;
    var days = Math.floor(distance / dayFactor);
    var hours = Math.floor((distance % dayFactor) / hoursFactor);
    var minutes = Math.floor((distance % hoursFactor) / minutesFactor);
    var seconds = Math.floor((distance % minutesFactor) / secondsFactor);

    var daysOut = days > 0 ? days + ' days &shy;' : '';
    var hoursOut = ('00' + hours).substr(-2, 2) + ':';
    var minutesOut = ('00' + minutes).substr(-2, 2) + ':';
    var secondsOut = ('00' + seconds).substr(-2, 2);

    setDisplay(daysOut + hoursOut + minutesOut + secondsOut);

    if (minutes < 1) {
        document.title = secondsOut + ' s';
    } else {
       document.title = clocks[seconds % 12];
    }

    document.getElementById('progress-circle').setAttribute('stroke-dasharray', progress * 3 + ',300');

    if (distance < 0) {
        window.cancelAnimationFrame(timer);
        noSleep.disable();
        setDisplay('finished');
        document.title = 'finished';
    } else {
        window.requestAnimationFrame(iteration);
    }
}
