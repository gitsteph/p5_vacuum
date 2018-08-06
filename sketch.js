function getCircleCoordinates(centerX, centerY, diameter) {
    // for hachures
    function Coordinates() {
        this.xArray = new Array();
        this.yArray = new Array();
    }
    var coordinates = new Coordinates();
    var radius = diameter / 2;

    function angles(numSlices) {
        angles = [];
        angleIncrement = 360 / numSlices;
        for (i = 0; i < numSlices; i++) {
            angles.push(i * angleIncrement);
        }
        return angles;
    };

    var angles = angles(20);
    for (var i in angles) {
        xCoord = (Math.sin(angles[i]) * radius) + centerX;
        yCoord = (Math.cos(angles[i]) * radius) + centerY;
        coordinates.xArray.push(xCoord);
        coordinates.yArray.push(yCoord);
    }
    return coordinates;
}

function StrokeProps(weight, strokeRValue, strokeGValue, strokeBValue) {
    this.strokeWeight = weight;
    this.strokeRValue = strokeRValue, this.strokeGValue = strokeGValue, this.strokeBValue = strokeBValue;
};
function HachureProps(gap, angle) {
    this.gap = gap;
    this.angle = angle;
};

function scribbleCircle(scribble, centerX, centerY, diameter, strokeProps, hachureProps) {
    strokeWeight(strokeProps.strokeWeight);
    stroke(strokeProps.strokeRValue, strokeProps.strokeGValue, strokeProps.strokeBValue);
    var scribCoordinates = getCircleCoordinates(centerX, centerY, diameter);
    scribble.scribbleFilling(scribCoordinates.xArray, scribCoordinates.yArray, hachureProps.gap, hachureProps.angle);
    scribble.scribbleEllipse(centerX,centerY,diameter, diameter);
    noFill();
}

var balls = new Array();
var numBalls = 3;
var barriers = new Array();
var playing = false;

function setup() {
    var canvas = createCanvas(windowWidth * 0.98, windowHeight * 0.97);
    // make barriers
    barriers.push(matter.makeBarrier(windowWidth / 2, windowHeight, windowWidth, 50)); // floor
    barriers.push(matter.makeBarrier(windowWidth / 2, 0, windowWidth, 50)); // ceiling
    barriers.push(matter.makeBarrier(0, windowHeight / 2, 50, windowHeight)); // leftWall
    barriers.push(matter.makeBarrier(windowWidth, windowHeight / 2, 50, windowHeight)); // rightWall

    // instantiate balls
    for (var i=0; i < numBalls; i++) {
        ball = matter.makeBall(random(200, 800), random(200, 800), random(50, 400));
        ball.strokeProps = new StrokeProps(1, random(0, 355), random(0, 355), random(0, 355));
        ball.hachureProps = new HachureProps(5+random(10), 315);
        
        // instantiate oscillator
        env = new p5.Env();
        env.setADSR(.001, .2, .2, .5);
        env.setRange(1.0, 0.0);

        ball.body.env = env;
        var osc = new p5.Oscillator();
        osc.setType('sine');
        osc.freq(random(200, 800));
        osc.amp(env);
        osc.start();
        ball.osc = osc;

        balls.push(ball);
    };

    Matter.Events.on(matter.getEngine(), 'collisionStart', function(event) {
        var pairs = event.pairs;
        if (pairs.length > 0) {
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if ('env' in pair.bodyA) {
                    pair.bodyA.env.play();
                }
                if ('env' in pair.bodyB) {
                    pair.bodyB.env.play();
                }
            }
        }
    });
}

function draw() {
    matter.zeroGravity();
    fill(0, 200, 200, 100);

    var scribble = new Scribble();
    var canvas = createCanvas(windowWidth * 0.98, windowHeight * 0.97);
    matter.mouseInteraction(canvas);
    background(40);

    for (var i in balls) {
        randomSeed(millis()/100);
        scribbleCircle(scribble, balls[i].getPositionX(), balls[i].getPositionY(), balls[i].getDiameter(), balls[i].strokeProps, balls[i].hachureProps);
    };

    // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
    var fps = frameRate();
    fill(300);
    stroke(20);
    // text("FPS: " + fps.toFixed(2), 10, height - 10);
    text("Mouse to Push", 20, height - 20);
}
