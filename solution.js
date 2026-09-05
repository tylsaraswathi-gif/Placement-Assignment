import fs from "fs";

// Read JSON file
const data = JSON.parse(
    fs.readFileSync("testcase.json", "utf8")
);


// --------------------------------------------------
// STEP 1: Convert value from given base to decimal
// --------------------------------------------------

function decodeValue(value, base) {

    const chars = "0123456789abcdefghijklmnopqrstuvwxyz";

    let result = 0n;
    base = BigInt(base);

    for (const c of value.toLowerCase()) {

        const digit = chars.indexOf(c);

        if (digit === -1 || BigInt(digit) >= base) {
            throw new Error(
                `Invalid digit '${c}' for base ${base}`
            );
        }

        result = result * base + BigInt(digit);
    }

    return result;
}


// --------------------------------------------------
// STEP 2: Read all points
// --------------------------------------------------

let points = [];

for (const key in data) {

    if (key === "keys") {
        continue;
    }

    const x = BigInt(key);

    const y = decodeValue(
        data[key].value,
        data[key].base
    );

    points.push({
        x: x,
        y: y
    });
}


// Sort points by x
points.sort((a, b) => {

    if (a.x < b.x) return -1;
    if (a.x > b.x) return 1;

    return 0;
});


const n = Number(data.keys.n);
const k = Number(data.keys.k);


// --------------------------------------------------
// STEP 3: GCD function
// Used to simplify fractions
// --------------------------------------------------

function gcd(a, b) {

    if (a < 0n) a = -a;
    if (b < 0n) b = -b;

    while (b !== 0n) {

        const temp = b;

        b = a % b;
        a = temp;
    }

    return a;
}


// --------------------------------------------------
// STEP 4: Lagrange interpolation at x = 0
// --------------------------------------------------

function lagrangeAt0(pts) {

    let resultNumerator = 0n;
    let resultDenominator = 1n;

    for (let i = 0; i < pts.length; i++) {

        let numerator = 1n;
        let denominator = 1n;

        for (let j = 0; j < pts.length; j++) {

            if (i === j) {
                continue;
            }

            // Numerator *= (0 - xj)
            numerator *= -pts[j].x;

            // Denominator *= (xi - xj)
            denominator *= (
                pts[i].x - pts[j].x
            );
        }

        const termNumerator =
            pts[i].y * numerator;

        const newNumerator =
            resultNumerator * denominator +
            termNumerator * resultDenominator;

        const newDenominator =
            resultDenominator * denominator;

        const g = gcd(
            newNumerator,
            newDenominator
        );

        resultNumerator =
            newNumerator / g;

        resultDenominator =
            newDenominator / g;
    }

    // Make denominator positive
    if (resultDenominator < 0n) {

        resultNumerator = -resultNumerator;
        resultDenominator = -resultDenominator;
    }

    return {
        numerator: resultNumerator,
        denominator: resultDenominator
    };
}


// --------------------------------------------------
// STEP 5: Generate all combinations of k points
// --------------------------------------------------

function getCombinations(array, k) {

    const result = [];

    function backtrack(start, current) {

        // We have selected k points
        if (current.length === k) {

            result.push([...current]);

            return;
        }

        for (
            let i = start;
            i < array.length;
            i++
        ) {

            current.push(array[i]);

            backtrack(
                i + 1,
                current
            );

            current.pop();
        }
    }

    backtrack(0, []);

    return result;
}


// --------------------------------------------------
// STEP 6: Try every possible group of k points
// --------------------------------------------------

const combinations = getCombinations(
    points,
    k
);

console.log("Number of roots:", n);
console.log("Required roots:", k);

console.log(
    "Total combinations:",
    combinations.length
);


// --------------------------------------------------
// STEP 7: Count how many times each secret appears
// --------------------------------------------------

const frequency = new Map();

for (const combination of combinations) {

    const result = lagrangeAt0(combination);

    const key =
        `${result.numerator}/${result.denominator}`;

    if (frequency.has(key)) {

        frequency.set(
            key,
            frequency.get(key) + 1
        );

    } else {

        frequency.set(key, 1);
    }
}


// --------------------------------------------------
// STEP 8: Find the most common secret
// --------------------------------------------------

let bestSecret = null;
let bestCount = 0;

for (const [secret, count] of frequency) {

    if (count > bestCount) {

        bestSecret = secret;
        bestCount = count;
    }
}


// --------------------------------------------------
// STEP 9: Convert fraction to final answer
// --------------------------------------------------

const [numString, denString] =
    bestSecret.split("/");

const finalNumerator = BigInt(numString);
const finalDenominator = BigInt(denString);

let finalSecret;

if (finalDenominator === 1n) {

    finalSecret = finalNumerator.toString();

} else {

    finalSecret =
        `${finalNumerator}/${finalDenominator}`;
}


// --------------------------------------------------
// OUTPUT
// --------------------------------------------------

console.log("\nFINAL SECRET:", finalSecret);
console.log(
    "Found in",
    bestCount,
    "combinations"
);