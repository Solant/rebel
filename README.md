# bimo
Binary file description language inspired by [Kaitai Struct](https://kaitai.io/) with some new key features:
* Support of both read and write operations
* Separate language for data description

## Example
[Online version](https://bimo-online.netlify.com/)

BiMo is a compiler from DSL to target language that lets you read data from a stream, modify it and write back. Compiler produces sources for minimal runtime and structure declarations (see [online version](https://bimo-online.netlify.com/) for output example).

## File structure description

### Structures
File contains several structure declarations in next format:
* simple
```
struct TwoNumbers {
  num1: i32;
  num2: i32;
}
```
* and default
```
default struct MainStructure {
  numbers: TwoNumbers;
}
```
exactly one default structure is required for a file, as it will be used to generate public `read` and `write` functions.

### Fields
Structures can define several fields in next format: `<fieldName>: <type>;`. All fields with the exception of dependant fields will be generated in output code, for example:
```
default struct MainStruct {
  myField: i32;
}
```
will generate this TypeScript code:
```
interface MainStruct {
  myField: i32;
}
readMainStruct(...) {
  let object = .....;
  object.myField = <read 32 bit value>
}
```

### Simple Types
| BiMo type | C++ type|
|-----------|--------|
| i8        | int8_t |
| i16       | int16_t|
| i32       | int32_t|
| i64       | int64_t|
| u8        |uint8_t |
| u16       |uint16_t|
| u32       |uint32_t|
| u64       |uint64_t|

### Arrays
Some binary data might require dynamic arrays support, for this case type `array` is available:
```
default struct ArrayStruct {
    length: i32;
    data: array<i32, #length>;
}
```
Where first type argument is array item type `i32`, and second is field reference starting with hash `#length`. It will generate array of 32-bit integers with a length of previosly read field `length`. Field `length` will be marked as private and won't be available for direct read or write on generated classes, instead BiMo will use temporary varialbe during read operations and actual array length during writes.
