// Simple test to check TaskList parsing
import { LinearObjaxParser } from './src/engine/linearParser.js';

const parser = new LinearObjaxParser();
const code = `define TaskList
TaskList has field "items" has default []
TaskList has method "add" with "title" do add title to "items" of myself`;

console.log('Testing TaskList definition...');
const result = parser.parse(code);

console.log('Errors:', result.errors);
console.log('Classes:', JSON.stringify(result.classes, null, 2));
console.log('Methods in TaskList:');
if (result.classes.length > 0) {
  const taskListClass = result.classes[0];
  taskListClass.methods.forEach(method => {
    console.log(`  - ${method.name}: "${method.body}"`);
  });
}