const display = document.querySelector("#display");
const buttonList = document.querySelectorAll("button");
const MAX_DIGITS = 10;
let operand = null;
let operator = "";
let lastCalc = {
    op: "",
    buffer: "",
}

window.addEventListener("load", e => {
    display.textContent = 0;
    inputBuffer.reset();
});

window.addEventListener("keypress", e => {
    console.log("KEY PRESSED: " + e.key);
    const numKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    const opKeys = [
        {key: "+", func: "btnAdd"},
        {key: "-", func: "btnSubtract"},
        {key: "*", func: "btnMultiply"},
        {key: "/", func: "btnDivide"},
        {key: "=", func: "btnEquals"},
        {key: "Enter", func: "btnEquals"},
    ]
    if (numKeys.includes(e.key)) {
        inputBuffer = updateBuffer(e.key, inputBuffer);
    }
    if (e.key === ".") {
        inputBuffer = updateBuffer("decimal", inputBuffer);
    }
    if (e.key === "c" || e.key === "C") {
        clearAll();
    }
    if (opKeys.some(el => {
        // check if keypress is an operator key
        return e.key === el.key;
    })) {
        // find the matching equivalent button, then call the operate function
        console.log("Operator key detected");
        let equivButton = opKeys.find(obj => {
            return obj.key === e.key;
        });
        operate(equivButton.func);
    }
    if (e.key === "Delete") {
        inputBuffer.backspace();
    }
    updateDisplay(operand, operator, inputBuffer.toString());
});

buttonList.forEach(button => {
    button.addEventListener("click", e => {
        if (Array.from(button.classList).includes("numberKey")) {
            inputBuffer = updateBuffer(button.textContent, inputBuffer);
        } 
        else if (button.id == "btnDecimal") {
            inputBuffer = updateBuffer("decimal", inputBuffer);
        }
        else if (button.id == "btnNegative") {
            inputBuffer = updateBuffer("negative", inputBuffer);
        } 
        else if (Array.from(button.classList).includes("operatorKey")) {
            operate(button.id);
        } 
        else if (button.id == "btnEquals") {
            operate(button.id);
        } 
        else if (button.id == "btnClear") {
            clearAll();
        } 
        else if (button.id == "btnDelete") {
            inputBuffer.backspace();
        }
        updateDisplay(operand, operator, inputBuffer.toString());
    });
});

let inputBuffer = {
    reset: function() {
        this.register = [];
        this.maxLength = MAX_DIGITS;
        this.isPositive = true;
        this.resultDisplay = false;
    },
    toNumber: function() {
        if (this.register.length === 0) {
            return 0;
        } else {
            let r = this.isPositive ? "" : "-";
            r += this.register.join("");
            return Number(r);
        }
    },
    toString: function() {
        if (this.register.length === 0) {
            return "";
        } else {
            let r = this.isPositive ? "" : "-";
            r += this.register.join("");
            return r;
        }
    },
    // inputString(s) loads string s back into the registers and makes sure
    // negative values are handled.
    inputString: function(s) {
        s = s.toString().split("");
        if (s[0] === "-") {
            this.isPositive = false;
            this.maxLength = MAX_DIGITS + 1;
        } else {
            this.isPositive = true;
            this.maxLength = MAX_DIGITS;
        }
        this.register = s;
    },
    backspace: function() {
        this.register.pop();
    }
}

const calc = {
    calculate(op1, op2, operator) {
        let calcResult;
        switch (operator) {
            case "btnAdd": {
                calcResult = this.add(op1, op2);
                break;
            }
            case "btnSubtract": {
                calcResult = this.subtract(op1, op2);
                break;
            }
            case "btnMultiply": {
                calcResult = this.multiply(op1, op2);
                break;
            }
            case "btnDivide": {
                calcResult = this.divide(op1, op2);
                break;
            }
        }
            return roundDigits(calcResult);
    },
    add(a,b) {
        return Number(a) + Number(b);
    },
    subtract(a,b) {
        return Number(a) - Number(b);
    },
    multiply(a,b) {
        return Number(a) * Number(b);
    },
    divide(a,b) {
        if (Number(b) === 0) {
            clearAll();
            display.textContent = "ERROR: can't divide by 0";
            throw new Error("ERROR: can't divide by 0");
        }
        return Number(a) / Number(b);
    },
}

