var calc = function (expression, log) {
    function tokenizer(input) {
      var current = 0;
      var tokens = [];
      var NUMBERS = /[0-9\.]/;
      var OPERATORS = /[\+\-\*\/]/;

      while (current < input.length) {
        var char = input[current];
        if (char === '(') {
            tokens.push({ type: 'lparen' });
        }
        else if (char === ')') {
            tokens.push({ type: 'rparen' });
        }
        else if (NUMBERS.test(char)) {
            var value = '';
            while (NUMBERS.test(char)) {
                value += char;
                char = input[++current];
            }
            tokens.push({ type: 'number', value: value });
            continue;
        }
        else if (OPERATORS.test(char)) {
            tokens.push({ type: 'op', value: char });
        }
        current++;
      }
      if (log) { console.log('tokenizer: ' + JSON.stringify(tokens, null, 2)); };
      return tokens;
    }

    function priority(tokens) {
        var result = [];
        for(var i=0;i<tokens.length;i++) {
            var token = tokens[i];
            if(token.type === 'op') {
                token.prio = (token.value === '+' || token.value === '-') ? 0 : 1;
            }
            if(result.length === 0 || 
                result[result.length-1].type === 'op' || 
                result[result.length-1].type === 'lparen') {
                if(token.type === 'op' && token.value === '-') {
                    token.value = 'minus';
                    token.prio = 2;
                }
            }
            result.push(token);
        }
        if (log) { console.log('priority: ' + JSON.stringify(result, null, 2)); };
        return result;
    }

    function rpn(tokens) {
        var stack = [];
        var result = [];
        for(var i=0;i<tokens.length;i++) {
            var token = tokens[i];
            if(token.type === 'number') {
                result.push(token);
            }
            else if(token.type === 'op') {
                if(stack.length === 0) {
                    stack.push(token);
                }
                else {
                    while(stack.length > 0) {
                        var top = stack[stack.length-1];
                        if(top.type === 'op' && top.prio >= token.prio) {
                            result.push(stack.pop());
                        }
                        else {
                            break;
                        }
                    }
                    stack.push(token);
                }
            }
            else if(token.type === 'lparen') {
                stack.push(token);
            }
            else if(token.type === 'rparen') {
                while(stack.length > 0) {
                    var top = stack[stack.length-1];
                    if(top.type !== 'lparen') {
                        result.push(stack.pop());
                    }
                    else {
                        stack.pop();
                        break;
                    }
                }
            }
        }
        while(stack.length > 0) {
            result.push(stack.pop());
        }
        if (log) { console.log('rpn: ' + JSON.stringify(result, null, 2)); };
        return result;
    }

    function parser(tokens) {
        var stack = [];
        for(var i=0;i<tokens.length;i++) {
            var token = tokens[i];
            if (token.type === 'number') {
                stack.push({ type: 'Number', value: parseFloat(token.value) });
            }
            else if(token.type === 'op') {
                if(token.value === 'minus') {
                  stack.push({ type: 'Call', op: token.value, params: [stack.pop()] });    
                }
                else {
                    var param = stack.pop();
                    stack.push({ type: 'Call', op: token.value, params: [stack.pop(), param] });
                }
            }
        }
        if (log) { console.log('parser: ' + JSON.stringify(stack[0], null, 2)) ;};
        return stack[0];
    }

    function execute(ast) {
        function eval(node) {
            switch(node.type){
                case 'Call':
                switch(node.op) {
                    case '+':
                    return eval(node.params[0]) + eval(node.params[1]);
                    case '-':
                    return eval(node.params[0]) - eval(node.params[1]);
                    case '*':
                    return eval(node.params[0]) * eval(node.params[1]);
                    case '/':
                    return eval(node.params[0]) / eval(node.params[1]);
                    case 'minus':
                    return 0 - eval(node.params[0]);
                }
                case 'Number':
                return node.value;
            }
        }
        return eval(ast);
    }

    var result = execute(parser(rpn(priority(tokenizer(expression)))));
    if (log) { console.log(expression + ' = ' + result); };
    return result;
};

calc('(2 / (2 + 3.33) * 4) - -6', true);