import fs from "fs";

// ==========================================
// 1. Read testcase.json
// ==========================================

const data = JSON.parse(
    fs.readFileSync("./testcase.json", "utf8")
);


// ==========================================
// 2. Convert value from any base to BigInt
// ==========================================

function convertToDecimal(value, base) {
    const digits = "0123456789abcdefghijklmnopqrstuvwxyz";

    let result = 0n;

    base = Number(base);

    for (const ch of value.toLowerCase()) {
        const digit = digits.indexOf(ch);

        if (digit < 0 || digit >= base) {
            throw new Error(
                `Invalid digit ${ch} for base ${base}`
            );
        }

        result = result * BigInt(base) + BigInt(digit);
    }

    return result;
}


// ==========================================
// 3. Greatest Common Divisor
// ==========================================

function gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;

    while (b !== 0n) {
        const temp = a % b;
        a = b;
        b = temp;
    }

    return a;
}


// ==========================================
// 4. Fraction Class
// ==========================================

class Fraction {

    constructor(num, den = 1n) {

        if (den === 0n) {
            throw new Error("Denominator cannot be zero");
        }

        if (den < 0n) {
            num = -num;
            den = -den;
        }

        const g = gcd(num, den);

        this.num = num / g;
        this.den = den / g;
    }


    add(other) {

        return new Fraction(
            this.num * other.den +
            other.num * this.den,

            this.den * other.den
        );
    }


    multiply(other) {

        return new Fraction(
            this.num * other.num,
            this.den * other.den
        );
    }


    toString() {

        if (this.den === 1n) {
            return this.num.toString();
        }

        return `${this.num}/${this.den}`;
    }
}


// ==========================================
// 5. Lagrange Interpolation
//    Calculate P(0)
// ==========================================

function lagrangeAtZero(points) {

    let result = new Fraction(0n);

    for (let i = 0; i < points.length; i++) {

        const xi = points[i].x;
        const yi = points[i].y;

        let term = new Fraction(yi);

        for (let j = 0; j < points.length; j++) {

            if (i === j) {
                continue;
            }

            const xj = points[j].x;

            term = term.multiply(
                new Fraction(
                    -xj,
                    xi - xj
                )
            );
        }

        result = result.add(term);
    }

    return result;
}


// ==========================================
// 6. Read n and k
// ==========================================

const n = Number(data.keys.n);
const k = Number(data.keys.k);

console.log("n =", n);
console.log("k =", k);


// ==========================================
// 7. Read actual points from JSON
// ==========================================

// Do NOT assume keys are 1,2,3,4...
// The JSON may contain 1,3,4,5,6...

const pointKeys = Object.keys(data)
    .filter(key => key !== "keys")
    .sort((a, b) => Number(a) - Number(b));


// Check that JSON contains enough points

if (pointKeys.length < k) {
    throw new Error(
        `Not enough points. Found ${pointKeys.length}, but k = ${k}`
    );
}


// ==========================================
// 8. Decode points
// ==========================================

const points = [];

for (const key of pointKeys) {

    const item = data[key];

    if (!item || item.value === undefined || item.base === undefined) {
        throw new Error(
            `Invalid point data for x = ${key}`
        );
    }

    const x = BigInt(key);

    const y = convertToDecimal(
        item.value,
        item.base
    );

    points.push({
        x,
        y
    });
}


// ==========================================
// 9. Display decoded points
// ==========================================

console.log("\nDecoded points:");

for (const point of points) {

    console.log(
        `x = ${point.x}, y = ${point.y}`
    );
}


// ==========================================
// 10. Generate combinations
// ==========================================

function combinations(array, size) {

    const result = [];

    function generate(start, current) {

        if (current.length === size) {

            result.push([
                ...current
            ]);

            return;
        }

        for (
            let i = start;
            i < array.length;
            i++
        ) {

            current.push(array[i]);

            generate(
                i + 1,
                current
            );

            current.pop();
        }
    }

    generate(0, []);

    return result;
}


// ==========================================
// 11. Generate all k-point combinations
// ==========================================

const allCombinations = combinations(
    points,
    k
);


// ==========================================
// 12. Calculate P(0) for every combination
// ==========================================

const frequency = new Map();

for (const combination of allCombinations) {

    const value = lagrangeAtZero(
        combination
    );

    const key = value.toString();

    frequency.set(
        key,
        (frequency.get(key) || 0) + 1
    );
}


// ==========================================
// 13. Find most frequent result
// ==========================================

let answer = null;
let maxFrequency = 0;

for (const [value, count] of frequency.entries()) {

    if (count > maxFrequency) {

        maxFrequency = count;

        answer = value;
    }
}


// ==========================================
// 14. Display result
// ==========================================

console.log(
    "\nNumber of points =",
    points.length
);

console.log(
    "Number of combinations =",
    allCombinations.length
);

console.log(
    "\nMost frequent result:"
);

console.log(answer);

console.log(
    "Frequency:",
    maxFrequency
);