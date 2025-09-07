const OPERATORS = "+-×÷";
const PRECEDENCE = {
    '×': 2,
    '÷': 2,
    '+': 1,
    '-': 1
  };
const OPERATOR_BUTTON_IDS = ["plus", "minus", "divide", "multiply", "equal"];

let isOutputPreviousAnswer = false;
let theme = "light";

let expression = document.querySelector("#calculation");
let history = document.querySelector("#history");
let buttonsContainer = document.querySelector("#buttons-container");

let root = document.documentElement;
let changeThemeButton = document.querySelector("#change-theme-button");

buttonsContainer.addEventListener("click", (e) => {
    switch (e.target.id) {
        case "clear":
            expression.textContent = "0";
            history.textContent = " ";
            break;
        case "del":
            if (expression.textContent.length === 1) {
                expression.textContent = "0";
            } else if (isLastCharOperator() || expression.textContent.split(" ").at(-1).length === 1) {
                expression.textContent = expression.textContent.slice(0, -2);
            } else {
                expression.textContent = expression.textContent.slice(0, -1);
            }
            
            break;
        case "percent":
            if (isNegativeSign()) {
                break;
            }

            if (isLastCharOperator()) {
                expression.textContent = expression.textContent.slice(0, -2);
            }

            expression.textContent += "%";
            break;
        case "plus":
            if (isNegativeSign()) {
                break;
            }
            
            if (isLastCharOperator()) {
                expression.textContent = expression.textContent.slice(0, -2);
            } 

            expression.textContent += " +";
            break;
        case "minus":
            if (isNegativeSign()) {
                break;
            }
            
            if (expression.textContent.slice(-1) === "+" || expression.textContent.slice(-1) === "-") {
                expression.textContent = expression.textContent.slice(0, -2);
            } 
            
            expression.textContent += " -";

            break;
        case "multiply":
            if (isNegativeSign()) {
                break;
            }
            
            if (isLastCharOperator()) {
                expression.textContent = expression.textContent.slice(0, -2);
            } 

            expression.textContent += " ×";
            break;
        case "divide":
            if (isNegativeSign()) {
                break;
            }
            
            if (isLastCharOperator()) {
                expression.textContent = expression.textContent.slice(0, -2);
            } 

            expression.textContent += " ÷";
            break;
        case "decimal":
            if (isOutputEmpty() || !isLastCharOperator()) {
                if (!isDecimalInUse()) {
                    expression.textContent += ".";
                }
            } else {
                expression.textContent += " 0.";
            }

            break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
            if (isOutputPreviousAnswer) {
                expression.textContent = "0";
            }
            if (isOutputEmpty()) {
                expression.textContent = e.target.id;
            } else if (isLastCharOperator() && !isNegativeSign()) {
                expression.textContent += " " + e.target.id;
            } else if (expression.textContent.slice(-1) === "%") { 
                expression.textContent += " × " + e.target.id;
            } else {
                expression.textContent += e.target.id;
            }

            break;
        case "equal":
            if (isLastCharOperator()) {
                break;
            }

            history.textContent = expression.textContent + " =";
            expression.textContent = parseExpression(expression.textContent);
            isOutputPreviousAnswer = true;
            return;
    }

    isOutputPreviousAnswer = false;
})

changeThemeButton.addEventListener("click", (e) => {
    let prevTheme;
    if (theme === "light") {
        theme = "dark";
        prevTheme = "light";
    } else {
        theme = "light";
        prevTheme = "dark";
    }

    root.style.setProperty("--current-button-shadow-1", "none");
    root.style.setProperty("--current-button-shadow-1", "none");
    root.style.setProperty("--current-box-shadow", "none");
    root.style.setProperty("--current-output", "none");
    root.style.setProperty("--opacity", "0");
    root.style.setProperty("--current-button-shadow-2", `var(--${theme}-button-shadow-2)`);


    setTimeout(() => {
        root.style.setProperty("--current-color", `var(--${theme}-color`);
        root.style.setProperty("--current-background", `var(--${theme}-background`);
        
    }, 500);

    setTimeout(() => {
        root.style.setProperty("--opacity", "1");
        root.style.setProperty("--current-box-shadow", `var(--${theme}-box-shadow)`);
        root.style.setProperty("--current-output", `var(--${theme}-output)`);
        root.style.setProperty("--current-gradient-1", `var(--${theme}-gradient-1)`);
        root.style.setProperty("--current-gradient-2", `var(--${theme}-gradient-2)`);
        root.style.setProperty("--current-button-shadow-1", `var(--${theme}-button-shadow-1)`);
    }, 1500);
})

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    return a / b;
}

function operate(a, b, operator) {
    switch(operator) {
        case "+":
            return add(a, b);
        case "-":
            return subtract(a, b);
        case "×":
            return multiply(a, b);
        case "÷":
            return divide(a, b);
    }
}

// parse with simplified Shunting yard algorithm without parentheses and powers
function parseExpression(expression) {
    // split components of expression
    let arrExpression = expression.split(" ");

    // convert percentages to decimal notation
    let tokens = arrExpression.map((item) => {
        if (item.slice(-1) === "%") {
            return Number(item.slice(0, 1)) * 0.01;
        } else if (OPERATORS.includes(item)){
            return item;
        } else {
            return Number(item);
        }
    })

    tokens = convertToRPN(tokens);

    let resultStack = [];

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];

        if (typeof(token) === "number") {
            resultStack.push(token);
        } else {
            let num1 = resultStack.pop();
            let num2 = resultStack.pop();

            switch (token) {
                case '+':
                    resultStack.push(add(num2, num1));
                    break;
                case '-':
                    resultStack.push(subtract(num2, num1));
                    break;
                case '×':
                    resultStack.push(multiply(num2, num1));
                    break; 
                case '÷':
                    resultStack.push(divide(num2, num1));
                break;
            }
        }
    }
    return Math.round((resultStack.pop() + Number.EPSILON) * 100) / 100;
}

// convert expression into postfix notation or Reverse Polish Notation
function convertToRPN(tokens) {
    let outputQueue = [];
    let operatorStack = [];

    for (let i = 0; i < tokens.length; i++) {
        if (typeof(tokens[i]) === "number") {
            outputQueue.push(tokens[i]);
        } else {
            while (operatorStack.length != 0 && PRECEDENCE[tokens[i]] <= PRECEDENCE[operatorStack.slice(-1)]) {
                outputQueue.push(operatorStack.pop());
            }

            operatorStack.push(tokens[i]);
        }
    }

    while (operatorStack.length !== 0) {
        outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
}

function isLastCharOperator() {
    let strExpression = expression.textContent;
    if (OPERATORS.includes(strExpression.charAt(strExpression.length - 1))) {
        return true;
    } else {
        false;
    }
}

function isOutputEmpty() {
    if (expression.textContent.length === 1 && expression.textContent === "0") {
        return true;
    } else {
        return false;
    }
}

function isNegativeSign() {

    if (expression.textContent.length === 1 && expression.textContent === "-") {
        return true;
    }

    if (expression.textContent.slice(-1) === "-" && OPERATORS.includes(expression.textContent.slice(-3).split(" ")[0])) {
        return true;
    }

    return false;
}

function isDecimalInUse() {
    let arrExpression = expression.textContent.split(" ");

    if (arrExpression[arrExpression.length - 1].includes(".")) {
        return true;
    }

    return false;
}