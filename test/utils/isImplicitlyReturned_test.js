import { ok, strictEqual } from 'assert';
import isImplicitlyReturned from '../../src/utils/isImplicitlyReturned';
import parse from '../../src/utils/parse';

describe('isImplicitlyReturned', function() {
  it('is false for blocks', function() {
    const node = parse('0').body;
    strictEqual(node.type, 'Block');
    ok(!isImplicitlyReturned(node));
  });

  it('is false for the last expression in a top-level block', function() {
    const node = parse('0').body.statements[0];
    strictEqual(node.type, 'Int');
    ok(!isImplicitlyReturned(node));
  });

  it('is true for the last expression of a function block', function() {
    const node = parse('->\n  0').body.statements[0].body.statements[0];
    strictEqual(node.type, 'Int');
    ok(isImplicitlyReturned(node));
  });

  it('is true for the last expression of a bound function block', function() {
    const node = parse('=>\n  0').body.statements[0].body.statements[0];
    strictEqual(node.type, 'Int');
    ok(isImplicitlyReturned(node));
  });

  it('is true for the body of a block-less function', function() {
    const node = parse('-> 0').body.statements[0].body;
    strictEqual(node.type, 'Int');
    ok(isImplicitlyReturned(node));
  });

  it('is false for the body of a block-less bound function', function() {
    const node = parse('=> 0').body.statements[0].body;
    strictEqual(node.type, 'Int');
    ok(!isImplicitlyReturned(node));
  });

  it('is false for non-last expressions in a function block', function() {
    const node = parse('=>\n  0\n  a').body.statements[0].body.statements[0];
    strictEqual(node.type, 'Int');
    ok(!isImplicitlyReturned(node));
  });

  it('is false for an explicit return statement', function() {
    const node = parse('->\n  return 1').body.statements[0].body.statements[0];
    strictEqual(node.type, 'Return');
    ok(!isImplicitlyReturned(node));
  });

  it('is false for an `if` statement', function() {
    const node = parse('->\n  if a\n    b').body.statements[0].body.statements[0];
    strictEqual(node.type, 'Conditional');
    ok(!isImplicitlyReturned(node));
  });

  it('is true for the last expression of an `if` block that is the last statement in a function', function() {
    const node = parse('->\n  if a\n    b').body.statements[0].body.statements[0].consequent.statements[0];
    strictEqual(node.type, 'Identifier');
    ok(isImplicitlyReturned(node));
  });

  it('is false for a `try` statement', function() {
    const node = parse('->\n  try\n    a').body.statements[0].body.statements[0];
    strictEqual(node.type, 'Try');
    ok(!isImplicitlyReturned(node));
  });

  it('is true for the last expression of a `try` body that is the last statement in a function', function() {
    const node = parse('->\n  try\n    a').body.statements[0].body.statements[0].body.statements[0];
    strictEqual(node.type, 'Identifier');
    ok(isImplicitlyReturned(node));
  });

  it('is false for the catch assignee of a `try` that is the last statement in a function', function() {
    const node = parse('->\n  try\n    a\n  catch err').body.statements[0].body.statements[0].catchAssignee;
    strictEqual(node.type, 'Identifier');
    ok(!isImplicitlyReturned(node));
  });

  it('is true for the last expression of a `try` catch body that is the last statement in a function', function() {
    const node = parse('->\n  try\n    a\n  catch\n    b').body.statements[0].body.statements[0].catchBody.statements[0];
    strictEqual(node.type, 'Identifier');
    ok(isImplicitlyReturned(node));
  });

  it('is true for the last expression of a `try` finally body that is the last statement in a function', function() {
    const node = parse('->\n  try\n    a\n  finally\n    b').body.statements[0].body.statements[0].finallyBody.statements[0];
    strictEqual(node.type, 'Identifier');
    ok(isImplicitlyReturned(node));
  });

  it('is false for the last expression of a class constructor method', function() {
    const node = parse('class A\n  constructor: ->\n    @a = 1').body.statements[0].body.statements[0].expression.body.statements[0];
    strictEqual(node.type, 'AssignOp');
    ok(!isImplicitlyReturned(node));
  });

  it('is false for the single expression of a block-less class constructor method', function() {
    const node = parse('class A\n  constructor: -> @a = 1').body.statements[0].body.statements[0].expression.body;
    strictEqual(node.type, 'AssignOp');
    ok(!isImplicitlyReturned(node));
  });

  it('is false for a `throw` statement as the last statement of a function block', function() {
    const node = parse('->\n  throw 1').body.statements[0].body.statements[0];
    strictEqual(node.type, 'Throw');
    ok(!isImplicitlyReturned(node));
  });

  it('is false for `switch` statements', function() {
    const node = parse('->\n  switch 1\n    when 2 then 3').body.statements[0].body.statements[0];
    strictEqual(node.type, 'Switch');
    ok(!isImplicitlyReturned(node));
  });

  it('is true for the non-block consequent of a `switch` case', function() {
    const node = parse('->\n  switch 1\n    when 2 then 3').body.statements[0].body.statements[0].cases[0].consequent;
    strictEqual(node.type, 'Int');
    strictEqual(node.data, 3);
    ok(isImplicitlyReturned(node));
  });

  it('is true for the last statement in a `case` block', function() {
    const node = parse('->\n  switch 1\n    when 2\n      3').body.statements[0].body.statements[0].cases[0].consequent.statements[0];
    strictEqual(node.type, 'Int');
    strictEqual(node.data, 3);
    ok(isImplicitlyReturned(node));
  });

  it('is false for the non-block consequent of a `case` when the `switch` is not the last statement in a function', function() {
    const node = parse('switch 1\n  when 2 then 3').body.statements[0].cases[0].consequent;
    strictEqual(node.type, 'Int');
    strictEqual(node.data, 3);
    ok(!isImplicitlyReturned(node));
  });

  it('is false for the last statement in a `case` block when the `switch` is not the last statement in a function', function() {
    const node = parse('switch 1\n  when 2\n    3').body.statements[0].cases[0].consequent.statements[0];
    strictEqual(node.type, 'Int');
    strictEqual(node.data, 3);
    ok(!isImplicitlyReturned(node));
  });

  it('is true for the non-block alternate of a `switch`', function() {
    const node = parse('->\n  switch 1\n    when 2\n      3\n    else 4').body.statements[0].body.statements[0].alternate;
    strictEqual(node.type, 'Int');
    strictEqual(node.data, 4);
    ok(isImplicitlyReturned(node));
  });
});
