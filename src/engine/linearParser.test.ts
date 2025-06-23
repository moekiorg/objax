import { describe, expect, it } from 'vitest';
import { LinearObjaxParser } from './linearParser';

describe('LinearObjaxParser', () => {
  it('should create a simple class definition with new syntax', () => {
    const parser = new LinearObjaxParser();
    const code = 'Task is a Class\nTask has field "title"';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe('Task');
    expect(result.classes[0].fields).toHaveLength(1);
    expect(result.classes[0].fields[0].name).toBe('title');
  });

  it('should create a field with defineField syntax', () => {
    const parser = new LinearObjaxParser();
    const code = 'Task is a Class\nTask defineField with name "title"';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].fields).toHaveLength(1);
    expect(result.classes[0].fields[0].name).toBe('title');
  });

  it('should create a field with defineField syntax and default value', () => {
    const parser = new LinearObjaxParser();
    const code = 'Task is a Class\nTask defineField with name "done" and default false';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].fields).toHaveLength(1);
    expect(result.classes[0].fields[0].name).toBe('done');
    expect(result.classes[0].fields[0].defaultValue).toBe(false);
  });

  it('should create a field with default value', () => {
    const parser = new LinearObjaxParser();
    const code = 'Task is a Class\nTask has field "done" has default false';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].fields).toHaveLength(1);
    expect(result.classes[0].fields[0].name).toBe('done');
    expect(result.classes[0].fields[0].defaultValue).toBe(false);
  });

  it('should create a method definition with new syntax', () => {
    const parser = new LinearObjaxParser();
    const code =
      'Task is a Class\nTask has method "complete" do self.done is true';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].methods).toHaveLength(1);
    expect(result.classes[0].methods[0].name).toBe('complete');
    expect(result.classes[0].methods[0].body).toBe('self.done is true');
  });

  it('should create a method with defineMethod syntax', () => {
    const parser = new LinearObjaxParser();
    const code =
      'Task is a Class\nTask defineMethod "complete" do {self.done is true}';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].methods).toHaveLength(1);
    expect(result.classes[0].methods[0].name).toBe('complete');
    expect(result.classes[0].methods[0].body).toBe('self.done is true');
  });

  it('should create a method with defineMethod syntax and parameters', () => {
    const parser = new LinearObjaxParser();
    const code =
      'Task is a Class\nTask defineMethod "setTitle" with "newTitle" do {self.title is newTitle}';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].methods).toHaveLength(1);
    expect(result.classes[0].methods[0].name).toBe('setTitle');
    expect(result.classes[0].methods[0].parameters).toEqual(['newTitle']);
    expect(result.classes[0].methods[0].body).toBe('self.title is newTitle');
  });

  it('should create a new instance', () => {
    const parser = new LinearObjaxParser();
    const code = 'myTask is a Task';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].name).toBe('myTask');
    expect(result.instances[0].className).toBe('Task');
  });

  it('should handle complex class with fields, methods and instances', () => {
    const parser = new LinearObjaxParser();
    const code = `Task is a Class
Task has field "title"
Task has field "done" has default false
Task has method "complete" do self.done is true
myTask is a Task`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe('Task');
    expect(result.classes[0].fields).toHaveLength(2);
    expect(result.classes[0].methods).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].name).toBe('myTask');
    expect(result.instances[0].className).toBe('Task');
  });

  it('should handle multiple classes and instances', () => {
    const parser = new LinearObjaxParser();
    const code = `Task is a Class
Task has field "title"
User is a Class  
User has field "name"
myTask is a Task
myUser is a User`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(2);
    expect(result.instances).toHaveLength(2);
    expect(result.classes.map((c) => c.name)).toEqual(['Task', 'User']);
    expect(result.instances.map((i) => i.name)).toEqual(['myTask', 'myUser']);
  });

  it('should parse method call statements', () => {
    const parser = new LinearObjaxParser();
    const code = `Task is a Class
Task has method "complete" do self.done is true
myTask is a Task
myTask complete`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    expect(result.methodCalls).toHaveLength(1);

    const methodCall = result.methodCalls[0];
    expect(methodCall.methodName).toBe('complete');
    expect(methodCall.instanceName).toBe('myTask');
  });

  it('should parse messaging syntax with parameters', () => {
    const parser = new LinearObjaxParser();
    const code = `Task is a Class
Task has method "setTitle" with "title" do set field "title" of myself to "title"
myTask is a Task
myTask setTitle "New Title"`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.methodCalls).toHaveLength(1);

    const methodCall = result.methodCalls[0];
    expect(methodCall.methodName).toBe('setTitle');
    expect(methodCall.instanceName).toBe('myTask');
    expect(methodCall.parameters).toEqual(['New Title']);
  });

  it('should parse page navigation with world goto', () => {
    const parser = new LinearObjaxParser();
    const code = `world goto with page "HomePage"`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.methodCalls).toHaveLength(1);

    const methodCall = result.methodCalls[0];
    expect(methodCall.instanceName).toBe('world');
    expect(methodCall.methodName).toBe('goto');
    expect(methodCall.keywordParameters?.page).toBe('HomePage');
  });

  it('should parse method with parameters', () => {
    const parser = new LinearObjaxParser();
    const code =
      'TaskList is a Class\nTaskList has method "add" with "title" do self.count is 1';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].methods).toHaveLength(1);

    const method = result.classes[0].methods[0];
    expect(method.name).toBe('add');
    expect(method.parameters).toEqual(['title']);
    expect(method.body).toBe('self.count is 1');
  });

  it('should parse instance creation with keyword arguments', () => {
    const parser = new LinearObjaxParser();
    const code = 'newTask is a Task with title "My Title" and done false';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);

    const instance = result.instances[0];
    expect(instance.name).toBe('newTask');
    expect(instance.className).toBe('Task');
    expect(instance.properties.title).toBe('My Title');
    expect(instance.properties.done).toBe(false);
  });

  it('should parse list operations', () => {
    const parser = new LinearObjaxParser();
    const code = 'add "My Task" to "items" of myself';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.listOperations).toHaveLength(1);

    const listOp = result.listOperations[0];
    expect(listOp.operation).toBe('add');
    expect(listOp.item).toBe('My Task');
    expect(listOp.listField).toBe('items');
    expect(listOp.targetInstance).toBe('myself');
  });

  it('should parse variable assignments', () => {
    const parser = new LinearObjaxParser();
    const code = 'currentTitle is "Hello World"';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.variableAssignments).toHaveLength(1);

    const assignment = result.variableAssignments[0];
    expect(assignment.variableName).toBe('currentTitle');
    expect(assignment.value).toBe('"Hello World"');
    expect(assignment.type).toBe('primitive');
  });

  it('should parse DatabaseMorph with source', () => {
    const parser = new LinearObjaxParser();
    const code = `myTasks is a TaskList
myTaskListView is a new DatabaseMorph with source myTasks`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(2);

    const dbInstance = result.instances.find(
      (i) => i.name === 'myTaskListView',
    );
    expect(dbInstance).toBeDefined();
    expect(dbInstance?.className).toBe('DatabaseMorph');
    expect(dbInstance?.properties.source).toBe('myTasks');
  });

  it('should parse print statements', () => {
    const parser = new LinearObjaxParser();
    const code = `print "Hello World"
print Debug message
print "Another string"`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.printStatements).toHaveLength(3);

    const prints = result.printStatements;
    expect(prints[0].message).toBe('Hello World');
    expect(prints[1].message).toBe('Debug message');
    expect(prints[2].message).toBe('Another string');

    // Check timestamps are set
    expect(prints[0].timestamp).toBeDefined();
    expect(prints[1].timestamp).toBeDefined();
    expect(prints[2].timestamp).toBeDefined();
  });

  it('should parse method calls with parameters', () => {
    const parser = new LinearObjaxParser();
    const code = `myTasks add "タスク"
myObject update "param1" 42`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.methodCalls).toHaveLength(2);

    const call1 = result.methodCalls[0];
    expect(call1.methodName).toBe('add');
    expect(call1.instanceName).toBe('myTasks');
    expect(call1.parameters).toEqual(['タスク']);

    const call2 = result.methodCalls[1];
    expect(call2.methodName).toBe('update');
    expect(call2.instanceName).toBe('myObject');
    expect(call2.parameters).toEqual(['param1', 42]);
  });

  it('should parse the complex TaskList example', () => {
    const parser = new LinearObjaxParser();
    const code = `TaskList is a Class
TaskList has field "items" has default []
TaskList has method "add" with "title" do newTask is a Task with title and add newTask to "items" of myself

Task is a Class
Task has field "title"

myTaskList is a TaskList`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);

    // Check classes
    expect(result.classes).toHaveLength(2);
    const taskListClass = result.classes.find((c) => c.name === 'TaskList');
    const taskClass = result.classes.find((c) => c.name === 'Task');

    expect(taskListClass).toBeDefined();
    expect(taskClass).toBeDefined();

    // Check TaskList method with parameter
    expect(taskListClass?.methods).toHaveLength(1);
    expect(taskListClass?.methods[0].name).toBe('add');
    expect(taskListClass?.methods[0].parameters).toEqual(['title']);

    // Check instances
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].name).toBe('myTaskList');
    expect(result.instances[0].className).toBe('TaskList');
  });

  it('should parse State class creation with keyword arguments', () => {
    const parser = new LinearObjaxParser();
    const code = 'score is a State with name "score" and value 0';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);

    const instance = result.instances[0];
    expect(instance.name).toBe('score');
    expect(instance.className).toBe('State');
    expect(instance.properties.name).toBe('score');
    expect(instance.properties.value).toBe(0);
  });

  it('should parse State method calls for set and get', () => {
    const parser = new LinearObjaxParser();
    const code = `score is a State with name "score"
score set 100
score get`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    expect(result.methodCalls).toHaveLength(2);

    const setCal = result.methodCalls[0];
    expect(setCal.methodName).toBe('set');
    expect(setCal.instanceName).toBe('score');
    expect(setCal.parameters).toEqual([100]);

    const getCall = result.methodCalls[1];
    expect(getCall.methodName).toBe('get');
    expect(getCall.instanceName).toBe('score');
    expect(getCall.parameters).toBeUndefined();
  });

  it('should parse instance creation with multiple keyword arguments', () => {
    const parser = new LinearObjaxParser();
    const code =
      'person is a Person with name "John" and age 30 and active true';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);

    const instance = result.instances[0];
    expect(instance.name).toBe('person');
    expect(instance.className).toBe('Person');
    expect(instance.properties.name).toBe('John');
    expect(instance.properties.age).toBe(30);
    expect(instance.properties.active).toBe(true);
  });

  it('should parse instance creation with single keyword argument', () => {
    const parser = new LinearObjaxParser();
    const code = 'counter is a Counter with value 5';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);

    const instance = result.instances[0];
    expect(instance.name).toBe('counter');
    expect(instance.className).toBe('Counter');
    expect(instance.properties.value).toBe(5);
  });

  it('should parse Timer instance creation', () => {
    const parser = new LinearObjaxParser();
    const code = 'timer is a Timer';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);

    const instance = result.instances[0];
    expect(instance.name).toBe('timer');
    expect(instance.className).toBe('Timer');
  });

  it('should parse timer repeat with time and action', () => {
    const parser = new LinearObjaxParser();
    const code = 'timer repeat with time "1 second" and action "allGrow"';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.methodCalls).toHaveLength(1);

    const methodCall = result.methodCalls[0];
    expect(methodCall.instanceName).toBe('timer');
    expect(methodCall.methodName).toBe('repeat');
    expect(methodCall.keywordParameters?.time).toBe('1 second');
    expect(methodCall.keywordParameters?.action).toBe('allGrow');
  });

  it('should parse doAll with action', () => {
    const parser = new LinearObjaxParser();
    const code = 'Seed doAll with action "grow"';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.methodCalls).toHaveLength(1);

    const methodCall = result.methodCalls[0];
    expect(methodCall.instanceName).toBe('Seed');
    expect(methodCall.methodName).toBe('doAll');
    expect(methodCall.keywordParameters?.action).toBe('grow');
  });

  it('should parse block assignment', () => {
    const parser = new LinearObjaxParser();
    const code = 'grow is (self.size is self.size + 1)';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);

    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('grow');
    expect(blockAssignment.blockBody).toBe('self.size is self.size + 1');
  });

  it('should parse complex block assignment', () => {
    const parser = new LinearObjaxParser();
    const code = 'allGrow is (Seed doAll with action "grow")';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);

    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('allGrow');
    expect(blockAssignment.blockBody).toBe('Seed doAll with action "grow"');
  });

  it('should parse the complete Timer, doAll and block example', () => {
    const parser = new LinearObjaxParser();
    const code = `timer is a Timer
grow is (self.size is self.size + 1)
allGrow is (Seed doAll with action "grow")
timer repeat with time "1 second" and action "allGrow"`;

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    expect(result.blockAssignments).toHaveLength(2);
    expect(result.methodCalls).toHaveLength(1);

    // Check timer instance
    expect(result.instances[0].name).toBe('timer');
    expect(result.instances[0].className).toBe('Timer');

    // Check block assignments
    expect(result.blockAssignments[0].blockName).toBe('grow');
    expect(result.blockAssignments[0].blockBody).toBe(
      'self.size is self.size + 1',
    );

    expect(result.blockAssignments[1].blockName).toBe('allGrow');
    expect(result.blockAssignments[1].blockBody).toBe(
      'Seed doAll with action "grow"',
    );

    // Check timer repeat method call
    const methodCall = result.methodCalls[0];
    expect(methodCall.instanceName).toBe('timer');
    expect(methodCall.methodName).toBe('repeat');
    expect(methodCall.keywordParameters?.time).toBe('1 second');
    expect(methodCall.keywordParameters?.action).toBe('allGrow');
  });

  it('should parse modern add with child syntax', () => {
    const parser = new LinearObjaxParser();
    const code = 'myGroup add myButton';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.morphOperations).toHaveLength(1);
    
    const morphOp = result.morphOperations[0];
    expect(morphOp.operation).toBe('add');
    expect(morphOp.parentInstance).toBe('myGroup');
    expect(morphOp.childInstance).toBe('myButton');
  });

  it('should parse legacy include with child syntax', () => {
    const parser = new LinearObjaxParser();
    const code = 'myGroup include with child myButton';

    const result = parser.parse(code);
    expect(result.errors).toHaveLength(0);
    expect(result.morphOperations).toHaveLength(1);
    
    const morphOp = result.morphOperations[0];
    expect(morphOp.operation).toBe('add');
    expect(morphOp.parentInstance).toBe('myGroup');
    expect(morphOp.childInstance).toBe('myButton');
  });
});
