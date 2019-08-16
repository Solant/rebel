import { compile } from './compiler';

console.log(compile(
    `
    default struct TwoNumbers {
        num1: i32le;
        num2: i32le;
    }
    `
));