function roundDigits(number, maxLength = MAX_DIGITS) {
    number = number.toString();
    // round off anything exceeding the max length
    let addNeg = 0;
    let addDec = 0;
    if (number[0] == "-") {
        addNeg = 1;
    }
    if (number.includes(".")) {
        addDec = 1;
    }
    if (number.length > maxLength + addNeg + addDec) {
        let wholePart = number.split(".")[0];
        if (wholePart.length > maxLength + addNeg) {
            display.textContent = "ERROR: Overflow";
            throw new Error("ERROR: Overflow");
        } else {
            console.log(number);
            number = Number(number).toFixed(maxLength - wholePart.length + addNeg);
            console.log(number);
        }
    }
    number = Number(number); // to eliminate trailing decimal zeroes
    return number;
}

function operate(newOp) {
    let lastOp = operator;
    // EQUALS BUTTON PRESSED
    if (newOp === "btnEquals") {
        if ((operand === null || operator === "") && !inputBuffer.resultDisplay) {
            // nothing to operate on
            return;
        } else {
            if (inputBuffer.resultDisplay) {
                // repeated equals press - repeat the last calculation
                op1 = inputBuffer.toNumber();
                op2 = lastCalc.buffer;
                lastOp = lastCalc.op;
            } else {
                op1 = operand;
                op2 = inputBuffer.toNumber();
            }
            // store values in lastCalc object for repeated presses
            lastCalc.op = lastOp;
            lastCalc.buffer = op2;
            // we need to put the result back into the inputBuffer
            // for proper display
            operand = null;
            inputBuffer.inputString(calc.calculate(op1, op2, lastOp));
            inputBuffer.resultDisplay = true;
            operator = "";
        }
    }
    // OPERATOR KEY PRESSED
    else if (operand === null && lastOp === "") {
        // this is the first term. Just make it the result and store the operator.
        operand = inputBuffer.toNumber();
        operator = newOp;
        inputBuffer.reset();
    } 
    else if (operand !== null && lastOp === "") {
        // equals was pressed. Chain the next op.
        operator = newOp;
        inputBuffer.reset();
    }
    else {
        op1 = operand;
        op2 = inputBuffer.toNumber();
        operand = calc.calculate(op1, op2, lastOp);
        operator = newOp;
        inputBuffer.reset();
    }
    updateDisplay(operand, operator, inputBuffer.toString());
}

function updateBuffer(key, currentBuffer) {
    // this function handles keypresses that affect the input buffer:
    // 0-9, decimal point, and negative toggle. 
    let buffer = currentBuffer;
    // numeric keys immediately following equals (buffer.resultdisplay true)
    // should reset the input buffer
    if (key !== "negative" && buffer.resultDisplay) {
        buffer.reset();
    }
    if (key == "decimal") {
        // only add the decimal if it doesn't yet exist
        if (!buffer.register.includes(".")) {
            buffer.register.push(".");
            buffer.maxLength = MAX_DIGITS + 1;
        }
    }
    else if (key == "negative") {
        buffer.isPositive = !buffer.isPositive;
    }
    else if (!(key === "0" 
               && buffer.register.length === 1
               && buffer.register[0] === "0") // ignore multiple leading zeros
            && (buffer.register.length < buffer.maxLength)) {
        buffer.register.push(key);
    }
    console.table(buffer);
    return buffer;
}

function clearAll() {
    inputBuffer.reset();
    operand = null;
    operator = "";
    updateDisplay(operand, operator, inputBuffer.toString());
}

function updateDisplay(result, operator, buffer) {
    if (result === null) {
        display.textContent = buffer;
    } else {
        let operatorSymbol = "";
        switch(operator) {
            case "btnAdd": 
                operatorSymbol = "+";
                break;
            case "btnSubtract": 
                operatorSymbol = "-";
                break;
            case "btnMultiply": 
                operatorSymbol = "*";
                break;
            case "btnDivide": 
                operatorSymbol = "/";
                break;
            case "":
                operatorSymbol = "";
        }
        //display.textContent = `${result} ${operatorSymbol} ${buffer === "0" ? "" : buffer}`;
        display.textContent = `${result} ${operatorSymbol} ${buffer}`;
    }
    if (display.textContent === "") {
        display.textContent = "0";
    }
};
