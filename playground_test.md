# Playground Test Cases

## Test 1: Create FieldMorph and call add method

```objax
title is a new FieldMorph
call "add" on title with "Hello World"
```

Expected result:
- One FieldMorph instance named "title" should appear on canvas
- The value of the field should be "Hello World"

## Test 2: Create multiple instances

```objax
title is a new FieldMorph
button is a new ButtonMorph
call "add" on title with "Test Value"
```

Expected result:
- Two instances should appear on canvas
- FieldMorph should have value "Test Value"
- ButtonMorph should have default label

## Debugging Steps

1. Check if instances are created in the store
2. Check if method calls are executed 
3. Check if the updated instances are displayed on canvas
4. Check console for any errors